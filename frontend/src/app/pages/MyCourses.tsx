import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { products } from '../data/mockData';
import { GraduationCap, Clock, Play } from 'lucide-react';

export function MyCourses() {
  const { purchasedProducts, courseProgress } = useAuth();

  const myCourses = products.filter(
    p => p.type === 'course' && purchasedProducts.includes(p.id)
  );

  const getCourseProgress = (courseId: string) => {
    const progress = courseProgress.find(p => p.courseId === courseId);
    if (!progress || !progress.completedChapters) return 0;
    
    const course = products.find(p => p.id === courseId);
    if (!course || !course.chapters) return 0;
    
    return Math.round((progress.completedChapters.length / course.chapters.length) * 100);
  };

  if (myCourses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No tienes cursos aún</h2>
          <p className="text-gray-600 mb-6">Explora nuestro catálogo y comienza a aprender</p>
          <Link
            to="/catalog?type=course"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Explorar Cursos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
        <p className="text-gray-600 mt-1">{myCourses.length} {myCourses.length === 1 ? 'curso' : 'cursos'}</p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map(course => {
            const progress = getCourseProgress(course.id);
            return (
              <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-video">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Link
                      to={`/course/${course.id}`}
                      className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Continuar</span>
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{course.author}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progreso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                    <span className="capitalize">
                      {course.level === 'beginner' ? 'Básico' : course.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                    </span>
                  </div>

                  <Link
                    to={`/course/${course.id}`}
                    className="mt-4 block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
                  >
                    {progress > 0 ? 'Continuar' : 'Comenzar'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
