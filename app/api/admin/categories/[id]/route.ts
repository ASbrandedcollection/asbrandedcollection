// PUT    /api/admin/categories/:id — Update category
// DELETE /api/admin/categories/:id — Delete category
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { toSlug } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const updates: Record<string, any> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.slug !== undefined) updates.slug = toSlug(body.slug);
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.display_order !== undefined) updates.display_order = body.display_order;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  const { data, error } = await supabaseAdmin.from('categories').update(updates).eq('id', id).select().single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  // Check if any products use this category
  const { count } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('category_id', id);

  if (count && count > 0) {
    return NextResponse.json(
      { success: false, error: `Cannot delete: ${count} product(s) use this category. Reassign them first.` },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
