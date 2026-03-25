"""
products/urls.py
================
Rutas URL del módulo de productos.
Se incluyen en config/urls.py con el prefijo 'api/'.

Endpoints resultantes:
  GET /api/categories/         → lista de categorías
  GET /api/products/           → catálogo con filtros y paginación
  GET /api/products/<id>/      → detalle de un producto
"""

from django.urls import path
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    ProductPreviewView,
    BookDownloadView,
    BookDownloadStatusView,
    CourseProgressView,
    CourseCompleteChapterView,
    CourseCertificateDownloadView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/preview/', ProductPreviewView.as_view(), name='product-preview'),
    path('books/<int:pk>/downloads/status/', BookDownloadStatusView.as_view(), name='book-download-status'),
    path('books/<int:pk>/download/', BookDownloadView.as_view(), name='book-download'),
    path('courses/<int:pk>/progress/', CourseProgressView.as_view(), name='course-progress'),
    path('courses/<int:pk>/progress/complete/', CourseCompleteChapterView.as_view(), name='course-complete-chapter'),
    path('courses/<int:pk>/certificate/', CourseCertificateDownloadView.as_view(), name='course-certificate'),
]
