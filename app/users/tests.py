from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthenticationAPITests(APITestCase):
	def setUp(self):
		self.register_url = reverse('auth-register')
		self.login_url = reverse('auth-login')
		self.profile_url = reverse('auth-profile')
		self.logout_url = reverse('auth-logout')

	def test_user_can_register(self):
		payload = {
			'email': 'camilo@example.com',
			'name': 'Camilo Alvarez',
			'password': 'SecurePass123!',
			'password_confirm': 'SecurePass123!',
			'preferred_language': 'es',
		}

		response = self.client.post(self.register_url, payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(User.objects.filter(email='camilo@example.com').exists())
		self.assertIn('tokens', response.data)
		self.assertEqual(response.data['user']['email'], 'camilo@example.com')
		self.assertEqual(response.data['user']['name'], 'Camilo Alvarez')

	def test_user_can_login_with_email_and_password(self):
		user = User.objects.create_user(
			username='camilo',
			email='camilo@example.com',
			password='SecurePass123!',
			first_name='Camilo',
			last_name='Alvarez',
		)

		response = self.client.post(
			self.login_url,
			{'email': user.email, 'password': 'SecurePass123!'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('access', response.data['tokens'])
		self.assertEqual(response.data['user']['email'], user.email)

	def test_authenticated_user_can_get_profile(self):
		user = User.objects.create_user(
			username='camilo',
			email='camilo@example.com',
			password='SecurePass123!',
			first_name='Camilo',
			last_name='Alvarez',
		)
		self.client.force_authenticate(user=user)

		response = self.client.get(self.profile_url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['email'], user.email)
		self.assertEqual(response.data['name'], 'Camilo Alvarez')

	def test_authenticated_user_can_logout_with_refresh_token(self):
		user = User.objects.create_user(
			username='camilo',
			email='camilo@example.com',
			password='SecurePass123!',
		)
		login_response = self.client.post(
			self.login_url,
			{'email': user.email, 'password': 'SecurePass123!'},
			format='json',
		)
		refresh = login_response.data['tokens']['refresh']

		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['tokens']['access']}")
		response = self.client.post(self.logout_url, {'refresh': refresh}, format='json')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['message'], 'Sesión cerrada correctamente.')
