import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { fetchProducts, fetchCategories } from '../services/api';
import { SlidersHorizontal } from 'lucide-react';
import type { Product, Category, ProductType, Level, Language } from '../types';

export function Catalog() {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(true);

  // Filter states — inicializados desde la URL para que los links de Home funcionen
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>(
    (searchParams.get('type') as ProductType) || 'all'
  );
  const [selectedLevel, setSelectedLevel] = useState<Level | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Datos del backend
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga las categorías una sola vez al montar el componente
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(err => console.error('Error cargando categorías:', err));
  }, []);

  // Cada vez que cambia un filtro (tipo, nivel, idioma, categoría, búsqueda),
  // hacemos una nueva petición al backend con los filtros como query params.
  // El price range no está en el API, se aplica abajo como filtro local.
  useEffect(() => {
    setLoading(true);
    fetchProducts({
      type:           selectedType     !== 'all' ? selectedType     : undefined,
      level:          selectedLevel    !== 'all' ? selectedLevel    : undefined,
      language:       selectedLanguage !== 'all' ? selectedLanguage : undefined,
      category__name: selectedCategory !== 'all' ? selectedCategory : undefined,
      search:         searchQuery || undefined,
    })
      .then(setProducts)
      .catch(err => console.error('Error cargando productos:', err))
      .finally(() => setLoading(false));
  }, [selectedType, selectedLevel, selectedLanguage, selectedCategory, searchQuery]);

  // Filtro de precio local: se aplica en el cliente sobre los resultados del backend
  const filteredProducts = useMemo(() => {
    return products.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
  }, [products, priceRange]);

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedLevel('all');
    setSelectedLanguage('all');
    setSelectedCategory('all');
    setPriceRange([0, 200]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Productos</h1>
          <p className="text-gray-600">
            {loading
              ? 'Buscando productos...'
              : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}`
            }
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
            <div className="sticky top-24 bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filtros</span>
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Limpiar
                </button>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Tipo</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      checked={selectedType === 'all'}
                      onChange={() => setSelectedType('all')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Todos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      checked={selectedType === 'course'}
                      onChange={() => setSelectedType('course')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Cursos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      checked={selectedType === 'book'}
                      onChange={() => setSelectedType('book')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Libros</span>
                  </label>
                </div>
              </div>

              {/* Level Filter */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Nivel</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="level"
                      checked={selectedLevel === 'all'}
                      onChange={() => setSelectedLevel('all')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Todos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="level"
                      checked={selectedLevel === 'beginner'}
                      onChange={() => setSelectedLevel('beginner')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Básico</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="level"
                      checked={selectedLevel === 'intermediate'}
                      onChange={() => setSelectedLevel('intermediate')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Intermedio</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="level"
                      checked={selectedLevel === 'advanced'}
                      onChange={() => setSelectedLevel('advanced')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Avanzado</span>
                  </label>
                </div>
              </div>

              {/* Language Filter */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Idioma</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      checked={selectedLanguage === 'all'}
                      onChange={() => setSelectedLanguage('all')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Todos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      checked={selectedLanguage === 'spanish'}
                      onChange={() => setSelectedLanguage('spanish')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Español</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      checked={selectedLanguage === 'english'}
                      onChange={() => setSelectedLanguage('english')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Inglés</span>
                  </label>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Categoría</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Todas</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.name}
                        onChange={() => setSelectedCategory(cat.name)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Precio</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden mb-4 px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtros</span>
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No se encontraron productos con los filtros seleccionados</p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
