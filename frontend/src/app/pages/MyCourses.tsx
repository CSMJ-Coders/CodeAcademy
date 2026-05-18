import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Clock, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchCourseProgress, fetchProducts } from '../services/api';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { Product } from '../types';

export function MyCourses() {
  const { t } = useTranslation();
  const { purchasedProducts } = useAuth();
  const [myCourses, setMyCourses] = useState<Product[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const allCourses = await fetchProducts({ type: 'course' });
        const purchased = allCourses.filter(c => purchasedProducts.includes(c.id));
        setMyCourses(purchased);
      } catch {
        setMyCourses([]);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [purchasedProducts.join(',')]);

  useEffect(() => {
    if (myCourses.length === 0) return;

    Promise.all(
      myCourses.map(async (course) => {
        try {
          const progress = await fetchCourseProgress(course.id);
          return [course.id, progress.progress] as const;
        } catch {
          return [course.id, 0] as const;
        }
      })
    ).then((entries) => {
      setProgressMap(Object.fromEntries(entries));
    });
  }, [myCourses.map(c => c.id).join(',')]);

  const getCourseProgress = (courseId: string) => progressMap[courseId] ?? 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <p className="text-gray-600">{t('myCourses.loading')}</p>
        </div>
      </div>
    );
  }

  if (myCourses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('messages.noCourses')}</h2>
          <p className="text-gray-600 mb-6">{t('messages.exploreCatalog')}</p>
          <Link
            to="/catalog?type=course"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('navbar.courses')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{t('myCourses.title')}</h1>
        <p className="text-gray-600 mt-1">{myCourses.length} {myCourses.length === 1 ? t('myCourses.course') : t('myCourses.courses')}</p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map(course => {
            const progress = getCourseProgress(course.id);
            return (
              <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-video">
                  <ImageWithFallback
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
                      <span>{t('buttons.continueCourse')}</span>
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
                      <span>{t('product.progress')}</span>
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
                      {t(`words.${course.level === 'beginner' ? 'basic' : course.level === 'intermediate' ? 'intermediate' : 'advanced'}`)}
                    </span>
                  </div>

                  <Link
                    to={`/course/${course.id}`}
                    className="mt-4 block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
                  >
                    {progress > 0 ? t('buttons.continueCourse') : t('buttons.startCourse')}
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
