import { Link } from 'react-router';
import { BookOpen, GraduationCap, Star, Clock, FileText } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const Icon = product.type === 'course' ? GraduationCap : BookOpen;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
            Nuevo
          </span>
        )}
        {product.originalPrice && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
            Oferta
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Type and Level */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1 text-blue-600">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium capitalize">{product.type === 'course' ? 'Curso' : 'Libro'}</span>
          </div>
          <span className="text-xs text-gray-500 capitalize">
            {product.level === 'beginner' ? 'Básico' : product.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        {/* Author */}
        <p className="text-sm text-gray-600 mb-3">{product.author}</p>

        {/* Meta Info */}
        <div className="flex items-center space-x-4 mb-3 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
          </div>
          {product.type === 'course' && product.duration && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{product.duration}</span>
            </div>
          )}
          {product.type === 'book' && product.pages && (
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{product.pages} págs</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through mr-2">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}