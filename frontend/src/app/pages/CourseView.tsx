import { useParams, Navigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { products } from '../data/mockData';
import { CheckCircle2, Circle, Lock, Play, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function CourseView() {
  const { id } = useParams();
  const { purchasedProducts, courseProgress, updateCourseProgress } = useAuth();
  const [currentChapter, setCurrentChapter] = useState(0);

  const course = products.find(p => p.id === id && p.type === 'course');

  if (!course) {
    return <Navigate to="/dashboard/courses" />;
  }

  // Check if user has access
  if (!purchasedProducts.includes(course.id)) {
    return <Navigate to="/access-denied" />;
  }

  const progress = courseProgress.find(p => p.courseId === course.id);
  const completedChapters = progress?.completedChapters || [];

  const handleChapterComplete = () => {
    if (course.chapters && course.chapters[currentChapter]) {
      updateCourseProgress(course.id, course.chapters[currentChapter].id);
    }
  };

  const handleNextChapter = () => {
    if (course.chapters && currentChapter < course.chapters.length - 1) {
      handleChapterComplete();
      setCurrentChapter(currentChapter + 1);
    }
  };

  const totalChapters = course.chapters?.length || 0;
  const progressPercentage = totalChapters > 0 
    ? Math.round((completedChapters.length / totalChapters) * 100) 
    : 0;

  return (
    <div className="min-h-screen pt-16 bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/dashboard/courses"
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Mis Cursos</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Progreso: {progressPercentage}%
            </div>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 flex gap-4">
        {/* Video Player */}
        <div className="flex-1">
          <div className="bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <Play className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-white text-lg mb-2">
                  {course.chapters?.[currentChapter]?.title}
                </p>
                <p className="text-gray-400 text-sm">
                  Duración: {course.chapters?.[currentChapter]?.duration}
                </p>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-gray-800 rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-400 mb-4">{course.author}</p>
            <p className="text-gray-300">{course.description}</p>

            {/* Controls */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleChapterComplete}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar como Completado</span>
              </button>
              {course.chapters && currentChapter < course.chapters.length - 1 && (
                <button
                  onClick={handleNextChapter}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Siguiente Capítulo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chapters Sidebar */}
        <div className="w-80 bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-semibold text-white">Contenido del Curso</h2>
            <p className="text-sm text-gray-400 mt-1">
              {completedChapters.length} de {totalChapters} completados
            </p>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {course.chapters?.map((chapter, index) => {
              const isCompleted = completedChapters.includes(chapter.id);
              const isCurrent = index === currentChapter;
              return (
                <button
                  key={chapter.id}
                  onClick={() => setCurrentChapter(index)}
                  className={`w-full p-4 border-b border-gray-700 text-left hover:bg-gray-700 transition-colors ${
                    isCurrent ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : isCurrent ? (
                        <Play className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium mb-1 ${
                        isCurrent ? 'text-white' : 'text-gray-300'
                      }`}>
                        {index + 1}. {chapter.title}
                      </p>
                      <p className="text-xs text-gray-400">{chapter.duration}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
