import { getSupabaseAdmin } from '@/lib/supabase';
import { calcFinalPrice, isValidPhone } from '@/lib/utils';
import type { CheckoutPayload } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function POST(request: NextRequest) {
  let body: CheckoutPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const required = ['first_name', 'last_name', 'phone', 'address', 'city', 'postal_code'];
  for (const field of required) {
    if (!body[field as keyof CheckoutPayload]) {
      return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 });
    }
  }

  if (!isValidPhone(body.phone)) {
    return NextResponse.json({ success: false, error: 'Invalid phone number. Use format: 03XXXXXXXXX' }, { status: 400 });
  }

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
  }

  const productIds = body.items.map(i => i.product_id);

  const { data: products, error: prodError } = await supabaseAdmin
    .from('products')
    .select('id, name, price, discount_percent, stock_qty, is_active')
    .in('id', productIds);

  if (prodError) {
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }

  const productMap = new Map(products.map((p: any) => [p.id, p]));

  for (const item of body.items) {
    const product = productMap.get(item.product_id);
    if (!product) {
      return NextResponse.json({ success: false, error: `Product ${item.product_id} not found` }, { status: 400 });
    }
    if (!product.is_active) {
      return NextResponse.json(
        { success: false, error: `Product "${product.name}" is no longer available` },
        { status: 400 },
      );
    }
    if (product.stock_qty < item.quantity) {
      return NextResponse.json(
        { success: false, error: `Not enough stock for "${product.name}". Available: ${product.stock_qty}` },
        { status: 400 },
      );
    }
  }

  const { data: images } = await supabaseAdmin
    .from('product_images')
    .select('product_id, image_url')
    .in('product_id', productIds)
    .eq('is_primary', true);

  const imageMap = new Map((images ?? []).map((img: any) => [img.product_id, img.image_url]));

  let totalAmount = 0;
  const orderItems = body.items.map(item => {
    const product = productMap.get(item.product_id);
    const unitPrice = calcFinalPrice(product.price, product.discount_percent);
    totalAmount += unitPrice * item.quantity;
    return {
      product_id: item.product_id,
      product_name: product.name,
      product_image_url: imageMap.get(item.product_id) ?? null,
      unit_price: unitPrice,
      quantity: item.quantity,
    };
  });

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      city: body.city.trim(),
      postal_code: body.postal_code.trim(),
      notes: body.notes?.trim() ?? null,
      total_amount: +totalAmount.toFixed(2),
      payment_method: body.payment_method ?? 'cod',
      status: 'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }

  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(itemsWithOrderId);

  if (itemsError) {
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ success: false, error: 'Failed to save order items' }, { status: 500 });
  }

  for (const item of body.items) {
    const product = productMap.get(item.product_id);
    await supabaseAdmin
      .from('products')
      .update({ stock_qty: product.stock_qty - item.quantity })
      .eq('id', item.product_id);
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        order_id: order.id,
        order_number: `ORD-${order.order_number}`,
        total_amount: order.total_amount,
        status: order.status,
      },
    },
    { status: 201 },
  );
}
