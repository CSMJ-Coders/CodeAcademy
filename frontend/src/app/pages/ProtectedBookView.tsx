import { ProtectedRoute } from '../components/ProtectedRoute';
import { BookView } from './BookView';

export function ProtectedBookView() {
  return (
    <ProtectedRoute>
      <BookView />
    </ProtectedRoute>
  );
}
