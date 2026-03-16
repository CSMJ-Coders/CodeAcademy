from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
	list_display = ('email', 'username', 'first_name', 'last_name', 'preferred_language', 'is_staff')
	search_fields = ('email', 'username', 'first_name', 'last_name')
	ordering = ('email',)

	fieldsets = BaseUserAdmin.fieldsets + (
		('Code Academy', {'fields': ('preferred_language', 'is_student')}),
	)

	add_fieldsets = BaseUserAdmin.add_fieldsets + (
		('Code Academy', {'fields': ('email', 'preferred_language', 'is_student')}),
	)
