// GET  /api/admin/banners — All banners
// POST /api/admin/banners — Upload new banner (multipart form)
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin.from('banners').select('*').order('display_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const formData = await request.formData();
  const file = formData.get('image') as File | null;
  const title = formData.get('title') as string | null;
  const linkUrl = formData.get('link_url') as string | null;
  const isActive = formData.get('is_active') === 'true';

  if (!file) {
    return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'Banner image must be under 10MB' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const storagePath = `banner-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('banner-images')
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage.from('banner-images').getPublicUrl(storagePath);

  // Get next display_order
  const { data: last } = await supabaseAdmin
    .from('banners')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabaseAdmin
    .from('banners')
    .insert({
      title: title?.trim() ?? null,
      image_url: urlData.publicUrl,
      link_url: linkUrl?.trim() ?? null,
      is_active: isActive,
      display_order: (last?.display_order ?? 0) + 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
