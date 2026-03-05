import { Link } from 'react-router';
import { Lock, ArrowRight } from 'lucide-react';

export function AccessDenied() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
        <p className="text-gray-600 mb-8">
          No tienes acceso a este contenido. Para poder acceder, primero debes adquirir este producto.
        </p>
        <div className="space-y-4">
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>Ir al Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
