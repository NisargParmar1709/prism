import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    try {
      const headerB64 = accessToken.split('.')[0];
      const headerStr = Buffer.from(headerB64, 'base64').toString();
      console.log('[Auth Session] Received JWT Header:', headerStr);
    } catch (e) {
      console.log('[Auth Session] Failed to decode JWT header', e);
    }

    // Set the cookie for 1 hour (aligns with default JWT expiry)
    cookies().set({
      name: 'prism-auth-token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  cookies().delete('prism-auth-token');
  return NextResponse.json({ success: true });
}
