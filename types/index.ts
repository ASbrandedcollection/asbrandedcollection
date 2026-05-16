export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  group_name: string | null;
  image_url: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  category_id: string;
  subcategory_id: string | null;
  price: number;
  discount_percent: number;
  stock_qty: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  subcategory?: Subcategory;
  images?: ProductImage[];
  final_price?: number;
  review_count: number;
  rating_avg: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  type_name: string;
  label: string;
  image_id: string | null;
  display_order: number;
  created_at: string;
  image?: {
    id: string;
    image_url: string;
  } | null;
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export interface DealProduct {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount_percent: number;
    images: { image_url: string; is_primary: boolean }[];
  };
}

export interface Deal {
  id: string;
  title: string;
  deal_price: number;
  is_active: boolean;
  sort_order: number;
  deal_products: DealProduct[];
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewFormData {
  customer_name: string;
  rating: number;
  description?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: number]: number;
  };
}

export interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cod';

export interface Order {
  id: string;
  order_number: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
  created_at: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_at: string;
  changed_by?: string;
  notes?: string;
  created_at: string;
}

export interface OrderTrackingView extends Order {
  status_history?: OrderStatusHistoryEntry[];
  estimated_delivery_date?: string;
  shipping_carrier?: string;
  tracking_number?: string;
  notes: string | null;
}

// Status metadata for UI
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    description: 'Your order has been received',
    color: '#FFA726', // orange
    icon: '📋',
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Order confirmed by seller',
    color: '#42A5F5', // blue
    icon: '✓',
  },
  ready_to_ship: {
    label: 'Ready to Ship',
    description: 'Order is being prepared for shipment',
    color: '#AB47BC', // purple
    icon: '📦',
  },
  shipped: {
    label: 'Shipped',
    description: 'Your order is on its way',
    color: '#29B6F6', // light blue
    icon: '🚚',
  },
  delivered: {
    label: 'Delivered',
    description: 'Order delivered successfully',
    color: '#66BB6A', // green
    icon: '✓',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order has been cancelled',
    color: '#EF5350', // red
    icon: '✗',
  },
};

export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  unit_price: number;
  original_price: number;
  discount_percent: number;
  quantity: number;
}

export interface CheckoutPayload {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes?: string;
  payment_method: PaymentMethod;
  items: { product_id: string; quantity: number }[];
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  category_id: string;
  subcategory_id?: string | null;
  price: number;
  discount_percent?: number;
  stock_qty?: number;
  is_active?: boolean;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  icon?: string;
  display_order?: number;
}

export interface CreateSubcategoryPayload {
  name: string;
  slug: string;
  category_id: string;
  display_order?: number;
}

export interface CreateBannerPayload {
  title?: string;
  link_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
