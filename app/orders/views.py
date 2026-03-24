import json

import stripe
from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import CreateOrderSerializer, CreateStripePaymentIntentSerializer, OrderSerializer


def _grant_user_access_for_order(order: Order):
	product_ids = list(order.items.values_list('product_id', flat=True))
	if product_ids:
		order.user.purchased_products.add(*product_ids)


def _mark_order_completed(order: Order):
	if order.status != Order.STATUS_COMPLETED:
		order.status = Order.STATUS_COMPLETED
		order.save(update_fields=['status', 'updated_at'])
	_grant_user_access_for_order(order)


def _mark_order_failed(order: Order):
	if order.status != Order.STATUS_FAILED:
		order.status = Order.STATUS_FAILED
		order.save(update_fields=['status', 'updated_at'])


class OrderListCreateView(generics.ListCreateAPIView):
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return (
			Order.objects
			.filter(user=self.request.user)
			.prefetch_related('items__product')
			.order_by('-created_at')
		)

	def get_serializer_class(self):
		if self.request.method == 'POST':
			return CreateOrderSerializer
		return OrderSerializer

	def create(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		order = serializer.save()
		output_serializer = OrderSerializer(order, context={'request': request})
		return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
	permission_classes = [IsAuthenticated]
	serializer_class = OrderSerializer

	def get_queryset(self):
		return (
			Order.objects
			.filter(user=self.request.user)
			.prefetch_related('items__product')
			.order_by('-created_at')
		)


class CreateStripePaymentIntentView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = CreateStripePaymentIntentSerializer(data=request.data, context={'request': request})
		serializer.is_valid(raise_exception=True)
		result = serializer.save()

		order = result['order']
		output_serializer = OrderSerializer(order, context={'request': request})
		return Response(
			{
				'client_secret': result['client_secret'],
				'order': output_serializer.data,
				'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
			},
			status=status.HTTP_201_CREATED,
		)


class ConfirmStripePaymentView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, pk):
		if not settings.STRIPE_SECRET_KEY:
			return Response({'detail': 'Stripe no está configurado.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

		stripe.api_key = settings.STRIPE_SECRET_KEY

		try:
			order = (
				Order.objects
				.prefetch_related('items__product')
				.get(pk=pk, user=request.user)
			)
		except Order.DoesNotExist:
			return Response({'detail': 'Orden no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

		if order.payment_provider != Order.PROVIDER_STRIPE:
			return Response({'detail': 'La orden no usa Stripe.'}, status=status.HTTP_400_BAD_REQUEST)

		if not order.payment_reference:
			return Response({'detail': 'La orden no tiene referencia de pago.'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			payment_intent = stripe.PaymentIntent.retrieve(order.payment_reference)
		except stripe.error.StripeError as exc:
			return Response({'detail': f'No se pudo consultar Stripe: {str(exc)}'}, status=status.HTTP_400_BAD_REQUEST)

		if payment_intent.status == 'succeeded':
			_mark_order_completed(order)
		elif payment_intent.status in {'canceled', 'requires_payment_method'}:
			_mark_order_failed(order)

		output_serializer = OrderSerializer(order, context={'request': request})
		return Response(output_serializer.data, status=status.HTTP_200_OK)


class StripeWebhookView(APIView):
	permission_classes = [AllowAny]
	authentication_classes = []

	def post(self, request):
		payload = request.body

		try:
			if settings.STRIPE_WEBHOOK_SECRET:
				signature = request.META.get('HTTP_STRIPE_SIGNATURE')
				event = stripe.Webhook.construct_event(payload, signature, settings.STRIPE_WEBHOOK_SECRET)
			else:
				event = json.loads(payload.decode('utf-8'))
		except Exception:
			return Response({'detail': 'Webhook inválido.'}, status=status.HTTP_400_BAD_REQUEST)

		event_type = event.get('type')
		data_object = event.get('data', {}).get('object', {})
		payment_intent_id = data_object.get('id')

		if not payment_intent_id:
			return Response({'received': True}, status=status.HTTP_200_OK)

		try:
			order = Order.objects.prefetch_related('items__product').get(payment_reference=payment_intent_id)
		except Order.DoesNotExist:
			return Response({'received': True}, status=status.HTTP_200_OK)

		if event_type == 'payment_intent.succeeded':
			_mark_order_completed(order)
		elif event_type == 'payment_intent.payment_failed':
			_mark_order_failed(order)

		return Response({'received': True}, status=status.HTTP_200_OK)

# Create your views here.
