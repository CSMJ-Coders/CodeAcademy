from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
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

# Create your tests here.
