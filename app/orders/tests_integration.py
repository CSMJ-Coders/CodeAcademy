"""
tests_integration.py
====================
Integration tests for complete user flows (auth -> cart -> order -> payment).
These tests verify that multiple components work together correctly.
"""

from decimal import Decimal
from unittest.mock import patch, MagicMock

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product
from orders.models import Order
from cart.models import Cart

User = get_user_model()


class PaymentFlowIntegrationTests(APITestCase):
    """Integration tests for complete payment flow"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='user@example.com',
            password='SecurePass123!',
        )

        self.category = Category.objects.create(name='Test', icon='code-2')
        self.product = Product.objects.create(
            title='Test Course',
            type=Product.TYPE_COURSE,
            category=self.category,
            author='Author',
            description='Test',
            price=Decimal('99.99'),
            level=Product.LEVEL_BEGINNER,
            language=Product.LANGUAGE_SPANISH,
            rating=Decimal('4.5'),
            is_active=True,
        )

    def test_complete_flow_register_add_to_cart_checkout(self):
        """Test complete flow: register -> add to cart -> create order"""
        # 1. Register
        register_response = self.client.post(
            reverse('auth-register'),
            {
                'email': 'newuser@example.com',
                'name': 'New User',
                'password': 'SecurePass123!',
                'password_confirm': 'SecurePass123!',
                'preferred_language': 'es',
            },
            format='json',
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        # 2. Extract token from register response
        access_token = register_response.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # 3. Add to cart
        cart_response = self.client.post(
            reverse('cart-root'),
            {'product_id': self.product.id, 'quantity': 1},
            format='json',
        )
        self.assertEqual(cart_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(cart_response.data['items']), 1)

        # 4. Create order from cart
        order_response = self.client.post(
            reverse('order-list-create'),
            {'items': [{'product_id': self.product.id, 'quantity': 1}]},
            format='json',
        )
        self.assertEqual(order_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(order_response.data['status'], Order.STATUS_COMPLETED)

    @patch('orders.serializers.stripe.PaymentIntent.create')
    @patch('orders.serializers.stripe.PaymentIntent.retrieve')
    @override_settings(STRIPE_SECRET_KEY='sk_test_123', STRIPE_CURRENCY='usd')
    def test_stripe_payment_flow(self, mock_retrieve, mock_create):
        """Test Stripe payment intent creation and confirmation"""
        self.client.force_authenticate(user=self.user)

        # Mock Stripe API
        mock_intent = MagicMock()
        mock_intent.id = 'pi_test_123'
        mock_intent.client_secret = 'pi_test_123_secret_xyz'
        mock_intent.status = 'succeeded'
        mock_create.return_value = mock_intent
        mock_retrieve.return_value = mock_intent

        # 1. Create payment intent
        intent_response = self.client.post(
            reverse('order-create-intent'),
            {'items': [{'product_id': self.product.id, 'quantity': 1}]},
            format='json',
        )
        self.assertEqual(intent_response.status_code, status.HTTP_201_CREATED)
        order_id = intent_response.data['order']['id']

        # 2. Confirm payment
        confirm_response = self.client.post(
            reverse('order-confirm-payment', args=[order_id]),
            {},
            format='json',
        )
        self.assertEqual(confirm_response.status_code, status.HTTP_200_OK)

        # Verify order is completed
        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, Order.STATUS_COMPLETED)
        self.assertTrue(self.user.purchased_products.filter(id=self.product.id).exists())

    def test_anonymous_to_authenticated_cart_merge(self):
        """Test that anonymous cart merges into user cart on login"""
        # 1. Add to cart as anonymous
        cart_response1 = self.client.post(
            reverse('cart-root'),
            {'product_id': self.product.id, 'quantity': 2},
            format='json',
        )
        self.assertEqual(len(cart_response1.data['items']), 1)

        # 2. Login
        login_response = self.client.post(
            reverse('auth-login'),
            {'email': self.user.email, 'password': 'SecurePass123!'},
            format='json',
        )
        access_token = login_response.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # 3. Merge anonymous cart
        merge_response = self.client.post(reverse('cart-merge'))
        self.assertEqual(merge_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(merge_response.data['items']), 1)
        self.assertEqual(merge_response.data['items'][0]['quantity'], 2)

        # 4. Create order with merged items
        order_response = self.client.post(
            reverse('order-list-create'),
            {'items': [{'product_id': self.product.id, 'quantity': 2}]},
            format='json',
        )
        self.assertEqual(order_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(order_response.data['total_amount'], '199.98')
