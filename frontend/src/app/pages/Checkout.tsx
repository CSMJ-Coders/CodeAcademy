import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { confirmStripeOrderPayment, createStripePaymentIntent } from '../services/api';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

/**
 * Form de pago aislado para usar hooks de Stripe (`useStripe`, `useElements`).
 * Flujo:
 * 1) backend crea PaymentIntent,
 * 2) Stripe confirma la tarjeta,
 * 3) backend confirma estado de orden,
 * 4) se notifica éxito al componente padre.
 */
function StripePaymentForm({
  items,
  onSuccess,
}: {
  items: Array<{ product: { id: string }; quantity: number }>;
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setPaymentStatus('pending');
    setErrorMessage('');

    try {
      // Paso 1: crear intención de pago (backend).
      const { clientSecret, order } = await createStripePaymentIntent(
        items.map((item) => ({
          product_id: Number(item.product.id),
          quantity: item.quantity,
        }))
      );

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('No se pudo inicializar el formulario de tarjeta.');
      }

      // Paso 2: confirmar tarjeta en Stripe.js (cliente).
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        throw new Error(result.error.message || 'No se pudo confirmar el pago.');
      }

      // Paso 3: confirmar estado en backend y desbloquear acceso.
      await confirmStripeOrderPayment(order.id);
      setPaymentStatus('success');
      setTimeout(() => onSuccess(order.id), 900);
    } catch (error) {
      setPaymentStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Error inesperado en el pago.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
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
            <span className="font-medium text-gray-900">Tarjeta de Crédito/Débito (Stripe Test)</span>
          </label>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">Datos de tarjeta</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#111827',
                  '::placeholder': { color: '#9CA3AF' },
                },
              },
            }}
          />
          <p className="text-xs text-gray-500 mt-3">Tarjeta de prueba: 4242 4242 4242 4242</p>
        </div>
      </div>

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
            <p className="text-sm">{errorMessage || 'Por favor, verifica tus datos e intenta nuevamente.'}</p>
          </div>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={processing || paymentStatus === 'success' || !stripe || !elements}
        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Procesando...' : paymentStatus === 'success' ? 'Completado' : 'Confirmar Pago'}
      </button>
    </>
  );
}

export function Checkout() {
  const { user, addPurchasedProduct } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  // Redirect if not logged in or cart is empty
  if (!user) {
    return <Navigate to="/login?redirect=/checkout" />;
  }

  if (items.length === 0) {
    return <Navigate to="/cart" />;
  }

  const handlePaymentSuccess = (orderId: string) => {
    // UX inmediata del cliente. El backend ya guardó la compra.
    items.forEach((item) => addPurchasedProduct(item.product.id));
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
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

              {!stripePromise ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                  {/* Mensaje explícito para que cualquier dev sepa qué falta configurar. */}
                  Configura VITE_STRIPE_PUBLISHABLE_KEY en el frontend para habilitar pagos con Stripe.
                </div>
              ) : (
                <Elements stripe={stripePromise}>
                  <StripePaymentForm items={items} onSuccess={handlePaymentSuccess} />
                </Elements>
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
