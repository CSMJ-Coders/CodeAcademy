import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrderContext';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';

export function Checkout() {
  const { user, addPurchasedProduct } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { createOrder, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  // Redirect if not logged in or cart is empty
  if (!user) {
    return <Navigate to="/login?redirect=/checkout" />;
  }

  if (items.length === 0) {
    return <Navigate to="/cart" />;
  }

  const handlePayment = async () => {
    setProcessing(true);
    setPaymentStatus('pending');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      // Create order
      const order = createOrder(items, user.id, totalPrice);
      
      // Update order status
      updateOrderStatus(order.id, 'completed');

      // Add purchased products to user's account
      items.forEach(item => {
        addPurchasedProduct(item.product.id);
      });

      // Clear cart
      clearCart();

      setPaymentStatus('success');
      setProcessing(false);

      // Redirect to order confirmation
      setTimeout(() => {
        navigate(`/order-confirmation/${order.id}`);
      }, 2000);
    } else {
      setPaymentStatus('failed');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Resumen de Orden</h2>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.product.title}</p>
                        <p className="text-xs text-gray-500">{item.product.author}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900">${item.product.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Método de Pago</h2>
              
              <div className="space-y-4">
                <div className="border border-blue-600 rounded-lg p-4 bg-blue-50">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      defaultChecked
                      className="w-4 h-4 text-blue-600"
                    />
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Tarjeta de Crédito/Débito</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Expiración
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre en la Tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="JUAN PÉREZ"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {paymentStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>¡Pago completado exitosamente! Redirigiendo...</span>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-700">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">El pago falló</p>
                    <p className="text-sm">Por favor, verifica tus datos e intenta nuevamente.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Total */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Total de la Orden</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Impuestos</span>
                  <span>Incluidos</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-gray-900">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing || paymentStatus === 'success'}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Procesando...' : paymentStatus === 'success' ? 'Completado' : 'Confirmar Pago'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al confirmar el pago, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
