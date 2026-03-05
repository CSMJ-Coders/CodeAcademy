import { Link, Outlet, useLocation } from 'react-router';
import { User, GraduationCap, BookOpen, Package } from 'lucide-react';

export function Dashboard() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard/profile', label: 'Mi Perfil', icon: User },
    { path: '/dashboard/courses', label: 'Mis Cursos', icon: GraduationCap },
    { path: '/dashboard/books', label: 'Mis Libros', icon: BookOpen },
    { path: '/dashboard/orders', label: 'Mis Órdenes', icon: Package },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4 px-2">Mi Cuenta</h2>
              <nav className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
