import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, CourseProgress, BookDownload } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  purchasedProducts: string[];
  addPurchasedProduct: (productId: string) => void;
  courseProgress: CourseProgress[];
  updateCourseProgress: (courseId: string, chapterId: string) => void;
  bookDownloads: BookDownload[];
  downloadBook: (bookId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'code_academy_access_token';
const REFRESH_TOKEN_KEY = 'code_academy_refresh_token';

type ApiUser = {
  id: number | string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
};

function mapApiUserToFrontendUser(apiUser: ApiUser): User {
  const composedName = `${apiUser.first_name ?? ''} ${apiUser.last_name ?? ''}`.trim();

  return {
    id: String(apiUser.id),
    email: apiUser.email,
    name: apiUser.name || composedName || apiUser.email.split('@')[0],
  };
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.detail === 'string') {
      return data.detail;
    }

    if (typeof data?.message === 'string') {
      return data.message;
    }

    const firstStringFieldError = Object.values(data ?? {}).find((value) => typeof value === 'string');
    if (typeof firstStringFieldError === 'string') {
      return firstStringFieldError;
    }

    const firstFieldError = Object.values(data ?? {}).find((value) => Array.isArray(value));
    if (Array.isArray(firstFieldError) && firstFieldError.length > 0) {
      return String(firstFieldError[0]);
    }
  } catch {
    // ignored
  }

  return 'Ocurrió un error inesperado.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [bookDownloads, setBookDownloads] = useState<BookDownload[]>([]);

  const refreshAccessToken = async (): Promise<string | null> => {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
      if (data.refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
      }

      return data.access;
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorMessage = await parseApiError(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      localStorage.setItem(ACCESS_TOKEN_KEY, data.tokens.access);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refresh);
      setUser(mapApiUserToFrontendUser(data.user));
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('No se pudo iniciar sesión. Intenta nuevamente.');
    }
  };

  const logout = () => {
    const access = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (access && refresh) {
      fetch('/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      }).catch(() => {
        // Si falla el logout remoto, igual cerramos localmente la sesión.
      });
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
    setPurchasedProducts([]);
    setCourseProgress([]);
    setBookDownloads([]);
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          password,
          password_confirm: password,
          preferred_language: 'es',
        }),
      });

      if (!response.ok) {
        const errorMessage = await parseApiError(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      localStorage.setItem(ACCESS_TOKEN_KEY, data.tokens.access);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refresh);
      setUser(mapApiUserToFrontendUser(data.user));

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('No se pudo crear la cuenta. Intenta nuevamente.');
    }
  };

  useEffect(() => {
    async function bootstrapSession() {
      const access = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!access) {
        return;
      }

      try {
        let accessForRequest = access;
        let response = await fetch('/api/auth/profile/', {
          headers: {
            Authorization: `Bearer ${accessForRequest}`,
          },
        });

        if (response.status === 401) {
          const newAccess = await refreshAccessToken();
          if (!newAccess) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            return;
          }

          accessForRequest = newAccess;
          response = await fetch('/api/auth/profile/', {
            headers: {
              Authorization: `Bearer ${accessForRequest}`,
            },
          });
        }

        if (!response.ok) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          return;
        }

        const data = await response.json();
        setUser(mapApiUserToFrontendUser(data));
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }

    bootstrapSession();
  }, []);

  const addPurchasedProduct = (productId: string) => {
    if (!purchasedProducts.includes(productId)) {
      setPurchasedProducts(prev => [...prev, productId]);
      
      // Initialize book downloads (3 downloads per book)
      setBookDownloads(prev => [...prev, {
        bookId: productId,
        downloadsRemaining: 3,
        maxDownloads: 3
      }]);
      
      // Initialize course progress
      setCourseProgress(prev => [...prev, {
        courseId: productId,
        progress: 0,
        completedChapters: []
      }]);
    }
  };

  const updateCourseProgress = (courseId: string, chapterId: string) => {
    setCourseProgress(prev => {
      const existing = prev.find(p => p.courseId === courseId);
      if (existing) {
        const completedChapters = existing.completedChapters.includes(chapterId)
          ? existing.completedChapters
          : [...existing.completedChapters, chapterId];
        
        return prev.map(p => 
          p.courseId === courseId 
            ? { ...p, completedChapters, currentChapter: chapterId }
            : p
        );
      }
      return prev;
    });
  };

  const downloadBook = (bookId: string): boolean => {
    const book = bookDownloads.find(b => b.bookId === bookId);
    if (book && book.downloadsRemaining > 0) {
      setBookDownloads(prev =>
        prev.map(b =>
          b.bookId === bookId
            ? { ...b, downloadsRemaining: b.downloadsRemaining - 1 }
            : b
        )
      );
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        register, 
        purchasedProducts,
        addPurchasedProduct,
        courseProgress,
        updateCourseProgress,
        bookDownloads,
        downloadBook
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
