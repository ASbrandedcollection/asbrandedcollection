import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

const VALID_STATUSES = ['pending', 'confirmed', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin.from('orders').select('*, items:order_items(*)').eq('id', id).single();

  if (error || !data) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  const { data: currentOrder, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (currentOrder.status === 'cancelled') {
    return NextResponse.json({ error: 'Cannot update status of a cancelled order' }, { status: 400 });
  }

  if (currentOrder.status === 'delivered') {
    return NextResponse.json({ error: 'Cannot update status of a delivered order' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from('orders').update({ status: body.status }).eq('id', id).select().single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

  return NextResponse.json({ success: true, data });
}
