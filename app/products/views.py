"""
products/views.py
=================
Las Views son las funciones (o clases) que reciben una petición HTTP
y devuelven una respuesta JSON.

Usamos "Class-Based Views" de DRF (Django REST Framework):
  - ListAPIView    → GET de una lista (todos los productos)
  - RetrieveAPIView → GET de un solo elemento (un producto por ID)

Flujo de una petición:
  Navegador → URL → View → Queryset → Serializer → JSON → Navegador

Filtros disponibles en /api/products/:
  ?type=course|book
  ?level=beginner|intermediate|advanced
  ?language=spanish|english
  ?category__name=Python
  ?is_featured=true
  ?search=texto       ← busca en título, autor y descripción
  ?ordering=price     ← ordena por precio (- para descendente: ?ordering=-price)
"""

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BookDownload, Category, CourseCertificate, CourseProgress, Product
from .serializers import (
    BookDownloadPolicySerializer,
    CategorySerializer,
    CourseProgressSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductPreviewSerializer,
)
from .services import generate_course_certificate


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        # Solo mostrar categorías con al menos 1 producto activo.
        # Evita categorías huérfanas en el frontend (ej: "Testing QA" sin contenido).
        return (
            Category.objects
            .annotate(active_products=Count('products', filter=Q(products__is_active=True)))
            .filter(active_products__gt=0)
            .order_by('name')
        )


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'level', 'language', 'is_featured', 'is_new', 'category__name']
    search_fields = ['title', 'author', 'description']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-is_featured', '-created_at']

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category')


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related('category')
            .prefetch_related('chapters', 'table_of_contents')
        )


class ProductPreviewView(generics.RetrieveAPIView):
    serializer_class = ProductPreviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .prefetch_related('chapters', 'table_of_contents')
        )


class BookDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk, is_active=True, type=Product.TYPE_BOOK)

        if not request.user.purchased_products.filter(pk=product.pk).exists():
            return Response({'detail': 'No tienes acceso a este libro.'}, status=status.HTTP_403_FORBIDDEN)

        if not product.book_file:
            return Response({'detail': 'Este libro no tiene archivo disponible.'}, status=status.HTTP_404_NOT_FOUND)

        policy, _ = BookDownload.objects.get_or_create(user=request.user, product=product)
        if policy.download_count >= policy.max_downloads:
            return Response(
                {'detail': 'Has alcanzado el límite de descargas para este libro.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        policy.download_count += 1
        policy.last_downloaded_at = timezone.now()
        policy.save(update_fields=['download_count', 'last_downloaded_at', 'updated_at'])

        response = FileResponse(product.book_file.open('rb'), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{product.book_file.name.split("/")[-1]}"'
        return response


class BookDownloadStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk, is_active=True, type=Product.TYPE_BOOK)

        if not request.user.purchased_products.filter(pk=product.pk).exists():
            return Response({'detail': 'No tienes acceso a este libro.'}, status=status.HTTP_403_FORBIDDEN)

        policy, _ = BookDownload.objects.get_or_create(user=request.user, product=product)
        return Response(BookDownloadPolicySerializer(policy).data)


class CourseProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get_course(self, request, pk):
        course = get_object_or_404(Product, pk=pk, is_active=True, type=Product.TYPE_COURSE)
        if not request.user.purchased_products.filter(pk=course.pk).exists():
            return None
        return course

    def get(self, request, pk):
        course = self.get_course(request, pk)
        if not course:
            return Response({'detail': 'No tienes acceso a este curso.'}, status=status.HTTP_403_FORBIDDEN)

        progress, _ = CourseProgress.objects.get_or_create(user=request.user, product=course)
        progress.recalculate_progress()
        return Response(CourseProgressSerializer(progress).data)


class CourseCompleteChapterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        course = get_object_or_404(Product, pk=pk, is_active=True, type=Product.TYPE_COURSE)

        if not request.user.purchased_products.filter(pk=course.pk).exists():
            return Response({'detail': 'No tienes acceso a este curso.'}, status=status.HTTP_403_FORBIDDEN)

        chapter_id = request.data.get('chapter_id')
        if not chapter_id:
            return Response({'detail': 'chapter_id es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        chapter = get_object_or_404(course.chapters, pk=chapter_id)
        progress, _ = CourseProgress.objects.get_or_create(user=request.user, product=course)
        progress.completed_chapters.add(chapter)
        progress.current_chapter = chapter
        progress.save(update_fields=['current_chapter', 'updated_at'])
        progress.recalculate_progress()

        certificate_issued = False
        if progress.progress_percentage >= 100:
            generate_course_certificate(request.user, course)
            certificate_issued = True

        data = CourseProgressSerializer(progress).data
        data['certificate_issued'] = certificate_issued
        return Response(data)


class CourseCertificateDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        course = get_object_or_404(Product, pk=pk, is_active=True, type=Product.TYPE_COURSE)
        if not request.user.purchased_products.filter(pk=course.pk).exists():
            return Response({'detail': 'No tienes acceso a este curso.'}, status=status.HTTP_403_FORBIDDEN)

        progress, _ = CourseProgress.objects.get_or_create(user=request.user, product=course)
        progress.recalculate_progress()
        if progress.progress_percentage < 100:
            return Response(
                {'detail': 'Debes completar el 100% del curso para descargar el certificado.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        certificate = CourseCertificate.objects.filter(user=request.user, product=course).first()
        if not certificate:
            certificate = generate_course_certificate(request.user, course)

        if not certificate.pdf_file:
            return Response({'detail': 'No se pudo generar el certificado.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = FileResponse(certificate.pdf_file.open('rb'), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{certificate.pdf_file.name.split("/")[-1]}"'
        return response
