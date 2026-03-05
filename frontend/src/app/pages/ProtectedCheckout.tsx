import { ProtectedRoute } from '../components/ProtectedRoute';
import { Checkout } from './Checkout';

export function ProtectedCheckout() {
  return (
    <ProtectedRoute>
      <Checkout />
    </ProtectedRoute>
  );
}
