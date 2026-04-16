// PUT    /api/admin/banners/:id — Toggle active, update title/link/order
// DELETE /api/admin/banners/:id — Delete banner and remove from storage
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, any> = {};

  if (body.title !== undefined) updates.title = body.title?.trim() ?? null;
  if (body.link_url !== undefined) updates.link_url = body.link_url?.trim() ?? null;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.display_order !== undefined) updates.display_order = body.display_order;

  const { data, error } = await supabaseAdmin.from('banners').update(updates).eq('id', id).select().single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;

  const { data: banner } = await supabaseAdmin.from('banners').select('image_url').eq('id', id).single();

  if (!banner) {
    return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
  }

  // Remove from storage
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const storagePath = banner.image_url.replace(`${storageUrl}/storage/v1/object/public/banner-images/`, '');
  await supabaseAdmin.storage.from('banner-images').remove([storagePath]);

  const { error } = await supabaseAdmin.from('banners').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
