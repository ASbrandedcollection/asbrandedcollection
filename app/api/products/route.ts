import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() ?? '';
    const category = searchParams.get('category') ?? '';
    const subcategory = searchParams.get('subcategory') ?? '';
    const sort = searchParams.get('sort') ?? 'newest';
    const minPrice = searchParams.get('min_price') ?? '';
    const maxPrice = searchParams.get('max_price') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '80')));
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(
        `
        id, name, slug, price, discount_percent, is_active, created_at,
        category:categories!products_category_id_fkey(id, name, slug),
        subcategory:subcategories!products_subcategory_id_fkey(id, name, slug),
        images:product_images(image_url, is_primary)
        `,
        { count: 'exact' },
      )
      .eq('is_active', true);

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      const { data: catData } = await supabase.from('categories').select('id').eq('slug', category).single();

      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (subcategory) {
      const { data: subData } = await supabase.from('subcategories').select('id').eq('slug', subcategory).single();

      if (subData) {
        query = query.eq('subcategory_id', subData.id);
      }
    }

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
        query = query.order('created_at', { ascending: false }); // newest
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Products fetch error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        data: data ?? [],
        total: count ?? 0,
        page,
        limit,
        total_pages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
