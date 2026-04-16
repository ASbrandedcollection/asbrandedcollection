import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, any> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.display_order !== undefined) updates.display_order = body.display_order;
  if (body.group_name !== undefined) updates.group_name = body.group_name;
  if (body.image_url !== undefined) updates.image_url = body.image_url;

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from('subcategories').update(updates).eq('id', id).select().single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  // Check if any products use this subcategory
  const { count } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('subcategory_id', id);

  if (count && count > 0) {
    return NextResponse.json(
      { success: false, error: `Cannot delete: ${count} product(s) use this subcategory.` },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from('subcategories').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
