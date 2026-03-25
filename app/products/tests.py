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
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from users.models import User
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

    def test_category_list_excludes_categories_without_active_products(self):
        """GET /api/categories/ should hide categories that have no active products."""
        Category.objects.create(name='Testing QA', icon='code-2')

        response = self.client.get(reverse('category-list'))
        self.assertEqual(response.status_code, 200)
        names = [c['name'] for c in response.data]

        self.assertNotIn('Testing QA', names)

    def test_inactive_product_detail_returns_404(self):
        """GET /api/products/<inactive-id>/ should return 404."""
        response = self.client.get(reverse('product-detail', args=[self.inactive.pk]))
        self.assertEqual(response.status_code, 404)


class ProductProtectionAndProgressTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            email='student@example.com',
            username='student',
            password='StrongPass123!',
        )

        category = Category.objects.create(name='Backend', icon='code-2')

        self.book = Product.objects.create(
            title='Libro Seguro',
            type=Product.TYPE_BOOK,
            category=category,
            author='Autor',
            description='Libro de prueba',
            price='19.99',
            level=Product.LEVEL_BEGINNER,
            language=Product.LANGUAGE_SPANISH,
            rating='4.5',
        )
        self.book.book_file.save(
            'libro-seguro.pdf',
            SimpleUploadedFile('libro-seguro.pdf', b'%PDF-1.4 fake', content_type='application/pdf'),
            save=True,
        )
        TableOfContentsEntry.objects.create(product=self.book, order=1, entry='Intro', is_preview=True)
        TableOfContentsEntry.objects.create(product=self.book, order=2, entry='Capítulo premium', is_preview=False)

        self.course = Product.objects.create(
            title='Curso Completo',
            type=Product.TYPE_COURSE,
            category=category,
            author='Profe',
            description='Curso de prueba',
            price='49.99',
            level=Product.LEVEL_BEGINNER,
            language=Product.LANGUAGE_SPANISH,
            rating='4.9',
        )
        self.chapter_1 = Chapter.objects.create(
            product=self.course,
            order=1,
            title='Capítulo 1',
            duration='10 min',
            is_preview=True,
        )
        self.chapter_2 = Chapter.objects.create(
            product=self.course,
            order=2,
            title='Capítulo 2',
            duration='15 min',
            is_preview=False,
        )

    def authenticate(self):
        self.client.force_authenticate(user=self.user)

    def test_preview_returns_only_marked_content(self):
        response = self.client.get(reverse('product-preview', args=[self.course.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['preview_chapters']), 1)
        self.assertEqual(response.data['preview_chapters'][0]['id'], self.chapter_1.id)

        response_book = self.client.get(reverse('product-preview', args=[self.book.pk]))
        self.assertEqual(response_book.status_code, 200)
        self.assertEqual(len(response_book.data['preview_table_of_contents']), 1)

    def test_book_download_requires_purchase_and_respects_limit(self):
        self.authenticate()

        no_access = self.client.get(reverse('book-download', args=[self.book.pk]))
        self.assertEqual(no_access.status_code, 403)

        self.user.purchased_products.add(self.book)

        first_download = self.client.get(reverse('book-download', args=[self.book.pk]))
        self.assertEqual(first_download.status_code, 200)

        status_response = self.client.get(reverse('book-download-status', args=[self.book.pk]))
        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.data['download_count'], 1)

        # Consumir las descargas restantes
        self.client.get(reverse('book-download', args=[self.book.pk]))
        self.client.get(reverse('book-download', args=[self.book.pk]))
        blocked = self.client.get(reverse('book-download', args=[self.book.pk]))
        self.assertEqual(blocked.status_code, 403)

    def test_course_progress_and_certificate_flow(self):
        self.authenticate()
        self.user.purchased_products.add(self.course)

        progress = self.client.get(reverse('course-progress', args=[self.course.pk]))
        self.assertEqual(progress.status_code, 200)
        self.assertEqual(progress.data['progress_percentage'], 0)

        complete_1 = self.client.post(
            reverse('course-complete-chapter', args=[self.course.pk]),
            {'chapter_id': self.chapter_1.id},
            format='json',
        )
        self.assertEqual(complete_1.status_code, 200)
        self.assertEqual(complete_1.data['progress_percentage'], 50)

        complete_2 = self.client.post(
            reverse('course-complete-chapter', args=[self.course.pk]),
            {'chapter_id': self.chapter_2.id},
            format='json',
        )
        self.assertEqual(complete_2.status_code, 200)
        self.assertEqual(complete_2.data['progress_percentage'], 100)
        self.assertTrue(complete_2.data['certificate_issued'])

        certificate = self.client.get(reverse('course-certificate', args=[self.course.pk]))
        self.assertEqual(certificate.status_code, 200)
