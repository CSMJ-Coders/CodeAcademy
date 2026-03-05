import { Link } from 'react-router';
import { ArrowRight, Code2, Globe, Brain, Server, Database, Smartphone, CheckCircle2, Download, Languages, Zap } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { products, categories } from '../data/mockData';

const iconMap: Record<string, any> = {
  'code-2': Code2,
  'globe': Globe,
  'brain': Brain,
  'server': Server,
  'database': Database,
  'smartphone': Smartphone,
};

export function Home() {
  const featuredProducts = products.filter(p => p.isFeatured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Aprende Programación con Cursos y Libros Especializados
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Accede a contenido de calidad creado por expertos. Cursos interactivos y libros técnicos para impulsar tu carrera en tecnología.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/catalog?type=course"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <span>Explorar Cursos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/catalog?type=book"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>Ver Libros</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop"
                alt="Learning"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explora por Categoría</h2>
            <p className="text-gray-600">Encuentra el contenido perfecto para tu objetivo de aprendizaje</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] || Code2;
              return (
                <Link
                  key={category.id}
                  to={`/catalog?category=${encodeURIComponent(category.name)}`}
                  className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-600 hover:shadow-md transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
            <p className="text-gray-600">Los cursos y libros más populares de nuestra plataforma</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/catalog"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <span>Ver todo el catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué Code Academy?</h2>
            <p className="text-gray-600">Beneficios que te ayudarán a alcanzar tus metas</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Acceso Inmediato</h3>
              <p className="text-gray-600 text-sm">
                Comienza a aprender al instante después de tu compra
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contenido Especializado</h3>
              <p className="text-gray-600 text-sm">
                Material creado por expertos de la industria
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Descargas Seguras</h3>
              <p className="text-gray-600 text-sm">
                Descarga tus libros de forma segura y confiable
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <Languages className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Múltiples Idiomas</h3>
              <p className="text-gray-600 text-sm">
                Contenido disponible en español e inglés
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar tu viaje de aprendizaje?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Únete a miles de desarrolladores que ya están mejorando sus habilidades
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
