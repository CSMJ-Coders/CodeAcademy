from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from products.models import Category, Product
from users.models import User
from cart.models import Cart, CartItem


class CartAPITest(TestCase):
    """Comprehensive Cart API tests"""
    
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
        self.user = User.objects.create_user(
            email='cart@example.com',
            username='cartuser',
            password='StrongPass123!'
        )

    def test_add_to_cart_anonymous(self):
        """Test adding item to anonymous cart"""
        url = reverse('cart-root')
        res = self.client.post(url, {'product_id': self.product.id, 'quantity': 2})
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertIn('items', data)
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['quantity'], 2)

    def test_add_to_cart_authenticated(self):
        """Test adding item to authenticated user's cart"""
        self.client.force_authenticate(user=self.user)
        url = reverse('cart-root')
        res = self.client.post(url, {'product_id': self.product.id, 'quantity': 1})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(len(res.json()['items']), 1)

    def test_get_cart_items(self):
        """Test retrieving cart items"""
        self.client.post(reverse('cart-root'), {'product_id': self.product.id, 'quantity': 1})
        res = self.client.get(reverse('cart-root'))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()['items']), 1)

    def test_update_item_quantity(self):
        """Test updating cart item quantity"""
        res1 = self.client.post(reverse('cart-root'), {'product_id': self.product.id, 'quantity': 1})
        item_id = res1.json()['items'][0]['id']
        
        item_url = reverse('cart-item', args=[item_id])
        res2 = self.client.put(item_url, {'quantity': 5}, format='json')
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()['quantity'], 5)

    def test_remove_item_from_cart(self):
        """Test removing item from cart"""
        res1 = self.client.post(reverse('cart-root'), {'product_id': self.product.id, 'quantity': 1})
        item_id = res1.json()['items'][0]['id']
        
        item_url = reverse('cart-item', args=[item_id])
        res2 = self.client.delete(item_url)
        self.assertEqual(res2.status_code, 204)
        
        res3 = self.client.get(reverse('cart-root'))
        self.assertEqual(len(res3.json()['items']), 0)

    def test_clear_cart(self):
        """Test clearing entire cart"""
        self.client.post(reverse('cart-root'), {'product_id': self.product.id, 'quantity': 1})
        res = self.client.delete(reverse('cart-root'))
        self.assertEqual(res.status_code, 204)
        
        res2 = self.client.get(reverse('cart-root'))
        self.assertEqual(len(res2.json()['items']), 0)

    def test_merge_anonymous_cart_into_user_cart(self):
        """Test merging anonymous cart to user cart"""
        self.client.post(reverse('cart-root'), {'product_id': self.product.id, 'quantity': 2})
        self.client.force_authenticate(user=self.user)
        
        merge_response = self.client.post(reverse('cart-merge'))
        self.assertEqual(merge_response.status_code, 200)
        self.assertEqual(len(merge_response.json()['items']), 1)
        self.assertEqual(merge_response.json()['items'][0]['quantity'], 2)

    def test_cart_total_calculation(self):
        """Test cart total is correctly calculated"""
        res = self.client.post(reverse('cart-root'), {'product_id': self.product.id, 'quantity': 2})
        total = Decimal(res.json()['total'])
        expected = Decimal('19.99') * 2
        self.assertEqual(total, expected)
