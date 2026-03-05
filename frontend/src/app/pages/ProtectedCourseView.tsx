import { ProtectedRoute } from '../components/ProtectedRoute';
import { CourseView } from './CourseView';

export function ProtectedCourseView() {
  return (
    <ProtectedRoute>
      <CourseView />
    </ProtectedRoute>
  );
}
