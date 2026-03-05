import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [bookDownloads, setBookDownloads] = useState<BookDownload[]>([]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simple validation for demo
    if (email && password.length >= 6) {
      setUser({
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setPurchasedProducts([]);
    setCourseProgress([]);
    setBookDownloads([]);
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email && password.length >= 6 && name) {
      setUser({
        id: '1',
        email,
        name,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      });
      return true;
    }
    return false;
  };

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
