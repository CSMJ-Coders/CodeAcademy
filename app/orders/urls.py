from django.urls import path

from .views import (
    ConfirmStripePaymentView,
    CreateStripePaymentIntentView,
    OrderDetailView,
    OrderListCreateView,
    StripeConfigView,
    StripeWebhookView,
)

urlpatterns = [
    # Sandbox inicial (sin Stripe): crea orden completada.
    path("orders/", OrderListCreateView.as_view(), name="order-list-create"),
    # Consulta de una orden puntual del usuario.
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    # Stripe: crea PaymentIntent + orden pending.
    path(
        "orders/create-intent/",
        CreateStripePaymentIntentView.as_view(),
        name="order-create-intent",
    ),
    # Stripe: configuración pública para inicializar Stripe.js en frontend.
    path(
        "orders/stripe-config/", StripeConfigView.as_view(), name="order-stripe-config"
    ),
    # Stripe: confirmación síncrona luego de confirmar tarjeta en frontend.
    path(
        "orders/<int:pk>/confirm/",
        ConfirmStripePaymentView.as_view(),
        name="order-confirm-payment",
    ),
    # Stripe: confirmación asíncrona oficial por webhook.
    path(
        "orders/webhook/stripe/",
        StripeWebhookView.as_view(),
        name="order-stripe-webhook",
    ),
]
