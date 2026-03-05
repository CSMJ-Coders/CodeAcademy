import { useParams, Link } from 'react-router';
import { useOrders } from '../contexts/OrderContext';
import { CheckCircle2, Download, GraduationCap, BookOpen } from 'lucide-react';

export function OrderConfirmation() {
  const { orderId } = useParams();
  const { orders } = useOrders();

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Orden no encontrada</h1>
          <Link to="/dashboard/orders" className="text-blue-600 hover:text-blue-700">
            Ver mis órdenes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Compra Exitosa!</h1>
          <p className="text-gray-600">Tu orden ha sido procesada correctamente</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Orden #{order.id}</h2>
              <p className="text-sm text-gray-500">
                {new Date(order.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                Completado
              </span>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Productos Adquiridos</h3>
            {order.items.map(item => {
              const Icon = item.product.type === 'course' ? GraduationCap : BookOpen;
              return (
                <div key={item.product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-20 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium capitalize">
                        {item.product.type === 'course' ? 'Curso' : 'Libro'}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900">{item.product.title}</h4>
                    <p className="text-sm text-gray-500">{item.product.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${item.product.price.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Próximos Pasos</h3>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Tus productos están disponibles en tu cuenta</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Puedes acceder a tus cursos y libros en cualquier momento</span>
            </li>
            <li className="flex items-start space-x-2">
              <Download className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Los libros están listos para descargar (3 descargas por libro)</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/dashboard/courses"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
          >
            Ver Mis Cursos
          </Link>
          <Link
            to="/dashboard/books"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium"
          >
            Ver Mis Libros
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link to="/catalog" className="text-blue-600 hover:text-blue-700">
            Continuar explorando el catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
