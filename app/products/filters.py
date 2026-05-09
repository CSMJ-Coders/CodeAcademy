from django_filters import rest_framework as filters

from .models import Product


class ProductFilterSet(filters.FilterSet):
    category = filters.CharFilter(field_name="category__name", lookup_expr="iexact")

    class Meta:
        model = Product
        fields = ["type", "level", "language", "is_featured", "is_new", "category"]
