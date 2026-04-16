// GET /api/categories — Returns active categories ordered for nav menu
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const { data: subcategories } = await supabaseAdmin
    .from('subcategories')
    .select('id, name, slug, category_id, display_order, is_active, group_name, image_url')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Nest subcategories under their parent category
  const result = categories.map((cat: any) => ({
    ...cat,
    subcategories: (subcategories ?? []).filter((sub: any) => sub.category_id === cat.id),
  }));

  return NextResponse.json({ success: true, data: result });
}
