export function calcFinalPrice(price: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return price;
  return +(price - (price * discountPercent) / 100).toFixed(2);
}

export function formatWhatsAppNumber(num: string) {
  const cleaned = num.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return '+92' + cleaned.slice(1);
  }
  return '+' + cleaned;
}

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Convert a name string to a URL-safe slug */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStorageUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export const PLACEHOLDER_IMAGE = '/images/placeholder.png';

export function getProductImageUrl(imageUrl: string | null): string {
  return imageUrl ?? PLACEHOLDER_IMAGE;
}

export function isValidPhone(phone: string): boolean {
  // Pakistani phone: 03XXXXXXXXX or +923XXXXXXXXX
  return /^(\+92|0)3[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

export function isValidPostalCode(code: string): boolean {
  return /^\d{5}$/.test(code.trim());
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pending',
  confirmed: '✅ Confirmed',
  ready_to_ship: '🚚 Ready to ship',
  shipped: '🚚 Shipped',
  delivered: '📦 Delivered',
  cancelled: '❌ Cancelled',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
};

export function getPaginationRange(page: number, limit: number): { from: number; to: number } {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}
