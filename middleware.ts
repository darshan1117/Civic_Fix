import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, SessionUser } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie.value)) as SessionUser;
      if (user.role !== 'admin') {
        const errorUrl = new URL('/login', request.url);
        errorUrl.searchParams.set('error', 'admin_required');
        return NextResponse.redirect(errorUrl);
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_invalid');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /officer routes
  if (pathname.startsWith('/officer')) {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie.value)) as SessionUser;
      if (user.role !== 'officer' && user.role !== 'admin') {
        const errorUrl = new URL('/login', request.url);
        errorUrl.searchParams.set('error', 'officer_required');
        return NextResponse.redirect(errorUrl);
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_invalid');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/officer/:path*'],
};
