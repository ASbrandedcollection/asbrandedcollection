import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .select('*, image:product_images(id, image_url, is_primary)')
    .eq('product_id', id)
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();

  if (!body.type_name?.trim() || !body.label?.trim()) {
    return NextResponse.json({ success: false, error: 'type_name and label are required' }, { status: 400 });
  }

  // display_order: append at end
  const { data: last } = await supabaseAdmin
    .from('product_variants')
    .select('display_order')
    .eq('product_id', id)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const display_order = (last?.display_order ?? -1) + 1;

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .insert({
      product_id: id,
      type_name: body.type_name.trim(),
      label: body.label.trim(),
      image_id: body.image_id ?? null,
      display_order,
    })
    .select('*, image:product_images(id, image_url, is_primary)')
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
