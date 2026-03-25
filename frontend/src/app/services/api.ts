/**
 * services/api.ts
 * ===============
 * Servicio centralizado para todas las llamadas a la API del backend.
 *
 * ¿Por qué centralizarlo aquí?
 *   → Si la URL base cambia (dev → producción), solo la cambias en UN lugar.
 *   → Los componentes no saben nada de HTTP; solo llaman funciones.
 *   → Mapeamos snake_case del backend (is_featured) → camelCase del frontend (isFeatured)
 *
 * Flujo:
 *   Componente → llama función de este archivo → fetch al backend → mapea respuesta → retorna tipo de frontend
 */

import type { Product, Category, Order } from '../types';

const ACCESS_TOKEN_KEY = 'code_academy_access_token';
const REFRESH_TOKEN_KEY = 'code_academy_refresh_token';

// ─── Tipos internos del backend (como llegan del JSON) ──────────────────────
// Estos tipos reflejan exactamente lo que devuelve Django.
// Son privados a este archivo; el resto de la app solo ve los tipos de frontend.

interface ApiCategory {
  id: number;
  name: string;
  icon: string;
}

interface ApiChapter {
  id: number;
  order: number;
  title: string;
  duration: string;
  video_url: string;
}

interface ApiTocEntry {
  order: number;
  entry: string;
}

interface ApiProduct {
  id: number;
  title: string;
  type: 'course' | 'book';
  category: ApiCategory;
  author: string;
  description: string;
  price: string;               // Django devuelve DecimalField como string
  original_price: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'spanish' | 'english';
  image: string;
  rating: string;
  duration: string;
  pages: number | null;
  is_new: boolean;
  is_featured: boolean;
  // Solo presentes en el endpoint de detalle:
  chapters?: ApiChapter[];
  table_of_contents?: ApiTocEntry[];
}

interface ApiOrderItem {
  id: number;
  product_id: number;
  product: ApiProduct;
  product_title: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

interface ApiOrder {
  id: number;
  user_id: number;
  status: 'pending' | 'completed' | 'failed';
  payment_provider: string;
  payment_reference: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
  items: ApiOrderItem[];
}

interface CreateStripeIntentResponse {
  client_secret: string;
  publishable_key: string;
  order: ApiOrder;
}

interface ApiBookDownloadPolicy {
  book_id: number;
  download_count: number;
  max_downloads: number;
  downloads_remaining: number;
  last_downloaded_at: string | null;
}

interface ApiCourseProgress {
  course_id: number;
  progress_percentage: number;
  completed_chapters: string[];
  current_chapter: string | null;
  updated_at: string;
  certificate_issued?: boolean;
}

// Respuesta paginada de DRF (lo que devuelve /api/products/)
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Mappers: backend → frontend ────────────────────────────────────────────

/**
 * Convierte una categoría del backend al tipo Category del frontend.
 */
function mapCategory(api: ApiCategory): Category {
  return {
    id: String(api.id),
    name: api.name,
    icon: api.icon,
  };
}

/**
 * Convierte un producto del backend al tipo Product del frontend.
 * Traduce:
 *   - snake_case → camelCase
 *   - strings de números → numbers
 *   - category objeto → string (solo nombre)
 *   - table_of_contents [{entry}] → string[]
 *   - video_url → videoUrl
 */
function mapProduct(api: ApiProduct): Product {
  return {
    id: String(api.id),
    title: api.title,
    type: api.type,
    category: api.category.name,           // el frontend espera solo el nombre
    author: api.author,
    description: api.description,
    price: parseFloat(api.price),
    originalPrice: api.original_price ? parseFloat(api.original_price) : undefined,
    level: api.level,
    language: api.language,
    image: api.image,
    rating: parseFloat(api.rating),
    duration: api.duration || undefined,
    pages: api.pages ?? undefined,
    isNew: api.is_new,
    isFeatured: api.is_featured,
    // Capítulos del curso
    chapters: api.chapters?.map(ch => ({
      id: String(ch.id),
      title: ch.title,
      duration: ch.duration,
      videoUrl: ch.video_url,
    })),
    // Índice del libro (array de strings)
    tableOfContents: api.table_of_contents?.map(t => t.entry),
  };
}

function mapOrder(api: ApiOrder): Order {
  // El backend guarda precios como string decimal; aquí normalizamos a number.
  return {
    id: String(api.id),
    userId: String(api.user_id),
    status: api.status,
    total: parseFloat(api.total_amount),
    date: api.created_at,
    items: api.items.map((item) => ({
      product: mapProduct(item.product),
      quantity: item.quantity,
    })),
  };
}

function getAuthHeaders(): HeadersInit {
  // Todas las rutas de órdenes son protegidas con JWT.
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!access) {
    throw new Error('No hay sesión activa. Inicia sesión para continuar.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${access}`,
  };
}

function getAuthHeaderOnly(): HeadersInit {
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!access) {
    throw new Error('No hay sesión activa. Inicia sesión para continuar.');
  }
  return {
    Authorization: `Bearer ${access}`,
  };
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) return null;

  try {
    const response = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (!data?.access) return null;

    localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
    if (data.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
    }
    return data.access;
  } catch {
    return null;
  }
}

async function fetchWithAuthRetry(
  url: string,
  init: RequestInit,
  requireJsonHeaders = false,
): Promise<Response> {
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!access) {
    throw new Error('No hay sesión activa. Inicia sesión para continuar.');
  }

  const firstHeaders: HeadersInit = {
    ...(requireJsonHeaders ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers || {}),
    Authorization: `Bearer ${access}`,
  };

  let response = await fetch(url, { ...init, headers: firstHeaders });
  if (response.status !== 401) {
    return response;
  }

  const newAccess = await refreshAccessToken();
  if (!newAccess) {
    return response;
  }

  const retryHeaders: HeadersInit = {
    ...(requireJsonHeaders ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers || {}),
    Authorization: `Bearer ${newAccess}`,
  };

  response = await fetch(url, { ...init, headers: retryHeaders });
  return response;
}

// ─── Parámetros de filtro para /api/products/ ────────────────────────────────

export interface ProductFilters {
  type?: 'course' | 'book';
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: 'spanish' | 'english';
  category__name?: string;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
}

// ─── Funciones públicas del servicio ────────────────────────────────────────

/**
 * GET /api/categories/
 * Retorna todas las categorías (sin paginación).
 */
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories/');
  if (!res.ok) throw new Error('Error al cargar categorías');
  const data: ApiCategory[] = await res.json();
  return data.map(mapCategory);
}

/**
 * GET /api/products/?type=course&search=python&...
 * Retorna todos los productos que cumplan los filtros (sin paginación — pide todo).
 * Para el catálogo usamos filtros del servidor en vez de filtrar en el cliente.
 */
export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  // Construimos los query params dinámicamente
  const params = new URLSearchParams();

  if (filters.type)          params.set('type', filters.type);
  if (filters.level)         params.set('level', filters.level);
  if (filters.language)      params.set('language', filters.language);
  if (filters.category__name) params.set('category__name', filters.category__name);
  if (filters.is_featured)   params.set('is_featured', 'true');
  if (filters.search)        params.set('search', filters.search);
  if (filters.ordering)      params.set('ordering', filters.ordering);

  // page_size=100 para traer todos sin necesidad de paginación en el frontend
  params.set('page_size', '100');

  const res = await fetch(`/api/products/?${params.toString()}`);
  if (!res.ok) throw new Error('Error al cargar productos');

  const data: PaginatedResponse<ApiProduct> = await res.json();
  return data.results.map(mapProduct);
}

/**
 * GET /api/products/<id>/
 * Retorna el detalle completo de un producto (con capítulos o tabla de contenidos).
 * Retorna null si el producto no existe (404).
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  const res = await fetch(`/api/products/${id}/`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error al cargar el producto');
  const data: ApiProduct = await res.json();
  return mapProduct(data);
}

export async function fetchProductPreviewById(id: string): Promise<Product | null> {
  const res = await fetch(`/api/products/${id}/preview/`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error al cargar el contenido de muestra');

  const data = await res.json();
  return {
    id: String(data.id),
    title: data.title,
    type: data.type,
    category: '',
    author: data.author,
    description: data.description,
    price: 0,
    level: 'beginner',
    language: 'spanish',
    image: '',
    rating: 0,
    chapters: (data.preview_chapters ?? []).map((ch: ApiChapter) => ({
      id: String(ch.id),
      title: ch.title,
      duration: ch.duration,
      videoUrl: ch.video_url,
    })),
    tableOfContents: (data.preview_table_of_contents ?? []).map((item: ApiTocEntry) => item.entry),
  };
}

export async function fetchBookDownloadStatus(bookId: string): Promise<{ downloadsRemaining: number; maxDownloads: number }> {
  const res = await fetchWithAuthRetry(`/api/books/${bookId}/downloads/status/`, { method: 'GET' });

  if (!res.ok) {
    throw new Error('No se pudo consultar el estado de descargas del libro.');
  }

  const data: ApiBookDownloadPolicy = await res.json();
  return {
    downloadsRemaining: data.downloads_remaining,
    maxDownloads: data.max_downloads,
  };
}

export async function downloadBookPdf(bookId: string): Promise<void> {
  const res = await fetchWithAuthRetry(`/api/books/${bookId}/download/`, { method: 'GET' });

  if (!res.ok) {
    let message = 'No se pudo descargar el libro.';
    try {
      const data = await res.json();
      if (typeof data?.detail === 'string') message = data.detail;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  const fileNameMatch = disposition.match(/filename="?([^";]+)"?/i);
  const fileName = fileNameMatch?.[1] ?? `book-${bookId}.pdf`;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

export async function fetchCourseProgress(courseId: string): Promise<{ progress: number; completedChapters: string[]; currentChapter?: string }> {
  const res = await fetchWithAuthRetry(`/api/courses/${courseId}/progress/`, { method: 'GET' });

  if (!res.ok) {
    throw new Error('No se pudo cargar el progreso del curso.');
  }

  const data: ApiCourseProgress = await res.json();
  return {
    progress: data.progress_percentage,
    completedChapters: data.completed_chapters ?? [],
    currentChapter: data.current_chapter ?? undefined,
  };
}

export async function completeCourseChapter(courseId: string, chapterId: string): Promise<{ progress: number; completedChapters: string[]; certificateIssued: boolean }> {
  const res = await fetchWithAuthRetry(`/api/courses/${courseId}/progress/complete/`, {
    method: 'POST',
    body: JSON.stringify({ chapter_id: Number(chapterId) }),
  }, true);

  if (!res.ok) {
    throw new Error('No se pudo actualizar el progreso del curso.');
  }

  const data: ApiCourseProgress = await res.json();
  return {
    progress: data.progress_percentage,
    completedChapters: data.completed_chapters ?? [],
    certificateIssued: Boolean(data.certificate_issued),
  };
}

export async function downloadCourseCertificate(courseId: string): Promise<void> {
  const res = await fetchWithAuthRetry(`/api/courses/${courseId}/certificate/`, { method: 'GET' });

  if (!res.ok) {
    let message = 'No se pudo descargar el certificado.';
    try {
      const data = await res.json();
      if (typeof data?.detail === 'string') message = data.detail;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  const fileNameMatch = disposition.match(/filename="?([^";]+)"?/i);
  const fileName = fileNameMatch?.[1] ?? `certificate-course-${courseId}.pdf`;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

export async function createOrder(orderItems: Array<{ product_id: number; quantity: number }>): Promise<Order> {
  // Flujo sandbox (sin pasarela real). Se mantiene para pruebas internas.
  const res = await fetchWithAuthRetry('/api/orders/', {
    method: 'POST',
    body: JSON.stringify({ items: orderItems }),
  }, true);

  if (!res.ok) {
    throw new Error('No se pudo crear la orden. Verifica tu carrito e intenta nuevamente.');
  }

  const data: ApiOrder = await res.json();
  return mapOrder(data);
}

export async function createStripePaymentIntent(
  orderItems: Array<{ product_id: number; quantity: number }>
): Promise<{ clientSecret: string; publishableKey: string; order: Order }> {
  // Flujo real: crea una orden pending y un PaymentIntent en Stripe.
  const res = await fetchWithAuthRetry('/api/orders/create-intent/', {
    method: 'POST',
    body: JSON.stringify({ items: orderItems }),
  }, true);

  if (!res.ok) {
    let message = 'No se pudo iniciar el pago con Stripe.';
    try {
      const data = await res.json();
      if (typeof data?.detail === 'string') {
        message = data.detail;
      }
      if (typeof data?.non_field_errors?.[0] === 'string') {
        message = data.non_field_errors[0];
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data: CreateStripeIntentResponse = await res.json();
  return {
    clientSecret: data.client_secret,
    publishableKey: data.publishable_key,
    order: mapOrder(data.order),
  };
}

export async function confirmStripeOrderPayment(orderId: string): Promise<Order> {
  // Confirmación síncrona contra Stripe para reflejar estado al usuario.
  const res = await fetchWithAuthRetry(`/api/orders/${orderId}/confirm/`, {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('No se pudo confirmar el estado del pago.');
  }

  const data: ApiOrder = await res.json();
  return mapOrder(data);
}

export async function fetchMyOrders(): Promise<Order[]> {
  // Historial paginado de órdenes del usuario autenticado.
  const res = await fetchWithAuthRetry('/api/orders/', { method: 'GET' });

  if (!res.ok) {
    throw new Error('No se pudieron cargar tus órdenes.');
  }

  const data: PaginatedResponse<ApiOrder> = await res.json();
  return data.results.map(mapOrder);
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  // Detalle de una orden específica (en pantalla de confirmación, por ejemplo).
  const res = await fetchWithAuthRetry(`/api/orders/${orderId}/`, { method: 'GET' });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('No se pudo cargar el detalle de la orden.');
  }

  const data: ApiOrder = await res.json();
  return mapOrder(data);
}
