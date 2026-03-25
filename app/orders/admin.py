from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
	model = OrderItem
	extra = 0
	readonly_fields = ['product', 'product_title', 'quantity', 'unit_price', 'line_total']
	can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
	list_display = ['id', 'user', 'status', 'payment_provider', 'total_amount', 'created_at']
	list_filter = ['status', 'payment_provider', 'created_at']
	search_fields = ['id', 'user__email', 'payment_reference']
	readonly_fields = ['created_at', 'updated_at']
	inlines = [OrderItemInline]

# Register your models here.
