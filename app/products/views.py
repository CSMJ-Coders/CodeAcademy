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

from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer


class CategoryListView(generics.ListAPIView):
    """
    GET /api/categories/
    Devuelve todas las categorías de una vez (sin paginación).
    Son pocos registros y el frontend las necesita todas para el menú.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Sin paginación → devuelve un array directo, no { results: [...] }


class ProductListView(generics.ListAPIView):
    """
    GET /api/products/
    Devuelve la lista paginada de productos activos con soporte de filtros.

    filter_backends: lista de "procesadores" que se aplican al queryset.
      - DjangoFilterBackend: filtra por campos exactos (?type=course)
      - SearchFilter: búsqueda de texto libre (?search=python)
      - OrderingFilter: permite ordenar (?ordering=price)

    filterset_fields: campos que se pueden filtrar con igualdad exacta.
    search_fields: campos donde busca el texto de ?search=
    ordering_fields: campos por los que se puede ordenar.
    """
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'level', 'language', 'is_featured', 'is_new', 'category__name']
    search_fields = ['title', 'author', 'description']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-is_featured', '-created_at']  # orden por defecto

    def get_queryset(self):
        # Solo productos activos + JOIN con categoría en una sola consulta SQL
        # select_related('category') evita el problema N+1:
        # sin él Django haría 1 query por producto para traer su categoría.
        # con él hace 1 sola query con JOIN → mucho más eficiente.
        return Product.objects.filter(is_active=True).select_related('category')


class ProductDetailView(generics.RetrieveAPIView):
    """
    GET /api/products/<id>/
    Devuelve un producto con todos sus datos: capítulos y/o tabla de contenidos.
    Si el producto no existe o está inactivo → 404.
    """
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related('category')
            # prefetch_related para relaciones inversas (muchos a uno):
            # trae todos los capítulos y TOC en queries separadas pero eficientes
            .prefetch_related('chapters', 'table_of_contents')
        )



class CategoryListView(generics.ListAPIView):
    """GET /api/categories/ — list all categories (no pagination)."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None  # categories are few — return them all at once


class ProductListView(generics.ListAPIView):
    """GET /api/products/ — list active products with filtering & search."""
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
    """GET /api/products/<id>/ — single product with chapters / TOC."""
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related('category')
            .prefetch_related('chapters', 'table_of_contents')
        )
