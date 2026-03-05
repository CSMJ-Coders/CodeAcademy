export type ProductType = 'course' | 'book';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Language = 'spanish' | 'english';
export type OrderStatus = 'pending' | 'completed' | 'failed';

export interface Product {
  id: string;
  title: string;
  type: ProductType;
  category: string;
  author: string;
  description: string;
  price: number;
  originalPrice?: number;
  level: Level;
  language: Language;
  image: string;
  rating: number;
  duration?: string; // for courses
  chapters?: Chapter[]; // for courses
  pages?: number; // for books
  tableOfContents?: string[]; // for books
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  duration: string;
  isCompleted?: boolean;
  videoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
}

export interface CourseProgress {
  courseId: string;
  progress: number;
  currentChapter?: string;
  completedChapters: string[];
}

export interface BookDownload {
  bookId: string;
  downloadsRemaining: number;
  maxDownloads: number;
}
