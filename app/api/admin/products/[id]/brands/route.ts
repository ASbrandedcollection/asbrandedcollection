import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/products/[id]/brands
// Returns all brand subcategories linked to this product
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('product_brands')
    .select('id, brand:subcategories(id, name, slug)')
    .eq('product_id', productId);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const brands = (data ?? []).map((row: any) => ({ linkId: row.id, ...row.brand }));
  return NextResponse.json({ success: true, data: brands });
}

// POST /api/admin/products/[id]/brands
// Body: { brand_id: string }
// Links a brand subcategory to this product
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  const supabase = getSupabaseAdmin();
  const { brand_id } = await req.json();

  if (!brand_id) return NextResponse.json({ success: false, error: 'brand_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('product_brands')
    .insert({ product_id: productId, brand_id })
    .select('id, brand:subcategories(id, name, slug)')
    .single();

  if (error) {
    // Unique violation — already linked
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: 'Already linked to this brand' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { linkId: data.id, ...(data.brand as any) } });
}

// DELETE /api/admin/products/[id]/brands?link_id=xxx
// Unlinks a brand from this product
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  const supabase = getSupabaseAdmin();
  const linkId = new URL(req.url).searchParams.get('link_id');

  if (!linkId) return NextResponse.json({ success: false, error: 'link_id required' }, { status: 400 });

  const { error } = await supabase.from('product_brands').delete().eq('id', linkId).eq('product_id', productId);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
