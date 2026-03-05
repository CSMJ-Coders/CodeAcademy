"""
Core Models - Modelos Base Reutilizables
========================================

¿Qué es un modelo "abstracto"?
  Un modelo abstracto NO crea tabla en la base de datos.
  Solo sirve como "plantilla" para que otros modelos HEREDEN sus campos.

¿Por qué lo hacemos?
  Porque TODOS nuestros modelos necesitan saber:
  - ¿Cuándo se creó este registro? (created_at)
  - ¿Cuándo se modificó por última vez? (updated_at)

  En vez de escribir esos campos en Product, Order, Cart, etc.,
  los definimos UNA VEZ aquí y todos los modelos los heredan.

Ejemplo de uso:
  class Product(TimeStampedModel):
      title = models.CharField(max_length=200)
      # Product automáticamente tendrá created_at y updated_at
"""

from django.db import models


class TimeStampedModel(models.Model):
    """
    Modelo abstracto que agrega campos de timestamp.
    Todos los modelos de la aplicación deben heredar de este.
    """

    # auto_now_add=True: se llena AUTOMÁTICAMENTE cuando se CREA el registro
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de creación'
    )

    # auto_now=True: se actualiza AUTOMÁTICAMENTE cada vez que se GUARDA
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última actualización'
    )

    class Meta:
        # abstract=True significa: NO crear tabla para este modelo
        # Solo es una plantilla para que otros hereden
        abstract = True

        # Ordenar por fecha de creación (más reciente primero)
        ordering = ['-created_at']
