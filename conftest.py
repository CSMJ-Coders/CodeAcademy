"""
conftest.py
===========
Pytest configuration and shared fixtures for all tests.
"""

import os
import django
from django.conf import settings

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_development')
django.setup()

import pytest
from django.test import Client
from rest_framework.test import APIClient
from users.models import User
from products.models import Category, Product
from decimal import Decimal


@pytest.fixture
def api_client():
    """Provides a REST API client for testing."""
    return APIClient()


@pytest.fixture
def authenticated_user(db):
    """Creates and returns an authenticated test user."""
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='TestPass123!',
        first_name='Test',
        last_name='User',
    )
    return user


@pytest.fixture
def authenticated_client(db, authenticated_user):
    """Provides an authenticated API client."""
    client = APIClient()
    client.force_authenticate(user=authenticated_user)
    return client


@pytest.fixture
def test_category(db):
    """Creates a test product category."""
    return Category.objects.create(name='Test Category', icon='code-2')


@pytest.fixture
def test_course(db, test_category):
    """Creates a test course product."""
    return Product.objects.create(
        title='Test Course',
        type=Product.TYPE_COURSE,
        category=test_category,
        author='Test Author',
        description='Test course description',
        price=Decimal('99.99'),
        original_price=Decimal('199.99'),
        level=Product.LEVEL_BEGINNER,
        language=Product.LANGUAGE_SPANISH,
        image='',
        rating=Decimal('4.5'),
        duration='40 hours',
        is_featured=True,
        is_active=True,
    )


@pytest.fixture
def test_book(db, test_category):
    """Creates a test book product."""
    return Product.objects.create(
        title='Test Book',
        type=Product.TYPE_BOOK,
        category=test_category,
        author='Test Author',
        description='Test book description',
        price=Decimal('29.99'),
        level=Product.LEVEL_INTERMEDIATE,
        language=Product.LANGUAGE_SPANISH,
        image='',
        rating=Decimal('4.8'),
        pages=350,
        is_featured=True,
        is_active=True,
    )


@pytest.fixture
def multiple_products(db, test_category):
    """Creates multiple test products."""
    products = []
    for i in range(5):
        product = Product.objects.create(
            title=f'Product {i}',
            type=Product.TYPE_COURSE if i % 2 == 0 else Product.TYPE_BOOK,
            category=test_category,
            author='Author',
            description='Description',
            price=Decimal('19.99') * (i + 1),
            level=Product.LEVEL_BEGINNER,
            language=Product.LANGUAGE_SPANISH,
            image='',
            rating=Decimal('4.0'),
            is_active=True,
        )
        products.append(product)
    return products


@pytest.fixture(scope="session")
def django_db_setup(django_db_setup, django_db_blocker):
    """
    Configure Django test database.
    This fixture is automatically used by pytest-django.
    It must be session scoped to avoid ScopeMismatch when accessed
    from class-scoped test requests.
    """
    with django_db_blocker.unblock():
        pass
