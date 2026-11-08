import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/register') ||
                      request.nextUrl.pathname.startsWith('/welcome');

  // Protect history and child management routes for unauthenticated users
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/children') ||
                           request.nextUrl.pathname.startsWith('/history') ||
                           request.nextUrl.pathname.startsWith('/account');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
