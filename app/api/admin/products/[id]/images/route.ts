// POST   /api/admin/products/:id/images — Upload image to Supabase Storage + save record
// DELETE /api/admin/products/:id/images?image_id=xxx — Remove image
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  // Expect multipart form data
  const formData = await request.formData();
  const file = formData.get('image') as File | null;
  const isPrimary = formData.get('is_primary') === 'true';

  if (!file) {
    return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ success: false, error: 'Invalid file type. Use JPEG, PNG, WebP or GIF.' }, { status: 400 });
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'Image must be under 5MB' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const storagePath = `${id}/${Date.now()}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from('product-images')
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(storagePath);

  const imageUrl = urlData.publicUrl;

  // If setting as primary, unset all others first
  if (isPrimary) {
    await supabaseAdmin.from('product_images').update({ is_primary: false }).eq('product_id', id);
  }

  // Get display_order (append at end)
  const { data: existing } = await supabaseAdmin
    .from('product_images')
    .select('display_order')
    .eq('product_id', id)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const display_order = (existing?.display_order ?? 0) + 1;

  // Insert image record
  const { data, error: insertError } = await supabaseAdmin
    .from('product_images')
    .insert({
      product_id: id,
      image_url: imageUrl,
      is_primary: isPrimary,
      display_order,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get('image_id');

  if (!imageId) {
    return NextResponse.json({ success: false, error: 'image_id query param required' }, { status: 400 });
  }

  // Fetch the image to get storage path
  const { data: image } = await supabaseAdmin
    .from('product_images')
    .select('image_url')
    .eq('id', imageId)
    .eq('product_id', id)
    .single();

  if (!image) {
    return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 });
  }

  // Extract storage path from URL
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const storagePath = image.image_url.replace(`${storageUrl}/storage/v1/object/public/product-images/`, '');

  // Delete from storage
  await supabaseAdmin.storage.from('product-images').remove([storagePath]);

  // Delete record
  const { error } = await supabaseAdmin.from('product_images').delete().eq('id', imageId);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
