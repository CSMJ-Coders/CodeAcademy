import { useParams, Navigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { products } from '../data/mockData';
import { ArrowLeft, Download, BookOpen } from 'lucide-react';

export function BookView() {
  const { id } = useParams();
  const { purchasedProducts, bookDownloads, downloadBook } = useAuth();

  const book = products.find(p => p.id === id && p.type === 'book');

  if (!book) {
    return <Navigate to="/dashboard/books" />;
  }

  // Check if user has access
  if (!purchasedProducts.includes(book.id)) {
    return <Navigate to="/access-denied" />;
  }

  const downloads = bookDownloads.find(d => d.bookId === book.id);
  
  const handleDownload = () => {
    const success = downloadBook(book.id);
    if (success) {
      alert(`Descargando "${book.title}"...`);
    } else {
      alert('Has alcanzado el límite de descargas para este libro.');
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard/books"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Mis Libros</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Descargas restantes: {downloads?.downloadsRemaining || 0} / {downloads?.maxDownloads || 0}
              </div>
              <button
                onClick={handleDownload}
                disabled={!downloads || downloads.downloadsRemaining === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <img
                src={book.image}
                alt={book.title}
                className="w-full rounded-lg mb-4"
              />
              <h2 className="font-bold text-gray-900 mb-2">{book.title}</h2>
              <p className="text-gray-600 mb-4">{book.author}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Páginas:</span>
                  <span className="font-medium text-gray-900">{book.pages}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nivel:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {book.level === 'beginner' ? 'Básico' : book.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Idioma:</span>
                  <span className="font-medium text-gray-900">
                    {book.language === 'spanish' ? 'Español' : 'Inglés'}
                  </span>
                </div>
              </div>

              {book.tableOfContents && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Tabla de Contenidos</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {book.tableOfContents.slice(0, 5).map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 font-medium">{index + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                    {book.tableOfContents.length > 5 && (
                      <li className="text-gray-400 text-xs">
                        +{book.tableOfContents.length - 5} capítulos más...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Reader */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-8 min-h-[800px]">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Vista de Lectura</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    En una implementación real, aquí se mostraría el visor de PDF o el lector integrado del libro.
                  </p>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Simulación de página 1 de {book.pages}</p>
                    <div className="bg-gray-50 rounded-lg p-8 text-left max-w-2xl mx-auto">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">{book.title}</h1>
                      <p className="text-gray-700 mb-4">por {book.author}</p>
                      <div className="prose prose-sm text-gray-600">
                        <p className="mb-4">{book.description}</p>
                        <p className="mb-4">
                          Este es un contenido de muestra del libro. En una aplicación real, 
                          aquí se mostraría el contenido completo del PDF o el texto del libro 
                          en un formato de lectura optimizado.
                        </p>
                        <p>
                          Los usuarios podrían navegar entre páginas, ajustar el tamaño del texto, 
                          marcar páginas y tomar notas mientras leen.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-4 pt-4">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        ← Anterior
                      </button>
                      <span className="text-sm text-gray-600">Página 1 de {book.pages}</span>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Siguiente →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
