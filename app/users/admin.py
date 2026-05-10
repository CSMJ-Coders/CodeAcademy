from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
	list_display = ('email', 'username', 'first_name', 'last_name', 'preferred_language', 'is_staff')
	search_fields = ('email', 'username', 'first_name', 'last_name')
	ordering = ('email',)
	list_filter = ('is_staff', 'is_superuser', 'is_active', 'preferred_language', 'is_student')
	autocomplete_fields = ()

	fieldsets = BaseUserAdmin.fieldsets + (
		('Code Academy', {'fields': ('preferred_language', 'is_student')}),
	)

	add_fieldsets = BaseUserAdmin.add_fieldsets + (
		('Code Academy', {'fields': ('email', 'preferred_language', 'is_student')}),
	)

	actions = ['mark_active', 'mark_inactive']

	@admin.action(description='Marcar usuarios como activos')
	def mark_active(self, request, queryset):
		queryset.update(is_active=True)

	@admin.action(description='Marcar usuarios como inactivos')
	def mark_inactive(self, request, queryset):
		queryset.update(is_active=False)
