from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from products.models import Category, Product
from users.models import User


class CartAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = Category.objects.create(name='TestCat', icon='code-2')
        self.product = Product.objects.create(
            title='Test Product',
            type=Product.TYPE_COURSE,
            category=self.cat,
            author='Author',
            description='Desc',
            price='19.99',
            level=Product.LEVEL_BEGINNER,
            language=Product.LANGUAGE_SPANISH,
            image='',
            rating='4.5',
            is_active=True,
        )

    def test_add_to_cart_anonymous(self):
        url = reverse('cart-root')
        res = self.client.post(url, {'product_id': self.product.id, 'quantity': 2})
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertIn('items', data)
        self.assertEqual(len(data['items']), 1)

    def test_update_item_quantity(self):
        url = reverse('cart-root')
        res = self.client.post(url, {'product_id': self.product.id, 'quantity': 1})
        self.assertEqual(res.status_code, 201)
        cart_id = res.json()['id']
        item_id = res.json()['items'][0]['id']

        item_url = reverse('cart-item', args=[item_id])
        res2 = self.client.put(item_url, {'quantity': 3}, format='json')
        self.assertEqual(res2.status_code, 200)

    def test_merge_anonymous_cart_into_user_cart(self):
        self.client.post(reverse('cart-root'), {'product_id': self.product.id, 'quantity': 2})

        user = User.objects.create_user(email='cart@example.com', username='cartuser', password='StrongPass123!')
        self.client.force_authenticate(user=user)

        merge_response = self.client.post(reverse('cart-merge'))
        self.assertEqual(merge_response.status_code, 200)
        self.assertEqual(len(merge_response.json()['items']), 1)
        self.assertEqual(merge_response.json()['items'][0]['quantity'], 2)
