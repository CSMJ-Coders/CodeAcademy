from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Usuario personalizado del proyecto.

    Extensión Sprint 3:
    - `purchased_products` para controlar acceso a cursos/libros comprados.
    """

    email = models.EmailField(unique=True)

    # Productos que el usuario ya compró.
    # Esto nos permitirá desbloquear contenido en dashboard/curso/libro.
    purchased_products = models.ManyToManyField(
        'products.Product',
        blank=True,
        related_name='buyers',
    )

    preferred_language = models.CharField(
        max_length=10,
        choices=[
            ('es', _('Spanish')),
            ('en', _('English')),
        ],
        default='es'
    )

    is_student = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email