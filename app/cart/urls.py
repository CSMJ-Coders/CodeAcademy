from django.urls import path
from .views import CartView, CartItemView, CartMergeView

urlpatterns = [
    path('', CartView.as_view(), name='cart-root'),
    path('merge/', CartMergeView.as_view(), name='cart-merge'),
    path('items/<int:pk>/', CartItemView.as_view(), name='cart-item'),
]
