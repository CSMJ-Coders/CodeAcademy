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
from .models import (
    Category,
    Product,
    Chapter,
    TableOfContentsEntry,
    BookDownload,
    CourseProgress,
    CourseCertificate,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    # list_display: columnas visibles en la lista del admin
    list_display = ['id', 'name', 'icon']
    # search_fields: activa el buscador en el admin
    search_fields = ['name']
    ordering = ['name']


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'order', 'title', 'duration', 'is_preview']
    list_filter = ['is_preview', 'product__type']
    search_fields = ['title', 'product__title']
    autocomplete_fields = ['product']
    ordering = ['product', 'order']


class ChapterInline(admin.TabularInline):
    """
    Inline = editar capítulos DENTRO de la página de un producto.
    No tienes que ir a otra página para agregar capítulos.
    """
    model = Chapter
    extra = 0
    fields = ['order', 'title', 'duration', 'video_url']
    ordering = ['order']


class TableOfContentsInline(admin.TabularInline):
    """Igual que ChapterInline pero para entradas del índice de libros."""
    model = TableOfContentsEntry
    extra = 0
    fields = ['order', 'entry']
    ordering = ['order']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Columnas visibles en la lista de productos
    list_display = ['id', 'title', 'type', 'category', 'price', 'rating', 'status_badge', 'is_featured', 'is_active']
    # Filtros en la barra lateral derecha
    list_filter = ['type', 'level', 'language', 'is_featured', 'is_new', 'is_active', 'category']
    # Buscador por estos campos
    search_fields = ['title', 'author', 'description']
    # Campos editables directamente desde la lista (sin abrir el producto)
    list_editable = ['is_featured', 'is_active']
    # Agrega los inlines al formulario del producto
    inlines = [ChapterInline, TableOfContentsInline]
    autocomplete_fields = ['category']
    ordering = ['-is_featured', '-created_at']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información principal', {
            'fields': ('title', 'type', 'category', 'author', 'description', 'image', 'book_file')
        }),
        ('Precio y metadatos', {
            'fields': ('price', 'original_price', 'rating', 'level', 'language', 'duration', 'pages')
        }),
        ('Publicación', {
            'fields': ('is_new', 'is_featured', 'is_active')
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    actions = ['publish_products', 'unpublish_products', 'feature_products', 'unfeature_products']

    @admin.display(boolean=True, description='Estado')
    def status_badge(self, obj):
        return obj.is_active

    @admin.action(description='Publicar productos seleccionados')
    def publish_products(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description='Despublicar productos seleccionados')
    def unpublish_products(self, request, queryset):
        queryset.update(is_active=False)

    @admin.action(description='Marcar como destacados')
    def feature_products(self, request, queryset):
        queryset.update(is_featured=True)

    @admin.action(description='Quitar destacados')
    def unfeature_products(self, request, queryset):
        queryset.update(is_featured=False)


@admin.register(BookDownload)
class BookDownloadAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'download_count', 'max_downloads', 'last_downloaded_at']
    list_filter = ['product']
    search_fields = ['user__email', 'product__title']
    autocomplete_fields = ['user', 'product']


@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'progress_percentage', 'updated_at']
    list_filter = ['product']
    search_fields = ['user__email', 'product__title']
    filter_horizontal = ['completed_chapters']
    autocomplete_fields = ['user', 'product', 'current_chapter']


@admin.register(CourseCertificate)
class CourseCertificateAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'issued_at']
    list_filter = ['product']
    search_fields = ['user__email', 'product__title']
    autocomplete_fields = ['user', 'product']
