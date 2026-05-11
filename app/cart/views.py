from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer
from products.models import Product


def _get_or_create_cart(request):
    # If authenticated, cart is linked to user
    if request.user and request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    # anonymous: use session_key stored in Django session
    session = request.session
    if not session.session_key:
        session.create()
    key = session.session_key
    cart, _ = Cart.objects.get_or_create(session_key=key)
    return cart


def _merge_carts(source_cart, target_cart):
    for source_item in source_cart.items.select_related('product'):
        target_item, created = CartItem.objects.get_or_create(
            cart=target_cart,
            product=source_item.product,
            defaults={'quantity': source_item.quantity},
        )
        if not created:
            target_item.quantity += source_item.quantity
            target_item.save(update_fields=['quantity'])
    source_cart.delete()


class CartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = _get_or_create_cart(request)
        data = CartSerializer(cart, context={'request': request}).data
        return Response(data)

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data.get('quantity', 1)

        product = get_object_or_404(Product, pk=product_id, is_active=True)
        cart = _get_or_create_cart(request)

        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'quantity': quantity})
        if not created:
            item.quantity += quantity
            item.save()

        data = CartSerializer(cart, context={'request': request}).data
        return Response(data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        cart = _get_or_create_cart(request)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartMergeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.session.session_key:
            return Response({'detail': 'No hay carrito anónimo para fusionar.'}, status=status.HTTP_200_OK)

        anonymous_cart = Cart.objects.filter(session_key=request.session.session_key, user__isnull=True).first()
        if not anonymous_cart:
            return Response({'detail': 'No hay carrito anónimo para fusionar.'}, status=status.HTTP_200_OK)

        user_cart, _ = Cart.objects.get_or_create(user=request.user)
        if anonymous_cart.pk == user_cart.pk:
            return Response(CartSerializer(user_cart, context={'request': request}).data)

        _merge_carts(anonymous_cart, user_cart)
        return Response(CartSerializer(user_cart, context={'request': request}).data)


class CartItemView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk):
        cart = _get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        qty = int(request.data.get('quantity', item.quantity))
        if qty <= 0:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        item.quantity = qty
        item.save(update_fields=['quantity'])
        return Response({'quantity': item.quantity, 'id': item.pk})

    def delete(self, request, pk):
        cart = _get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
