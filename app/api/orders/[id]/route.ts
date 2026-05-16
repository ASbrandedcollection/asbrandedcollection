import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      id, order_number, first_name, last_name, phone,
      address, city, postal_code, notes,
      total_amount, payment_method, status, created_at,
      order_items (
        product_name, product_image_url, unit_price, quantity
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error || !order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: order });
}
