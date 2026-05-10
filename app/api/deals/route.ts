import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('deals')
    .select(
      `*,
      deal_products (
        product:products (
          id, name, slug, price, discount_percent,
          images:product_images (image_url, is_primary)
        )
      )
    `,
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
