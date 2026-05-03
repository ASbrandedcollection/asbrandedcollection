import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const formData = await request.formData();
  const file = formData.get('image') as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(file.type)) {
    return NextResponse.json({ success: false, error: 'Only JPEG, PNG, and WebP images allowed' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'File size must be under 5MB' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const filename = `categories/${id}/${timestamp}-${file.name}`;

  const { error: uploadError } = await supabaseAdmin.storage.from('product-images').upload(filename, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(filename);
  const imageUrl = data.publicUrl;

  // Update category with image URL
  const { data: category, error: updateError } = await supabaseAdmin
    .from('categories')
    .update({ image_url: imageUrl })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: category }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  // Get current image_url so we can delete from storage too
  const { data: category } = await supabaseAdmin.from('categories').select('image_url').eq('id', id).single();

  if (category?.image_url) {
    // Extract storage path from the public URL
    // URL format: .../storage/v1/object/public/product-images/categories/{id}/...
    const url = new URL(category.image_url);
    const pathParts = url.pathname.split('/product-images/');
    if (pathParts.length > 1) {
      const storagePath = pathParts[1];
      // Best-effort delete from storage — don't fail the whole request if this errors
      await supabaseAdmin.storage.from('product-images').remove([storagePath]);
    }
  }

  // Null out the image_url in DB
  const { error } = await supabaseAdmin.from('categories').update({ image_url: null }).eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
