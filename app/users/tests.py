from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthenticationAPITests(APITestCase):
	"""Comprehensive authentication and user profile tests"""
	
	def setUp(self):
		self.register_url = reverse('auth-register')
		self.login_url = reverse('auth-login')
		self.profile_url = reverse('auth-profile')
		self.logout_url = reverse('auth-logout')

	def test_user_can_register(self):
		"""Test user registration with valid data"""
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

	def test_register_with_mismatched_passwords_fails(self):
		"""Test registration fails if passwords don't match"""
		payload = {
			'email': 'test@example.com',
			'name': 'Test User',
			'password': 'SecurePass123!',
			'password_confirm': 'DifferentPass123!',
			'preferred_language': 'es',
		}

		response = self.client.post(self.register_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_register_duplicate_email_fails(self):
		"""Test registration fails with duplicate email"""
		User.objects.create_user(
			username='existing',
			email='existing@example.com',
			password='SecurePass123!',
		)
		
		payload = {
			'email': 'existing@example.com',
			'name': 'New User',
			'password': 'SecurePass123!',
			'password_confirm': 'SecurePass123!',
			'preferred_language': 'es',
		}

		response = self.client.post(self.register_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_user_can_login_with_email_and_password(self):
		"""Test user login with email and password"""
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

	def test_login_with_wrong_password_fails(self):
		"""Test login fails with incorrect password"""
		User.objects.create_user(
			username='user',
			email='user@example.com',
			password='CorrectPass123!',
		)

		response = self.client.post(
			self.login_url,
			{'email': 'user@example.com', 'password': 'WrongPass123!'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_login_with_nonexistent_user_fails(self):
		"""Test login fails with non-existent email"""
		response = self.client.post(
			self.login_url,
			{'email': 'nonexistent@example.com', 'password': 'AnyPass123!'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_authenticated_user_can_get_profile(self):
		"""Test authenticated user can retrieve their profile"""
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

	def test_unauthenticated_user_cannot_get_profile(self):
		"""Test unauthenticated users cannot access profile"""
		response = self.client.get(self.profile_url)
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_authenticated_user_can_logout_with_refresh_token(self):
		"""Test user can logout with refresh token"""
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
