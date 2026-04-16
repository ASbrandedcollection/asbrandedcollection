import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { order_number, phone_number } = body;

    const cleanOrderNumber = parseInt(order_number.toString().replace(/ORD-/i, ''), 10);

    if (!cleanOrderNumber || !phone_number) {
      return NextResponse.json({ error: 'Order Number and phone number are required' }, { status: 400 });
    }

    const normalizedPhone = phone_number.replace(/\D/g, '');
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(
        `
    id,
    first_name,
    last_name,
    phone,
    address,
    city,
    postal_code,
    total_amount,
    status,
    estimated_delivery_date,
    shipping_carrier,
    tracking_number,
    notes,
    payment_method,
    created_at,
    order_items (
      id,
      product_id,
      product_name,
      unit_price,
      quantity
    )
  `,
      )
      .eq('order_number', cleanOrderNumber)
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify phone matches
    const orderPhone = order.phone.replace(/\D/g, '');
    if (orderPhone !== normalizedPhone) {
      return NextResponse.json({ error: 'Phone number does not match this order' }, { status: 403 });
    }

    // Fetch status history
    const { data: statusHistory, error: historyError } = await supabaseAdmin
      .from('order_status_history')
      .select('*')
      .eq('order_id', order.id)
      .order('changed_at', { ascending: true });

    if (historyError) {
      console.error('Error fetching status history:', historyError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        customer_name: `${order.first_name} ${order.last_name}`,
        customer_phone: order.phone,
        customer_address: `${order.address}, ${order.city} ${order.postal_code}`,
        status_history: statusHistory || [],
      },
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
