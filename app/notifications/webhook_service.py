import os

import requests

from .base import NotificationService


class WebhookNotificationService(NotificationService):
    def __init__(self, webhook_url=None):
        self.webhook_url = webhook_url or os.environ.get(
            "NOTIFICATIONS_WEBHOOK_URL", ""
        )

    def notify_purchase(self, user, order) -> None:
        if not self.webhook_url:
            return

        requests.post(
            self.webhook_url,
            json={"event": "purchase", "user_id": user.id, "order_id": order.id},
            timeout=5,
        )

    def notify_course_complete(self, user, course) -> None:
        if not self.webhook_url:
            return

        requests.post(
            self.webhook_url,
            json={
                "event": "course_complete",
                "user_id": user.id,
                "course_id": course.id,
            },
            timeout=5,
        )
