import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback route handler.
 *
 * InsForge link-based flows (email verification, password reset) redirect
 * through InsForge's backend first, which then redirects to the `redirectTo`
 * URL specified during signUp / sendResetPasswordEmail.
 *
 * We've configured those redirects to go directly to /login and /reset-password,
 * so this route mainly exists as a fallback catch-all for any OAuth callback
 * flows that may be added in the future (Google, GitHub, etc.).
 *
 * For OAuth: InsForge appends `?insforge_code=...` to the redirectTo URL.
 * The SDK's `signInWithOAuth` method handles the code exchange automatically
 * in the browser when it detects the insforge_code param.
 *
 * For now, this route simply redirects to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirect_to') || '/dashboard';

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
