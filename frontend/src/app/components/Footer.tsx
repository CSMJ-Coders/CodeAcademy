import { Link } from 'react-router';
import { GraduationCap, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl text-gray-900">Code Academy</span>
            </Link>
            <p className="text-gray-600 text-sm">
              {t('footer.description','La mejor plataforma para aprender programación con cursos y libros especializados.')}
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.platform','Plataforma')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog?type=course" className="text-gray-600 hover:text-gray-900 text-sm">
                  {t('words.course','Cursos')}
                </Link>
              </li>
              <li>
                <Link to="/catalog?type=book" className="text-gray-600 hover:text-gray-900 text-sm">
                  {t('words.book','Libros')}
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-600 hover:text-gray-900 text-sm">
                  {t('navbar.catalog','Explorar')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.support','Soporte')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
                  {t('footer.helpCenter','Centro de Ayuda')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
                  {t('footer.contact','Contacto')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
                  {t('footer.faq','FAQ')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('footer.legal','Legal')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
                  {t('footer.terms','Términos y Condiciones')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
                  {t('footer.privacy','Política de Privacidad')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">
                  {t('footer.cookies','Política de Cookies')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            {t('footer.copyright','© 2026 Code Academy. Todos los derechos reservados.')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-gray-600">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
