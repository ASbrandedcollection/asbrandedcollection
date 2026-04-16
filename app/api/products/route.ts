// GET /api/products
//
// Query params:
//   category    → slug string
//   search      → text search on name/description
//   min_price   → number
//   max_price   → number
//   sort        → 'price_asc' | 'price_desc' | 'newest' | 'name_asc'
//   page        → number (default 1)
//   limit       → number (default 20, max 50)

import { getSupabaseAdmin } from '@/lib/supabase';
import { calcFinalPrice, getPaginationRange } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const categorySlug = searchParams.get('category');
  const subcategorySlug = searchParams.get('subcategory');
  const search = searchParams.get('search');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const { from, to } = getPaginationRange(page, limit);

  const supabaseAdmin = getSupabaseAdmin();

  let query = supabaseAdmin
    .from('products')
    .select(
      `*, 
      category:categories(*),
      subcategory:subcategories(*),
      images:product_images(*)`,
      { count: 'exact' },
    )
    .eq('is_active', true);

  // Filter by category slug
  if (categorySlug) {
    const { data: cat } = await supabaseAdmin.from('categories').select('id').eq('slug', categorySlug).single();

    if (!cat) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    query = query.eq('category_id', cat.id);
  }

  // Filter by subcategory slug
  if (subcategorySlug) {
    const { data: sub } = await supabaseAdmin.from('subcategories').select('id').eq('slug', subcategorySlug).single();

    if (!sub) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 });
    }
    query = query.eq('subcategory_id', sub.id);
  }

  if (search?.trim()) query = query.ilike('name', `%${search.trim()}%`);
  if (minPrice) query = query.gte('price', parseFloat(minPrice));
  if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const products = (data ?? []).map((p: any) => ({
    ...p,
    final_price: calcFinalPrice(p.price, p.discount_percent),
  }));

  return NextResponse.json({
    success: true,
    data: {
      data: products,
      total: count ?? 0,
      page,
      limit,
      total_pages: Math.ceil((count ?? 0) / limit),
    },
  });
}
