import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for auth route protection.
 *
 * Strategy:
 * - Public routes: /login, /register, /forgot-password, /reset-password, /auth, /test-*
 * - Protected routes: everything under /(dashboard), /onboarding, /dashboard, /accounts, etc.
 *
 * Since InsForge manages sessions via httpOnly cookies, we check for the
 * presence of the InsForge session cookie. The actual JWT validation happens
 * server-side in the FastAPI backend.
 *
 * This middleware provides a FAST client-side redirect for unauthenticated users.
 * It does NOT replace server-side auth checks — those still happen in the API.
 */

const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/test-design',
  '/test-components',
  '/',
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths, static files, API routes, and Next.js internals
  if (
    isPublicPath(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for the first-party synced session cookie
  const hasSession = request.cookies.has('prism-auth-token');

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
