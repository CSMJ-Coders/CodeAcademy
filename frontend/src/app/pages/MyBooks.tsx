import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { products } from '../data/mockData';
import { BookOpen, Download, Eye, FileText } from 'lucide-react';

export function MyBooks() {
  const { purchasedProducts, bookDownloads, downloadBook } = useAuth();

  const myBooks = products.filter(
    p => p.type === 'book' && purchasedProducts.includes(p.id)
  );

  const getBookDownloads = (bookId: string) => {
    const download = bookDownloads.find(d => d.bookId === bookId);
    return download || { downloadsRemaining: 0, maxDownloads: 0 };
  };

  const handleDownload = (bookId: string, bookTitle: string) => {
    const success = downloadBook(bookId);
    if (success) {
      alert(`Descargando "${bookTitle}"...`);
    } else {
      alert('Has alcanzado el límite de descargas para este libro.');
    }
  };

  if (myBooks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No tienes libros aún</h2>
          <p className="text-gray-600 mb-6">Explora nuestro catálogo y comienza a leer</p>
          <Link
            to="/catalog?type=book"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Explorar Libros
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Mis Libros</h1>
        <p className="text-gray-600 mt-1">{myBooks.length} {myBooks.length === 1 ? 'libro' : 'libros'}</p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myBooks.map(book => {
            const downloads = getBookDownloads(book.id);
            return (
              <div key={book.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[3/4]">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{book.author}</p>
                  
                  {/* Book Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>{book.pages} páginas</span>
                    </div>
                    <span className="capitalize">
                      {book.level === 'beginner' ? 'Básico' : book.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                    </span>
                  </div>

                  {/* Downloads Remaining */}
                  <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Descargas restantes:</span>
                      <span className={`font-medium ${
                        downloads.downloadsRemaining > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {downloads.downloadsRemaining} / {downloads.maxDownloads}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Link
                      to={`/book/${book.id}`}
                      className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Leer en Línea</span>
                    </Link>
                    <button
                      onClick={() => handleDownload(book.id, book.title)}
                      disabled={downloads.downloadsRemaining === 0}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
