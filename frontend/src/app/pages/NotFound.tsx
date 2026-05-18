import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FileQuestion, Home } from 'lucide-react';

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('errors.pageNotFound')}</h2>
        <p className="text-gray-600 mb-8">
          {t('errors.pageNotFoundDesc')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Home className="w-4 h-4" />
          <span>{t('navbar.home')}</span>
        </Link>
      </div>
    </div>
  );
}
