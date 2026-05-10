import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('deals')
    .select(
      `*, deal_products(product:products(id, name, price, discount_percent, images:product_images(image_url, is_primary)))`,
    )
    .order('sort_order');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { product_ids, ...dealBody } = await request.json();
  const { data: deal, error } = await supabaseAdmin.from('deals').insert(dealBody).select().single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  if (product_ids?.length) {
    await supabaseAdmin
      .from('deal_products')
      .insert(product_ids.map((pid: string) => ({ deal_id: deal.id, product_id: pid })));
  }
  return NextResponse.json({ success: true, data: deal });
}
