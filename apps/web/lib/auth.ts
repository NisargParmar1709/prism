import { insforge } from './insforge';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  profile: {
    name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

export interface SignUpResult {
  requireEmailVerification: boolean;
  user?: AuthUser;
}

// ─── Auth Functions ──────────────────────────────────────────────────────────

/**
 * Helper to manually sync the session to our Next.js backend cookie.
 * This guarantees the cookie is set before the router redirects.
 */
async function syncSession(token?: string | null) {
  if (!token) return;
  try {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: token }),
    });
  } catch (e) {
    console.error('Failed to sync session manually', e);
  }
}

/**
 * Register a new user with email + password.
 * redirectTo points to the login page so after link-based email verification,
 * InsForge redirects the browser there with query params indicating success/error.
 */
export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await insforge.auth.signUp({
    email,
    password,
    name,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });

  if (error) throw error;
  if (data?.accessToken) await syncSession(data.accessToken);
  return data;
}

/**
 * Sign in with email + password.
 * Returns the user + accessToken on success.
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await insforge.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (data?.accessToken) await syncSession(data.accessToken);
  return data;
}

/**
 * Sign in with Google OAuth.
 * InsForge handles the full OAuth flow — redirect to Google, callback, session creation.
 * After auth, InsForge redirects to the redirectTo URL.
 */
export async function signInWithGoogle() {
  await insforge.auth.signInWithOAuth('google', {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  });
}

/**
 * Sign out the current user and clear the session cookie.
 */
export async function signOut() {
  const { error } = await insforge.auth.signOut();
  if (error) throw error;
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch (e) {}
}

/**
 * Send password reset email.
 * redirectTo points to our /reset-password page so the user
 * lands there with a token in the URL.
 */
export async function sendPasswordReset(email: string) {
  const { data, error } = await insforge.auth.sendResetPasswordEmail({
    email,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) throw error;
  return data;
}

/**
 * Reset password using a token (from the email link URL).
 */
export async function resetPassword(newPassword: string, token: string) {
  const { data, error } = await insforge.auth.resetPassword({
    newPassword,
    otp: token,
  });

  if (error) throw error;
  return data;
}

/**
 * Get the currently authenticated user.
 * The SDK auto-refreshes the session via httpOnly cookie if needed.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error || !data?.user) return null;
  return data.user as AuthUser;
}

/**
 * Resend the verification email (e.g., if the user didn't receive it).
 */
export async function resendVerificationEmail(email: string) {
  const { data, error } = await insforge.auth.resendVerificationEmail({
    email,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });

  if (error) throw error;
  return data;
}
