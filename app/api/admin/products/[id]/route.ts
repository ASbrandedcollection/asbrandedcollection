import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const updates: Record<string, any> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() ?? null;
  if (body.category_id !== undefined) updates.category_id = body.category_id;
  if (body.price !== undefined) updates.price = parseFloat(body.price);
  if (body.discount_percent !== undefined) updates.discount_percent = parseFloat(body.discount_percent);
  if (body.stock_qty !== undefined) updates.stock_qty = parseInt(body.stock_qty);
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.subcategory_id !== undefined) updates.subcategory_id = body.subcategory_id || null;

  const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', id).select().single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  // product_images CASCADE deletes automatically
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
