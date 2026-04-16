// GET  /api/admin/products — All products (including inactive) with pagination
// POST /api/admin/products — Create new product
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getPaginationRange, toSlug } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
  const { from, to } = getPaginationRange(page, limit);

  const { data, error, count } = await supabaseAdmin
    .from('products')
    .select('*, category:categories(*), images:product_images(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    data: { data, total: count ?? 0, page, limit, total_pages: Math.ceil((count ?? 0) / limit) },
  });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();

  // Validate required
  if (!body.name || !body.category_id || body.price === undefined) {
    return NextResponse.json({ success: false, error: 'name, category_id and price are required' }, { status: 400 });
  }

  const slug = toSlug(body.name) + '-' + Date.now().toString(36); // ensure uniqueness

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: body.name.trim(),
      slug,
      description: body.description?.trim() ?? null,
      category_id: body.category_id,
      price: parseFloat(body.price),
      discount_percent: parseFloat(body.discount_percent ?? 0),
      stock_qty: parseInt(body.stock_qty ?? 0),
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
