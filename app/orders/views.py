from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Order
from .serializers import CreateOrderSerializer, OrderSerializer


class OrderListCreateView(generics.ListCreateAPIView):
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return (
			Order.objects
			.filter(user=self.request.user)
			.prefetch_related('items__product')
			.order_by('-created_at')
		)

	def get_serializer_class(self):
		if self.request.method == 'POST':
			return CreateOrderSerializer
		return OrderSerializer

	def create(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		order = serializer.save()
		output_serializer = OrderSerializer(order, context={'request': request})
		return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
	permission_classes = [IsAuthenticated]
	serializer_class = OrderSerializer

	def get_queryset(self):
		return (
			Order.objects
			.filter(user=self.request.user)
			.prefetch_related('items__product')
			.order_by('-created_at')
		)

# Create your views here.
