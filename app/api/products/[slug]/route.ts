import { NextRequest, NextResponse } from 'next/server';
import { calcFinalPrice } from '@/lib/utils';
import { getSupabaseAdmin } from '@/lib/supabase';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*)
    `,
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  const product = {
    ...data,
    final_price: calcFinalPrice(data.price, data.discount_percent),
  };

  return NextResponse.json({ success: true, data: product });
}
