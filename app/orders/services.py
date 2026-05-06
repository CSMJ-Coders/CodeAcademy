from django.db import transaction

from .models import Order


def grant_user_access_for_products(user, product_ids):
    product_ids = list(product_ids)
    if product_ids:
        user.purchased_products.add(*product_ids)


@transaction.atomic
def mark_order_completed(order: Order):
    if order.status != Order.STATUS_COMPLETED:
        order.status = Order.STATUS_COMPLETED
        order.save(update_fields=["status", "updated_at"])

    grant_user_access_for_products(
        order.user, order.items.values_list("product_id", flat=True)
    )


@transaction.atomic
def mark_order_failed(order: Order):
    if order.status != Order.STATUS_FAILED:
        order.status = Order.STATUS_FAILED
        order.save(update_fields=["status", "updated_at"])
