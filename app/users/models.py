from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)

    preferred_language = models.CharField(
        max_length=10,
        choices=[
            ('es', 'Spanish'),
            ('en', 'English'),
        ],
        default='es'
    )

    is_student = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email