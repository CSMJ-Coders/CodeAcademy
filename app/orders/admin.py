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
	autocomplete_fields = ['user']
	actions = ['mark_completed', 'mark_failed']
	ordering = ['-created_at']

	@admin.action(description='Marcar órdenes como completadas')
	def mark_completed(self, request, queryset):
		queryset.update(status=Order.STATUS_COMPLETED)

	@admin.action(description='Marcar órdenes como fallidas')
	def mark_failed(self, request, queryset):
		queryset.update(status=Order.STATUS_FAILED)

# Register your models here.
