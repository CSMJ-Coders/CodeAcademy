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
from .models import Category, Product, Chapter, TableOfContentsEntry


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
        fields = ['id', 'order', 'title', 'duration', 'video_url']


class TableOfContentsEntrySerializer(serializers.ModelSerializer):
    """Convierte una entrada del índice de libro a JSON."""
    class Meta:
        model = TableOfContentsEntry
        fields = ['order', 'entry']


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



class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['id', 'order', 'title', 'duration', 'video_url']


class TableOfContentsEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TableOfContentsEntry
        fields = ['order', 'entry']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list/catalog views."""
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
    """Full serializer for product detail view (includes chapters / TOC)."""
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
