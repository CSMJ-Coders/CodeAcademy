"""
products/models.py
==================
Aquí definimos la estructura de nuestra base de datos para el catálogo.
Un "modelo" en Django = una tabla en la base de datos.
Django genera las tablas automáticamente con:
  python manage.py makemigrations  ← genera el archivo de migración
  python manage.py migrate         ← aplica los cambios a la DB

Tablas que creamos:
  1. Category              → Categorías (Python, Desarrollo Web, etc.)
  2. Product               → Productos (cursos y libros)
  3. Chapter               → Capítulos de un curso
  4. TableOfContentsEntry  → Entradas del índice de un libro
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    """
    Tabla: products_category
    Guarda las categorías del catálogo (Python, Desarrollo Web, etc.).
    El 'icon' es el nombre del ícono de Lucide que usa el frontend.
    """
    # unique=True → no puede haber dos categorías con el mismo nombre
    name = models.CharField(max_length=100, unique=True)
    # Nombre del ícono (Lucide Icons): 'code-2', 'globe', 'brain', etc.
    icon = models.CharField(max_length=50, default='code-2')

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['name']  # ordenadas alfabéticamente

    def __str__(self):
        # Qué se muestra en el panel de admin
        return self.name


class Product(models.Model):
    """
    Tabla: products_product
    El corazón del catálogo. Representa tanto CURSOS como LIBROS.
    Usamos un campo 'type' para diferenciarlos en lugar de dos tablas.
    """

    # ── Constantes para los campos de selección ────────────────────────────
    # Buena práctica: definir las opciones como constantes de clase.
    # Así si alguna vez cambias un valor, lo cambias en UN solo lugar.
    TYPE_COURSE = 'course'
    TYPE_BOOK = 'book'
    TYPE_CHOICES = [
        (TYPE_COURSE, 'Curso'),
        (TYPE_BOOK, 'Libro'),
    ]

    LEVEL_BEGINNER = 'beginner'
    LEVEL_INTERMEDIATE = 'intermediate'
    LEVEL_ADVANCED = 'advanced'
    LEVEL_CHOICES = [
        (LEVEL_BEGINNER, 'Principiante'),
        (LEVEL_INTERMEDIATE, 'Intermedio'),
        (LEVEL_ADVANCED, 'Avanzado'),
    ]

    LANGUAGE_SPANISH = 'spanish'
    LANGUAGE_ENGLISH = 'english'
    LANGUAGE_CHOICES = [
        (LANGUAGE_SPANISH, 'Español'),
        (LANGUAGE_ENGLISH, 'Inglés'),
    ]

    # ── Campos comunes (cursos y libros) ───────────────────────────────────
    title = models.CharField(max_length=255)
    # choices= hace que Django valide que sólo entren valores de TYPE_CHOICES
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    # ForeignKey = relación muchos-a-uno (muchos productos → una categoría)
    # on_delete=PROTECT evita borrar una categoría que tenga productos
    # related_name='products' permite hacer category.products.all()
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
    )
    author = models.CharField(max_length=255)
    description = models.TextField()  # TextField = texto largo sin límite
    # DecimalField para dinero: max_digits=total dígitos, decimal_places=decimales
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    # null=True → puede ser NULL en la DB; blank=True → puede estar vacío en formularios
    original_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
    )
    level = models.CharField(max_length=15, choices=LEVEL_CHOICES)
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default=LANGUAGE_SPANISH)
    image = models.URLField(max_length=500, blank=True)  # Guarda una URL de imagen
    rating = models.DecimalField(
        max_digits=3, decimal_places=1,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )

    # ── Campos específicos por tipo ─────────────────────────────────────────
    duration = models.CharField(max_length=50, blank=True)    # Solo cursos (ej: '40 horas')
    pages = models.PositiveIntegerField(null=True, blank=True) # Solo libros (ej: 464)

    # ── Flags de visibilidad ────────────────────────────────────────────────
    is_new = models.BooleanField(default=False)      # Badge 'Nuevo' en el frontend
    is_featured = models.BooleanField(default=False) # Aparece en la sección destacados
    is_active = models.BooleanField(default=True)    # Soft-delete: False = oculto

    # ── Timestamps automáticos ──────────────────────────────────────────────
    # auto_now_add=True → se llena automáticamente AL CREAR el registro
    created_at = models.DateTimeField(auto_now_add=True)
    # auto_now=True → se actualiza automáticamente EN CADA SAVE
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        # Primero los destacados, luego los más recientes
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        # get_type_display() traduce 'course' → 'Curso' usando TYPE_CHOICES
        return f'[{self.get_type_display()}] {self.title}'


class Chapter(models.Model):
    """
    Tabla: products_chapter
    Capítulos de un curso. Cada curso puede tener varios capítulos.
    Relación: Chapter → Product (muchos capítulos a un producto).
    """
    # on_delete=CASCADE: si se borra el curso, se borran sus capítulos también
    # limit_choices_to: en el admin solo muestra productos de tipo 'course'
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='chapters',          # product.chapters.all() devuelve sus capítulos
        limit_choices_to={'type': Product.TYPE_COURSE},
    )
    order = models.PositiveSmallIntegerField(default=0)  # Número de orden (1, 2, 3...)
    title = models.CharField(max_length=255)
    duration = models.CharField(max_length=50)           # Ej: '45 min'
    video_url = models.URLField(max_length=500, blank=True, default='#')

    class Meta:
        verbose_name = 'Capítulo'
        verbose_name_plural = 'Capítulos'
        ordering = ['order']  # siempre en orden ascendente

    def __str__(self):
        return f'{self.product.title} – {self.order}. {self.title}'


class TableOfContentsEntry(models.Model):
    """
    Tabla: products_tableofcontentsentry
    Entradas del índice de un libro (Capítulo 1, Capítulo 2, etc.).
    Equivalente a Chapter pero para libros.
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='table_of_contents',  # product.table_of_contents.all()
        limit_choices_to={'type': Product.TYPE_BOOK},
    )
    order = models.PositiveSmallIntegerField(default=0)
    entry = models.CharField(max_length=255)  # Ej: 'Capítulo 1: Código Limpio'

    class Meta:
        verbose_name = 'Entrada de índice'
        verbose_name_plural = 'Entradas de índice'
        ordering = ['order']

    def __str__(self):
        return f'{self.product.title} – {self.entry}'
