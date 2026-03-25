"""
products/serializers.py
=======================
Los serializers convierten objetos Python (modelos Django) a JSON
que el frontend puede leer, y viceversa.

Piénsalos como "traductores":
  Base de datos  →  Serializer  →  JSON  →  Frontend (React)
  Frontend       →  Serializer  →  Python  →  Base de datos

Tenemos dos serializers de Product:
  - ProductListSerializer  → versión ligera para el catálogo (sin capítulos)
  - ProductDetailSerializer → versión completa para la página de detalle
"""

from rest_framework import serializers
from .models import (
    Category,
    Product,
    Chapter,
    TableOfContentsEntry,
    BookDownload,
    CourseProgress,
)


class CategorySerializer(serializers.ModelSerializer):
    """
    Convierte un objeto Category a JSON.
    ModelSerializer genera automáticamente los campos del modelo.
    Solo necesitamos decirle qué campos incluir con 'fields'.
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']


class ChapterSerializer(serializers.ModelSerializer):
    """Convierte un capítulo de curso a JSON."""
    class Meta:
        model = Chapter
        fields = ['id', 'order', 'title', 'duration', 'video_url', 'is_preview']


class TableOfContentsEntrySerializer(serializers.ModelSerializer):
    """Convierte una entrada del índice de libro a JSON."""
    class Meta:
        model = TableOfContentsEntry
        fields = ['order', 'entry', 'is_preview']


class ProductListSerializer(serializers.ModelSerializer):
    """
    Versión LIGERA de Product para el listado del catálogo.
    NO incluye capítulos ni índice → respuesta más rápida.
    'category' usa CategorySerializer anidado → devuelve el objeto completo
    en vez de solo el ID numérico.
    """
    # read_only=True: este campo solo se usa al LEER (GET), no al escribir (POST/PUT)
    category = CategorySerializer(read_only=True)
    original_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, allow_null=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'type', 'category', 'author',
            'description', 'price', 'original_price',
            'level', 'language', 'image', 'rating',
            'duration', 'pages',
            'is_new', 'is_featured',
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Versión COMPLETA de Product para la página de detalle.
    Incluye capítulos (para cursos) y tabla de contenidos (para libros).
    many=True indica que es una lista de objetos relacionados.
    """
    category = CategorySerializer(read_only=True)
    chapters = ChapterSerializer(many=True, read_only=True)
    table_of_contents = TableOfContentsEntrySerializer(many=True, read_only=True)
    original_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, allow_null=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'type', 'category', 'author',
            'description', 'price', 'original_price',
            'level', 'language', 'image', 'rating',
            'duration', 'pages',
            'is_new', 'is_featured',
            'chapters', 'table_of_contents',
            'created_at', 'updated_at',
        ]


class ProductPreviewSerializer(serializers.ModelSerializer):
    """Preview público: solo contenido marcado como muestra."""

    preview_chapters = serializers.SerializerMethodField()
    preview_table_of_contents = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'type',
            'author',
            'description',
            'preview_chapters',
            'preview_table_of_contents',
        ]

    def get_preview_chapters(self, obj):
        chapters = obj.chapters.filter(is_preview=True).order_by('order')
        return ChapterSerializer(chapters, many=True).data

    def get_preview_table_of_contents(self, obj):
        toc = obj.table_of_contents.filter(is_preview=True).order_by('order')
        return TableOfContentsEntrySerializer(toc, many=True).data


class BookDownloadPolicySerializer(serializers.ModelSerializer):
    """Estado de descargas disponibles para un libro comprado."""

    book_id = serializers.IntegerField(source='product_id', read_only=True)
    downloads_remaining = serializers.SerializerMethodField()

    class Meta:
        model = BookDownload
        fields = ['book_id', 'download_count', 'max_downloads', 'downloads_remaining', 'last_downloaded_at']

    def get_downloads_remaining(self, obj):
        return max(obj.max_downloads - obj.download_count, 0)


class CourseProgressSerializer(serializers.ModelSerializer):
    """Respuesta persistente de progreso por curso."""

    course_id = serializers.IntegerField(source='product_id', read_only=True)
    completed_chapters = serializers.SerializerMethodField()
    current_chapter = serializers.SerializerMethodField()

    class Meta:
        model = CourseProgress
        fields = ['course_id', 'progress_percentage', 'completed_chapters', 'current_chapter', 'updated_at']

    def get_completed_chapters(self, obj):
        return [str(ch_id) for ch_id in obj.completed_chapters.values_list('id', flat=True)]

    def get_current_chapter(self, obj):
        return str(obj.current_chapter_id) if obj.current_chapter_id else None
