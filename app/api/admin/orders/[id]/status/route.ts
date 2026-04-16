import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();

    const { status, estimated_delivery_date, shipping_carrier, tracking_number, notes } = body;

    const validStatuses = ['pending', 'confirmed', 'ready_to_ship', 'shipped', 'delivered'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        estimated_delivery_date: estimated_delivery_date || null,
        shipping_carrier: shipping_carrier || null,
        tracking_number: tracking_number || null,
        notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    const { error: historyError } = await supabase.from('order_status_history').insert([
      {
        order_id: id,
        status,
        changed_by: 'admin', // In production, use actual admin email from auth
        notes: notes || null,
      },
    ]);

    if (historyError) {
      console.error('Error creating status history:', historyError);
      // Don't fail - the order was already updated
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
