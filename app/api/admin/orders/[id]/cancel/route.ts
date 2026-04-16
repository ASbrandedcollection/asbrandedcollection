import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    const supabase = await createSupabaseServerClient();

    const { data: order, error: fetchError } = await supabase.from('orders').select('status').eq('id', id).single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return NextResponse.json({ error: 'Cannot cancel a shipped or delivered order' }, { status: 400 });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        notes: reason || 'Order cancelled by admin',
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
    }

    await supabase.from('order_status_history').insert([
      {
        order_id: id,
        status: 'cancelled',
        changed_by: 'admin',
        notes: reason || 'Order cancelled',
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
