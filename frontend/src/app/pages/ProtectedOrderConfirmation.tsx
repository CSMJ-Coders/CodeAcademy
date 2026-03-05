import { ProtectedRoute } from '../components/ProtectedRoute';
import { OrderConfirmation } from './OrderConfirmation';

export function ProtectedOrderConfirmation() {
  return (
    <ProtectedRoute>
      <OrderConfirmation />
    </ProtectedRoute>
  );
}
