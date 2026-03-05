import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedCheckout } from './pages/ProtectedCheckout';
import { ProtectedOrderConfirmation } from './pages/ProtectedOrderConfirmation';
import { ProtectedDashboard } from './pages/ProtectedDashboard';
import { MyProfile } from './pages/MyProfile';
import { MyCourses } from './pages/MyCourses';
import { ProtectedCourseView } from './pages/ProtectedCourseView';
import { MyBooks } from './pages/MyBooks';
import { ProtectedBookView } from './pages/ProtectedBookView';
import { MyOrders } from './pages/MyOrders';
import { AccessDenied } from './pages/AccessDenied';
import { NotFound } from './pages/NotFound';
import { Layout } from './components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'catalog', Component: Catalog },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'checkout', Component: ProtectedCheckout },
      { path: 'order-confirmation/:orderId', Component: ProtectedOrderConfirmation },
      {
        path: 'dashboard',
        Component: ProtectedDashboard,
        children: [
          { index: true, Component: MyProfile },
          { path: 'profile', Component: MyProfile },
          { path: 'courses', Component: MyCourses },
          { path: 'books', Component: MyBooks },
          { path: 'orders', Component: MyOrders },
        ],
      },
      { path: 'access-denied', Component: AccessDenied },
      { path: '*', Component: NotFound },
    ],
  },
  // Routes without layout (fullscreen)
  { path: 'course/:id', Component: ProtectedCourseView },
  { path: 'book/:id', Component: ProtectedBookView },
]);