"""
Core Permissions - Permisos Personalizados
==========================================

¿Qué son los permisos en DRF?
  Antes de ejecutar una View, DRF verifica si el usuario tiene PERMISO.
  Son como un guardia de seguridad en la puerta.

¿Cómo funcionan?
  Cada View puede tener una lista de permisos:
    permission_classes = [IsAuthenticated, IsOwner]

  DRF verifica TODOS. Si alguno dice "no", la petición se rechaza con 403 Forbidden.

Permisos incluidos en DRF:
  - AllowAny: cualquiera puede acceder (público)
  - IsAuthenticated: solo usuarios logueados
  - IsAdminUser: solo administradores

Permisos que creamos nosotros:
  - IsOwner: solo el dueño del recurso puede verlo/editarlo
    Ejemplo: Solo TÚ puedes ver TUS órdenes, no las de otro usuario.
"""

from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Permiso: solo el dueño del objeto puede acceder.

    ¿Cómo funciona?
    1. DRF obtiene el objeto (ej: una Orden con id=5)
    2. Llama a has_object_permission()
    3. Compara obj.user con request.user
    4. Si son el mismo → permitir. Si no → denegar.

    Uso en una View:
        class MyOrderDetailView(RetrieveAPIView):
            permission_classes = [IsAuthenticated, IsOwner]
    """

    def has_object_permission(self, request, view, obj):
        # Verifica si el objeto tiene un campo 'user'
        # y si ese user es el mismo que hace la petición
        return hasattr(obj, 'user') and obj.user == request.user
