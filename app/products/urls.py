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
from .views import CategoryListView, ProductListView, ProductDetailView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
]
