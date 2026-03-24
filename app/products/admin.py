"""
products/admin.py
=================
Registra los modelos en el panel de administración de Django (/admin/).
El admin nos permite gestionar productos, categorías y capítulos
directamente desde una interfaz web sin escribir código.

Conceptos clave:
  - @admin.register(Model): decorador que registra el modelo
  - ModelAdmin: clase que configura cómo se muestra el modelo en el admin
  - TabularInline: permite editar modelos relacionados en la misma página
"""

from django.contrib import admin
from .models import Category, Product, Chapter, TableOfContentsEntry


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    # list_display: columnas visibles en la lista del admin
    list_display = ['id', 'name', 'icon']
    # search_fields: activa el buscador en el admin
    search_fields = ['name']


class ChapterInline(admin.TabularInline):
    """
    Inline = editar capítulos DENTRO de la página de un producto.
    No tienes que ir a otra página para agregar capítulos.
    """
    model = Chapter
    extra = 1  # Muestra 1 fila vacía lista para agregar
    fields = ['order', 'title', 'duration', 'video_url']


class TableOfContentsInline(admin.TabularInline):
    """Igual que ChapterInline pero para entradas del índice de libros."""
    model = TableOfContentsEntry
    extra = 1
    fields = ['order', 'entry']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Columnas visibles en la lista de productos
    list_display = ['id', 'title', 'type', 'category', 'price', 'rating', 'is_featured', 'is_active']
    # Filtros en la barra lateral derecha
    list_filter = ['type', 'level', 'language', 'is_featured', 'is_new', 'is_active', 'category']
    # Buscador por estos campos
    search_fields = ['title', 'author', 'description']
    # Campos editables directamente desde la lista (sin abrir el producto)
    list_editable = ['is_featured', 'is_active']
    # Agrega los inlines al formulario del producto
    inlines = [ChapterInline, TableOfContentsInline]
