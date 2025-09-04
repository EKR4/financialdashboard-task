import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

// Paths that don't require authentication
const publicPaths = ['/login', '/signup', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.includes(pathname) || pathname.startsWith('/auth/callback') || 
      pathname.startsWith('/_next') || pathname.startsWith('/public')) {
    return NextResponse.next();
  }

  try {
    // Create a Supabase client for the middleware
    const { supabase, response } = createClient(request);

    // Get session from the request cookies
    const { data } = await supabase.auth.getSession();

    // If there's no session, redirect to login
    if (!data.session) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // User is authenticated, proceed with the modified response
    return response;
  } catch (error) {
    console.error('Middleware authentication error:', error);
    
    // In case of error, redirect to login for safety
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public/ (public files)
     * - api/ (API routes that handle their own auth)
     * - login, signup, and auth callback pages
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api|login|signup|auth/callback).*)',
  ],
};