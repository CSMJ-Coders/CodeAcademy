from decimal import Decimal
from unittest.mock import patch, MagicMock

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product

from .models import Order


User = get_user_model()


class OrdersAPITests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username='camilo',
			email='camilo@example.com',
			password='SecurePass123!',
		)
		self.other_user = User.objects.create_user(
			username='ana',
			email='ana@example.com',
			password='SecurePass123!',
		)

		self.category = Category.objects.create(name='Python', icon='code-2')
		self.course = Product.objects.create(
			title='Python Pro',
			type=Product.TYPE_COURSE,
			category=self.category,
			author='Instructor',
			description='Curso completo',
			price=Decimal('99.99'),
			level=Product.LEVEL_BEGINNER,
			language=Product.LANGUAGE_SPANISH,
			rating=Decimal('4.5'),
			duration='10 horas',
			is_active=True,
		)
		self.book = Product.objects.create(
			title='Libro Clean Code',
			type=Product.TYPE_BOOK,
			category=self.category,
			author='Author',
			description='Libro técnico',
			price=Decimal('49.00'),
			level=Product.LEVEL_INTERMEDIATE,
			language=Product.LANGUAGE_SPANISH,
			rating=Decimal('4.8'),
			pages=350,
			is_active=True,
		)

		self.list_create_url = reverse('order-list-create')
		self.create_intent_url = reverse('order-create-intent')

	def test_create_order_requires_authentication(self):
		payload = {'items': [{'product_id': self.course.id, 'quantity': 1}]}

		response = self.client.post(self.list_create_url, payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_authenticated_user_can_create_order_and_unlock_products(self):
		self.client.force_authenticate(user=self.user)
		payload = {
			'items': [
				{'product_id': self.course.id, 'quantity': 1},
				{'product_id': self.book.id, 'quantity': 2},
			]
		}

		response = self.client.post(self.list_create_url, payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		order = Order.objects.get(id=response.data['id'])
		self.assertEqual(order.status, Order.STATUS_COMPLETED)
		self.assertEqual(order.payment_provider, Order.PROVIDER_SANDBOX)
		self.assertEqual(order.items.count(), 2)
		self.assertEqual(order.total_amount, Decimal('197.99'))
		self.assertTrue(self.user.purchased_products.filter(id=self.course.id).exists())
		self.assertTrue(self.user.purchased_products.filter(id=self.book.id).exists())

	def test_order_list_returns_only_orders_of_authenticated_user(self):
		user_order = Order.objects.create(
			user=self.user,
			status=Order.STATUS_COMPLETED,
			payment_provider=Order.PROVIDER_SANDBOX,
			payment_reference='sandbox-approved',
			total_amount=Decimal('10.00'),
		)
		Order.objects.create(
			user=self.other_user,
			status=Order.STATUS_COMPLETED,
			payment_provider=Order.PROVIDER_SANDBOX,
			payment_reference='sandbox-approved',
			total_amount=Decimal('20.00'),
		)

		self.client.force_authenticate(user=self.user)
		response = self.client.get(self.list_create_url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['count'], 1)
		self.assertEqual(response.data['results'][0]['id'], user_order.id)

	def test_order_detail_for_other_user_returns_404(self):
		other_order = Order.objects.create(
			user=self.other_user,
			status=Order.STATUS_COMPLETED,
			payment_provider=Order.PROVIDER_SANDBOX,
			payment_reference='sandbox-approved',
			total_amount=Decimal('20.00'),
		)

		self.client.force_authenticate(user=self.user)
		response = self.client.get(reverse('order-detail', args=[other_order.id]))

		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

	@patch('orders.serializers.stripe.PaymentIntent.create')
	@override_settings(STRIPE_SECRET_KEY='sk_test_123', STRIPE_CURRENCY='usd')
	def test_create_stripe_payment_intent(self, mock_create):
		self.client.force_authenticate(user=self.user)
		mock_create.return_value = MagicMock(id='pi_test_123', client_secret='cs_test_123')

		payload = {'items': [{'product_id': self.course.id, 'quantity': 1}]}
		response = self.client.post(self.create_intent_url, payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertIn('client_secret', response.data)
		self.assertIn('order', response.data)
		self.assertEqual(response.data['order']['status'], Order.STATUS_PENDING)
		self.assertEqual(response.data['order']['payment_provider'], Order.PROVIDER_STRIPE)

	@patch('orders.views.stripe.PaymentIntent.retrieve')
	@override_settings(STRIPE_SECRET_KEY='sk_test_123')
	def test_confirm_stripe_payment_marks_order_completed_and_unlocks_products(self, mock_retrieve):
		order = Order.objects.create(
			user=self.user,
			status=Order.STATUS_PENDING,
			payment_provider=Order.PROVIDER_STRIPE,
			payment_reference='pi_test_abc',
			total_amount=Decimal('99.99'),
		)
		order.items.create(
			product=self.course,
			product_title=self.course.title,
			quantity=1,
			unit_price=Decimal('99.99'),
			line_total=Decimal('99.99'),
		)

		mock_retrieve.return_value = MagicMock(status='succeeded')
		self.client.force_authenticate(user=self.user)
		response = self.client.post(reverse('order-confirm-payment', args=[order.id]), {}, format='json')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		order.refresh_from_db()
		self.assertEqual(order.status, Order.STATUS_COMPLETED)
		self.assertTrue(self.user.purchased_products.filter(id=self.course.id).exists())

# Create your tests here.
