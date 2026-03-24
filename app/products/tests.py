"""
products/tests.py
=================
Tests automatizados para la API del catálogo.

¿Por qué escribimos tests?
  → Cada vez que cambiamos código, los tests nos dicen si rompimos algo.
  → Es como una red de seguridad.

¿Cómo funcionan?
  1. setUp() crea datos de prueba FRESCOS antes de cada test.
  2. Cada método test_* es un test independiente.
  3. self.assertEqual(a, b) verifica que a == b. Si no, el test falla.
  4. La DB de tests se crea y destruye sola (no toca la DB real).

Ejecutar:
  docker compose exec web python manage.py test products --verbosity=2
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import Category, Product, Chapter, TableOfContentsEntry


class ProductAPITests(TestCase):
    """Tests for the products catalog API endpoints."""

    def setUp(self):
        """
        Se ejecuta ANTES de cada test individual.
        Crea el juego de datos mínimo necesario para los tests.
        """
        self.client = APIClient()

        # Crear categorías
        self.cat_python = Category.objects.create(name='Python', icon='code-2')
        self.cat_web = Category.objects.create(name='Desarrollo Web', icon='globe')

        # Crear un curso con dos capítulos
        self.course = Product.objects.create(
            title='Python desde Cero',
            type=Product.TYPE_COURSE,
            category=self.cat_python,
            author='María González',
            description='Aprende Python desde cero.',
            price='49.99',
            original_price='99.99',
            level=Product.LEVEL_BEGINNER,
            language=Product.LANGUAGE_SPANISH,
            image='https://example.com/img.jpg',
            rating='4.8',
            duration='40 horas',
            is_featured=True,
            is_active=True,
        )
        Chapter.objects.create(product=self.course, order=1, title='Introducción', duration='45 min')
        Chapter.objects.create(product=self.course, order=2, title='Variables', duration='60 min')

        # Crear un libro con tabla de contenidos
        self.book = Product.objects.create(
            title='Clean Code',
            type=Product.TYPE_BOOK,
            category=self.cat_web,
            author='Robert C. Martin',
            description='El libro esencial sobre código limpio.',
            price='29.99',
            level=Product.LEVEL_INTERMEDIATE,
            language=Product.LANGUAGE_SPANISH,
            image='https://example.com/book.jpg',
            rating='4.9',
            pages=464,
            is_featured=True,
            is_active=True,
        )
        TableOfContentsEntry.objects.create(product=self.book, order=1, entry='Capítulo 1: Código Limpio')
        TableOfContentsEntry.objects.create(product=self.book, order=2, entry='Capítulo 2: Nombres')

        # Producto inactivo (NO debe aparecer en la API)
        self.inactive = Product.objects.create(
            title='Producto Inactivo',
            type=Product.TYPE_COURSE,
            category=self.cat_python,
            author='Test',
            description='No debería aparecer.',
            price='9.99',
            level=Product.LEVEL_BEGINNER,
            language=Product.LANGUAGE_SPANISH,
            image='',
            rating='3.0',
            is_active=False,  # ← este flag lo oculta de la API
        )
        self.client = APIClient()

        # Create categories
        self.cat_python = Category.objects.create(name='Python', icon='code-2')
        self.cat_web = Category.objects.create(name='Desarrollo Web', icon='globe')

        # Create a course
        self.course = Product.objects.create(
            title='Python desde Cero',
            type=Product.TYPE_COURSE,
            category=self.cat_python,
            author='María González',
            description='Aprende Python desde cero.',
            price='49.99',
            original_price='99.99',
            level=Product.LEVEL_BEGINNER,
            language=Product.LANGUAGE_SPANISH,
            image='https://example.com/img.jpg',
            rating='4.8',
            duration='40 horas',
            is_featured=True,
            is_active=True,
        )
        Chapter.objects.create(product=self.course, order=1, title='Introducción', duration='45 min')
        Chapter.objects.create(product=self.course, order=2, title='Variables', duration='60 min')

        # Create a book
        self.book = Product.objects.create(
            title='Clean Code',
            type=Product.TYPE_BOOK,
            category=self.cat_web,
            author='Robert C. Martin',
            description='El libro esencial sobre código limpio.',
            price='29.99',
            level=Product.LEVEL_INTERMEDIATE,
            language=Product.LANGUAGE_SPANISH,
            image='https://example.com/book.jpg',
            rating='4.9',
            pages=464,
            is_featured=True,
            is_active=True,
        )
        TableOfContentsEntry.objects.create(product=self.book, order=1, entry='Capítulo 1: Código Limpio')
        TableOfContentsEntry.objects.create(product=self.book, order=2, entry='Capítulo 2: Nombres')

        # Inactive product (should not appear in API)
        self.inactive = Product.objects.create(
            title='Producto Inactivo',
            type=Product.TYPE_COURSE,
            category=self.cat_python,
            author='Test',
            description='No debería aparecer.',
            price='9.99',
            level=Product.LEVEL_BEGINNER,
            language=Product.LANGUAGE_SPANISH,
            image='',
            rating='3.0',
            is_active=False,
        )

    def test_list_products_returns_only_active(self):
        """GET /api/products/ should return only active products."""
        response = self.client.get(reverse('product-list'))
        self.assertEqual(response.status_code, 200)
        titles = [p['title'] for p in response.data['results']]
        self.assertIn('Python desde Cero', titles)
        self.assertIn('Clean Code', titles)
        self.assertNotIn('Producto Inactivo', titles)

    def test_filter_products_by_type_course(self):
        """GET /api/products/?type=course should return only courses."""
        response = self.client.get(reverse('product-list'), {'type': 'course'})
        self.assertEqual(response.status_code, 200)
        types = [p['type'] for p in response.data['results']]
        self.assertTrue(all(t == 'course' for t in types))

    def test_filter_products_by_type_book(self):
        """GET /api/products/?type=book should return only books."""
        response = self.client.get(reverse('product-list'), {'type': 'book'})
        self.assertEqual(response.status_code, 200)
        types = [p['type'] for p in response.data['results']]
        self.assertTrue(all(t == 'book' for t in types))

    def test_search_products_by_title(self):
        """GET /api/products/?search=Python should find Python course."""
        response = self.client.get(reverse('product-list'), {'search': 'Python'})
        self.assertEqual(response.status_code, 200)
        titles = [p['title'] for p in response.data['results']]
        self.assertTrue(any('Python' in t for t in titles))

    def test_product_detail_includes_chapters(self):
        """GET /api/products/<id>/ should include chapters for a course."""
        response = self.client.get(reverse('product-detail', args=[self.course.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['type'], 'course')
        self.assertEqual(len(response.data['chapters']), 2)
        self.assertEqual(response.data['chapters'][0]['title'], 'Introducción')

    def test_product_detail_includes_table_of_contents(self):
        """GET /api/products/<id>/ should include TOC for a book."""
        response = self.client.get(reverse('product-detail', args=[self.book.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['type'], 'book')
        self.assertEqual(len(response.data['table_of_contents']), 2)

    def test_category_list(self):
        """GET /api/categories/ should list all categories."""
        response = self.client.get(reverse('category-list'))
        self.assertEqual(response.status_code, 200)
        names = [c['name'] for c in response.data]
        self.assertIn('Python', names)
        self.assertIn('Desarrollo Web', names)

    def test_inactive_product_detail_returns_404(self):
        """GET /api/products/<inactive-id>/ should return 404."""
        response = self.client.get(reverse('product-detail', args=[self.inactive.pk]))
        self.assertEqual(response.status_code, 404)
