import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip supabase checks if environment variables are not set (for UI demo purposes)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protective routing logic
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')

  if (!user && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  if (user) {
    // Fetch role from profiles table (trusted source), not user metadata
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'jamaah'

    // Determine the base dashboard path for this role
    let correctDashboard = '/dashboard/jamaah'
    if (role === 'super_admin') correctDashboard = '/dashboard/superadmin'
    else if (role === 'admin') correctDashboard = '/dashboard/admin'
    else if (role === 'admin_cabang') correctDashboard = '/dashboard/admin_cabang'

    // If trying to access login/register while logged in
    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = correctDashboard
      return NextResponse.redirect(redirectUrl)
    }

    // Protect Dashboard Routes based on role
    if (isDashboardRoute) {
      const pathname = request.nextUrl.pathname

      // Super Admin has access to everything for now, or just limit to superadmin?
      // Usually, it's better to force them to their own dashboard root
      if (pathname.startsWith('/dashboard/superadmin') && role !== 'super_admin') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = correctDashboard
        return NextResponse.redirect(redirectUrl)
      }

      // Admin dashboard protection
      if (pathname.startsWith('/dashboard/admin') && !pathname.startsWith('/dashboard/admin_cabang') && !['super_admin', 'admin'].includes(role)) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = correctDashboard
        return NextResponse.redirect(redirectUrl)
      }

      // Admin Cabang dashboard protection
      if (pathname.startsWith('/dashboard/admin_cabang') && !['super_admin', 'admin_cabang'].includes(role)) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = correctDashboard
        return NextResponse.redirect(redirectUrl)
      }

      // Jamaah dashboard protection (restrict admins from accidentally using jamaah dashboard)
      if (pathname.startsWith('/dashboard/jamaah') && role !== 'jamaah') {
         const redirectUrl = request.nextUrl.clone()
         redirectUrl.pathname = correctDashboard
         return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return supabaseResponse
}
