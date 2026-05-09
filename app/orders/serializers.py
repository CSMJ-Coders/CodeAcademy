"""
orders/serializers.py
=====================
Serializers del flujo de órdenes y pagos.

Responsabilidades:
- Validar entrada del checkout.
- Calcular totales en servidor.
- Crear la orden y sus ítems.
- Integrar Stripe (create PaymentIntent en modo test/live).
"""

from decimal import Decimal

import stripe
from django.conf import settings
from django.db import transaction
from rest_framework import serializers

from products.models import Product
from products.serializers import ProductListSerializer

from .models import Order, OrderItem
from .services import grant_user_access_for_products


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer de salida para cada línea de compra."""

    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_id",
            "product",
            "product_title",
            "quantity",
            "unit_price",
            "line_total",
        ]


class OrderSerializer(serializers.ModelSerializer):
    """Serializer de salida de una orden completa con sus ítems."""

    user_id = serializers.IntegerField(source="user.id", read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user_id",
            "status",
            "payment_provider",
            "payment_reference",
            "total_amount",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = fields


class CreateOrderItemInputSerializer(serializers.Serializer):
    """Entrada mínima esperada por ítem desde el frontend."""

    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, default=1)


class CreateOrderSerializer(serializers.Serializer):
    """
    Crea una orden en modo sandbox:
    - calcula precios SIEMPRE en backend (nunca confiar en frontend)
    - guarda snapshot de ítems
    - marca productos como comprados al completar
    """

    items = CreateOrderItemInputSerializer(many=True)

    def validate_items(self, items):
        """
        Valida que:
        - llegue al menos 1 ítem,
        - todos los productos existan,
        - y estén activos.
        """
        if not items:
            raise serializers.ValidationError("Debes enviar al menos un producto.")

        product_ids = [item["product_id"] for item in items]
        products = Product.objects.filter(id__in=product_ids, is_active=True)
        found_ids = set(products.values_list("id", flat=True))

        missing_ids = [pid for pid in set(product_ids) if pid not in found_ids]
        if missing_ids:
            raise serializers.ValidationError(
                f"Productos inválidos o inactivos: {missing_ids}"
            )

        return items

    def _build_products_map(self, items_data):
        """Optimiza consultas para resolver productos por id una sola vez."""
        return {
            product.id: product
            for product in Product.objects.filter(
                id__in=[item["product_id"] for item in items_data],
                is_active=True,
            )
        }

    def _create_order_and_items(
        self, user, items_data, status, provider, payment_reference=""
    ):
        """
        Lógica compartida:
        - crea cabecera de orden,
        - crea ítems,
        - calcula total,
        - devuelve ids de productos para desbloqueo posterior.
        """
        product_map = self._build_products_map(items_data)

        order_total = Decimal("0.00")
        order = Order.objects.create(
            user=user,
            status=status,
            payment_provider=provider,
            payment_reference=payment_reference,
            total_amount=Decimal("0.00"),
        )

        purchased_product_ids = set()
        for item_data in items_data:
            product = product_map[item_data["product_id"]]
            quantity = item_data["quantity"]
            unit_price = Decimal(str(product.price))
            line_total = unit_price * quantity
            order_total += line_total

            OrderItem.objects.create(
                order=order,
                product=product,
                product_title=product.title,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
            purchased_product_ids.add(product.id)

        order.total_amount = order_total
        order.save(update_fields=["total_amount", "updated_at"])
        return order, purchased_product_ids

    @transaction.atomic
    def create(self, validated_data):
        """
        Flujo sandbox (sin pasarela real):
        - crea orden `completed`
        - desbloquea productos al usuario
        """
        user = self.context["request"].user
        items_data = validated_data["items"]
        order, purchased_product_ids = self._create_order_and_items(
            user=user,
            items_data=items_data,
            status=Order.STATUS_COMPLETED,
            provider=Order.PROVIDER_SANDBOX,
            payment_reference="sandbox-approved",
        )

        grant_user_access_for_products(user, purchased_product_ids)

        return order


class CreateStripePaymentIntentSerializer(CreateOrderSerializer):
    """
    Flujo Stripe real:
    - crea orden en `pending`
    - crea PaymentIntent en Stripe
    - guarda `payment_reference` con el id del PaymentIntent
    """

    @transaction.atomic
    def create(self, validated_data):
        if not settings.STRIPE_SECRET_KEY:
            raise serializers.ValidationError(
                "Stripe no está configurado. Falta STRIPE_SECRET_KEY."
            )

        stripe.api_key = settings.STRIPE_SECRET_KEY

        user = self.context["request"].user
        items_data = validated_data["items"]

        order, _ = self._create_order_and_items(
            user=user,
            items_data=items_data,
            status=Order.STATUS_PENDING,
            provider=Order.PROVIDER_STRIPE,
        )

        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(order.total_amount * 100),
                currency=settings.STRIPE_CURRENCY,
                metadata={
                    "order_id": str(order.id),
                    "user_id": str(user.id),
                },
            )
        except stripe.error.StripeError as exc:
            raise serializers.ValidationError(
                f"No se pudo crear el PaymentIntent: {str(exc)}"
            )

        order.payment_reference = payment_intent.id
        order.save(update_fields=["payment_reference", "updated_at"])

        return {
            "order": order,
            "client_secret": payment_intent.client_secret,
        }
