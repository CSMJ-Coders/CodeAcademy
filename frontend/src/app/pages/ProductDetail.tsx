import { useParams, useNavigate, Link } from 'react-router';
import { products } from '../data/mockData';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Star, Clock, FileText, BookOpen, GraduationCap, Globe, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, purchasedProducts } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <Link to="/catalog" className="text-blue-600 hover:text-blue-700">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const isPurchased = purchasedProducts.includes(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span>Producto agregado al carrito</span>
          </div>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Image */}
          <div>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.isNew && (
              <span className="inline-block px-3 py-1 bg-green-500 text-white text-sm font-medium rounded mr-2">
                Nuevo
              </span>
            )}
            {product.originalPrice && (
              <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm font-medium rounded">
                En Oferta
              </span>
            )}
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Type Badge */}
            <div className="flex items-center space-x-2 mb-4">
              {product.type === 'course' ? (
                <>
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Curso Online</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Libro Digital</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
                <span>(150 valoraciones)</span>
              </div>
              <span>•</span>
              <span className="capitalize">
                {product.level === 'beginner' ? 'Nivel Básico' : product.level === 'intermediate' ? 'Nivel Intermedio' : 'Nivel Avanzado'}
              </span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>{product.language === 'spanish' ? 'Español' : 'Inglés'}</span>
              </div>
            </div>

            {/* Author */}
            <p className="text-gray-700 mb-6">
              <span className="font-medium">Por:</span> {product.author}
            </p>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              {product.type === 'course' && product.duration && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">{product.duration}</span>
                </div>
              )}
              {product.type === 'book' && product.pages && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">{product.pages} páginas</span>
                </div>
              )}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{product.category}</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline space-x-3">
                {product.originalPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-4xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              {product.originalPrice && (
                <p className="text-sm text-green-600 mt-2">
                  Ahorra ${(product.originalPrice - product.price).toFixed(2)} ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% de descuento)
                </p>
              )}
            </div>

            {/* Actions */}
            {isPurchased ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Ya has adquirido este producto</span>
                </div>
                <Link
                  to={product.type === 'course' ? '/dashboard/courses' : '/dashboard/books'}
                  className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                >
                  {product.type === 'course' ? 'Ir a Mis Cursos' : 'Ir a Mis Libros'}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Comprar Ahora
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </div>

        {/* Content Section */}
        {product.type === 'course' && product.chapters && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contenido del Curso</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {product.chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="p-4 border-b border-gray-200 last:border-b-0 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{chapter.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">{chapter.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {product.type === 'book' && product.tableOfContents && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tabla de Contenidos</h2>
            <div className="bg-white border border-gray-200 rounded-lg">
              <ul className="divide-y divide-gray-200">
                {product.tableOfContents.map((item, index) => (
                  <li key={index} className="p-4 hover:bg-gray-50">
                    <span className="text-gray-900">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
