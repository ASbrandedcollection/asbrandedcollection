import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get('image') as File | null;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'Image must be under 5MB' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const ext = file.name.split('.').pop();
  const path = `subcategories/${id}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('product-images')
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);

  // Save image_url to subcategory
  await supabaseAdmin.from('subcategories').update({ image_url: data.publicUrl }).eq('id', id);

  return NextResponse.json({ success: true, data: { image_url: data.publicUrl } });
}
