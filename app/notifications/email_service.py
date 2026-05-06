from django.core.mail import send_mail

from .base import NotificationService


class EmailNotificationService(NotificationService):
    def notify_purchase(self, user, order) -> None:
        send_mail(
            subject="Compra confirmada",
            message=f"Tu orden #{order.id} fue confirmada.",
            from_email=None,
            recipient_list=[user.email],
            fail_silently=True,
        )

    def notify_course_complete(self, user, course) -> None:
        send_mail(
            subject="Curso completado",
            message=f"Has completado el curso {course.title}.",
            from_email=None,
            recipient_list=[user.email],
            fail_silently=True,
        )
