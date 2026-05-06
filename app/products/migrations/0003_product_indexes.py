from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0002_chapter_is_preview_product_book_file_and_more"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="product",
            index=models.Index(
                fields=["type", "is_active", "-created_at"],
                name="products_pro_type_9d3dd6_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(
                fields=["category", "is_active"], name="products_pro_categor_0749f6_idx"
            ),
        ),
    ]
