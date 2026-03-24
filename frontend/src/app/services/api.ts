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
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!access) {
    throw new Error('No hay sesión activa. Inicia sesión para continuar.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${access}`,
  };
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

export async function createOrder(orderItems: Array<{ product_id: number; quantity: number }>): Promise<Order> {
  const res = await fetch('/api/orders/', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ items: orderItems }),
  });

  if (!res.ok) {
    throw new Error('No se pudo crear la orden. Verifica tu carrito e intenta nuevamente.');
  }

  const data: ApiOrder = await res.json();
  return mapOrder(data);
}

export async function createStripePaymentIntent(
  orderItems: Array<{ product_id: number; quantity: number }>
): Promise<{ clientSecret: string; publishableKey: string; order: Order }> {
  const res = await fetch('/api/orders/create-intent/', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ items: orderItems }),
  });

  if (!res.ok) {
    throw new Error('No se pudo iniciar el pago con Stripe.');
  }

  const data: CreateStripeIntentResponse = await res.json();
  return {
    clientSecret: data.client_secret,
    publishableKey: data.publishable_key,
    order: mapOrder(data.order),
  };
}

export async function confirmStripeOrderPayment(orderId: string): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}/confirm/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudo confirmar el estado del pago.');
  }

  const data: ApiOrder = await res.json();
  return mapOrder(data);
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders/', {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('No se pudieron cargar tus órdenes.');
  }

  const data: PaginatedResponse<ApiOrder> = await res.json();
  return data.results.map(mapOrder);
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const res = await fetch(`/api/orders/${orderId}/`, {
    headers: getAuthHeaders(),
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('No se pudo cargar el detalle de la orden.');
  }

  const data: ApiOrder = await res.json();
  return mapOrder(data);
}
