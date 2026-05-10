import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { product_ids, ...body } = await request.json();
  const { data, error } = await supabaseAdmin.from('deals').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  if (product_ids) {
    await supabaseAdmin.from('deal_products').delete().eq('deal_id', id);
    if (product_ids.length) {
      await supabaseAdmin.from('deal_products').insert(product_ids.map((pid: string) => ({ deal_id: id, product_id: pid })));
    }
  }
  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { error } = await supabaseAdmin.from('deals').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
