// POST /api/admin/auth/login — Admin login via email/password (Supabase Auth)
import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      access_token: data.session.access_token,
      user: { id: data.user?.id, email: data.user?.email },
    },
  });
}
