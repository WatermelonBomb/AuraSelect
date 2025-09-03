import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get user session from cookie or header
  const authToken = request.cookies.get('auth-token')?.value ||
                   request.headers.get('authorization')?.replace('Bearer ', '')

  // Protected routes that require authentication
  const protectedRoutes = ['/admin', '/staff', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If trying to access protected route without auth
  if (isProtectedRoute && !authToken) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control
  if (authToken) {
    // In a real app, you'd decode the JWT token to get user role
    // For now, we'll assume the role is in the token or available somehow
    
    // Admin-only routes
    if (pathname.startsWith('/admin')) {
      // Here you'd check if user has admin role
      // For demo purposes, we'll allow access
    }
    
    // Staff-only routes
    if (pathname.startsWith('/staff')) {
      // Here you'd check if user has staff or admin role
      // For demo purposes, we'll allow access
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}