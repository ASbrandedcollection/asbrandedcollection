import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/admin/brands
// Returns all subcategories that belong to the "Brands" category (slug = 'brands')
export async function GET() {
  const supabase = getSupabaseAdmin();

  // Find the Brands category by its slug
  const { data: brandsCat, error: catError } = await supabase.from('categories').select('id').eq('slug', 'brands').single();

  if (catError || !brandsCat) {
    return NextResponse.json({ success: false, error: 'Brands category not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('subcategories')
    .select('id, name, slug')
    .eq('category_id', brandsCat.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data ?? [] });
}
