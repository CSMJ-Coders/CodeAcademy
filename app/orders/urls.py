from django.urls import path

from .views import (
    ConfirmStripePaymentView,
    CreateStripePaymentIntentView,
    OrderDetailView,
    OrderListCreateView,
    StripeWebhookView,
)

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/create-intent/', CreateStripePaymentIntentView.as_view(), name='order-create-intent'),
    path('orders/<int:pk>/confirm/', ConfirmStripePaymentView.as_view(), name='order-confirm-payment'),
    path('orders/webhook/stripe/', StripeWebhookView.as_view(), name='order-stripe-webhook'),
]
