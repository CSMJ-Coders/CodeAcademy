"""
orders/models.py
================
Modelos del Sprint 3 (carrito/checkout/órdenes).

Diseño:
- `Order` representa la transacción completa de compra.
- `OrderItem` guarda el snapshot de cada producto comprado.

¿Por qué guardamos snapshot (`product_title`, `unit_price`, etc.)?
Porque el catálogo puede cambiar en el tiempo (precio, título), pero
la factura histórica debe mantenerse intacta.
"""

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Order(models.Model):
	"""
	Orden de compra creada por un usuario autenticado.
	En Sprint 3 arrancamos con provider sandbox y luego conectamos Stripe.
	"""

	STATUS_PENDING = 'pending'
	STATUS_COMPLETED = 'completed'
	STATUS_FAILED = 'failed'
	STATUS_CHOICES = [
		(STATUS_PENDING, 'Pendiente'),
		(STATUS_COMPLETED, 'Completada'),
		(STATUS_FAILED, 'Fallida'),
	]

	PROVIDER_SANDBOX = 'sandbox'
	PROVIDER_STRIPE = 'stripe'
	PROVIDER_CHOICES = [
		(PROVIDER_SANDBOX, 'Sandbox'),
		(PROVIDER_STRIPE, 'Stripe'),
	]

	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='orders',
	)
	# Estado de negocio de la orden.
	# Se actualiza por confirmación Stripe (sync/async webhook).
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
	# Proveedor de pago usado para esta orden.
	payment_provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default=PROVIDER_SANDBOX)
	# En Stripe: `payment_intent.id`.
	payment_reference = models.CharField(max_length=120, blank=True)
	# Total final calculado en backend (nunca confiar en el frontend).
	total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']
		verbose_name = 'Orden'
		verbose_name_plural = 'Órdenes'

	def __str__(self):
		return f'Order #{self.id} - {self.user.email} - {self.status}'


class OrderItem(models.Model):
	"""Snapshot de lo comprado en una orden."""

	order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
	# PROTECT: evita borrar un producto que ya fue vendido.
	product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='order_items')
	# Snapshot histórico para conservar evidencia aunque cambie el catálogo.
	product_title = models.CharField(max_length=255)
	quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
	unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
	line_total = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

	class Meta:
		ordering = ['id']
		verbose_name = 'Ítem de orden'
		verbose_name_plural = 'Ítems de orden'

	def __str__(self):
		return f'{self.product_title} x{self.quantity}'

# Create your models here.
