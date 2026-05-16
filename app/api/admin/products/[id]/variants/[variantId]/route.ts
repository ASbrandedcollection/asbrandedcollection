import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  const { id, variantId } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const updates: Record<string, any> = {};
  if (body.type_name !== undefined) updates.type_name = body.type_name.trim();
  if (body.label !== undefined) updates.label = body.label.trim();
  if (body.image_id !== undefined) updates.image_id = body.image_id ?? null;

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update(updates)
    .eq('id', variantId)
    .eq('product_id', id)
    .select('*, image:product_images(id, image_url, is_primary)')
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  const { id, variantId } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { error } = await supabaseAdmin.from('product_variants').delete().eq('id', variantId).eq('product_id', id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
