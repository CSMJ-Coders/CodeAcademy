import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Mail, User as UserIcon, Calendar } from 'lucide-react';

export function MyProfile() {
  const { t } = useTranslation();
  const { user, purchasedProducts } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.profile')}</h1>
      </div>

      <div className="p-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-center space-x-6 mb-8">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-blue-600" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('myProfile.accountInfo')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{t('myProfile.name')}</span>
                </div>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{t('myProfile.email')}</span>
                </div>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{t('myProfile.memberSince')}</span>
                </div>
                <p className="font-medium text-gray-900">{t('myProfile.joinDate')}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{t('myProfile.purchasedProducts')}</span>
                </div>
                <p className="font-medium text-gray-900">{purchasedProducts.length}</p>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="pt-6 border-t border-gray-200">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t('myProfile.editProfile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
