import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Resolve slug → product id
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (productError || !product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .select('id, type_name, label, image_id, display_order, image:product_images(id, image_url)')
    .eq('product_id', product.id)
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data ?? [] });
}
