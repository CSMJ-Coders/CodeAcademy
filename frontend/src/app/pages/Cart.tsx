import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Cart() {
  const { t } = useTranslation();
  const { items, removeFromCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h1>
            <p className="text-gray-600 mb-8">
              {t('cart.emptyDesc')}
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span>{t('buttons.exploreCatalog')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.product.id} className="p-6 flex gap-4">
                  {/* Image */}
                  <ImageWithFallback
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-32 h-24 object-cover rounded-lg"
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 mb-1 block"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-sm text-gray-600 mb-2">{item.product.author}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 capitalize">
                        {t(`words.${item.product.type}`)}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 capitalize">
                        {t(`words.${item.product.level === 'beginner' ? 'basic' : item.product.level === 'intermediate' ? 'intermediate' : 'advanced'}`)}
                      </span>
                    </div>
                  </div>

                  {/* Price and Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      {item.product.originalPrice && (
                        <div className="text-sm text-gray-400 line-through">
                          ${item.product.originalPrice.toFixed(2)}
                        </div>
                      )}
                      <div className="text-xl font-bold text-gray-900">
                        ${item.product.price.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">{t('buttons.remove')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">{t('cart.orderSummary')}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} {items.length === 1 ? t('cart.item') : t('cart.items')})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.taxes')}</span>
                  <span>{t('cart.included')}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">{t('cart.total')}</span>
                    <span className="font-bold text-2xl text-gray-900">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!user && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {t('messages.mustLogin')}
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
              >
                <span>{t('cart.proceed')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/catalog"
                className="block text-center mt-4 text-blue-600 hover:text-blue-700"
              >
                {t('buttons.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
