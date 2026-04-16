import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    let query = supabase
      .from('reviews')
      .select(
        `
        id,
        product_id,
        customer_name,
        rating,
        description,
        created_at,
        products(id, name, slug)
      `,
      )
      .order(sortBy, { ascending: order === 'asc' });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: reviews, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error in admin reviews GET:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
