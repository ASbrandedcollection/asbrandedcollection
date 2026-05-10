import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const categorySlug = request.nextUrl.searchParams.get('category');

  let query = supabase
    .from('subcategories')
    .select('id, name, slug, image_url, category_id')
    .eq('is_active', true)
    .order('display_order');

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();

    if (!cat) return NextResponse.json({ success: true, data: [] });
    query = query.eq('category_id', cat.id);
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  if (limitParam) query = query.limit(Number(limitParam));

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
