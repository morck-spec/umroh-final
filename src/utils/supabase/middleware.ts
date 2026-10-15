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
    // Fetch role from profiles table, supporting user_metadata for roles like mitra_agen / muthawif
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    let role = user.user_metadata?.role || profile?.role || 'jamaah'
    if (user.email === 'mitra@demo.com' || user.email?.startsWith('mitra')) {
      role = 'mitra_agen'
    } else if (user.email === 'muthawif@demo.com' || user.email?.startsWith('muthawif')) {
      role = 'muthawif'
    } else if (user.email === 'jamaah@example.com' || user.email?.includes('jamaah')) {
      role = 'jamaah'
    } else if (profile?.role && ['super_admin', 'admin', 'admin_cabang'].includes(profile.role)) {
      role = profile.role
    }

    // Determine the base dashboard path for this role
    let correctDashboard = '/dashboard/jamaah'
    if (role === 'super_admin') correctDashboard = '/dashboard/superadmin'
    else if (role === 'admin') correctDashboard = '/dashboard/admin'
    else if (role === 'admin_cabang') correctDashboard = '/dashboard/admin_cabang'
    else if (role === 'mitra_agen') correctDashboard = '/dashboard/mitra'
    else if (role === 'muthawif' || role === 'guide') correctDashboard = '/dashboard/muthawif'

    // If trying to access login/register while logged in
    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = correctDashboard
      return NextResponse.redirect(redirectUrl)
    }

    // Role-specific shortcut routes for Jamaah
    if (role === 'jamaah') {
      const p = request.nextUrl.pathname
      // Disallow edit or create for jamaah
      if (p.includes('/edit') || p.endsWith('/create')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard/jamaah/registrations'
        return NextResponse.redirect(redirectUrl)
      }
      if (p === '/registrations' || p === '/pendaftaran' || p.startsWith('/registrations/') || p.startsWith('/pendaftaran/')) {
        const sub = p.replace(/^\/(registrations|pendaftaran)/, '')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/dashboard/jamaah/registrations${sub}`
        return NextResponse.redirect(redirectUrl)
      }
      if (p === '/documents' || p.startsWith('/documents/')) {
        const sub = p.replace(/^\/documents/, '')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/dashboard/jamaah/documents${sub}`
        return NextResponse.redirect(redirectUrl)
      }
      if (p.startsWith('/payments/') && p.endsWith('/checkout')) {
        const billId = p.replace('/payments/', '').replace('/checkout', '')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard/jamaah/payment/checkout'
        redirectUrl.searchParams.set('bill_id', billId)
        return NextResponse.redirect(redirectUrl)
      }
      if (p === '/payment' || p === '/payments' || p.startsWith('/payment/') || p.startsWith('/payments/')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard/jamaah/payment'
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Role-specific shortcut routes for Mitra Agen
    if (role === 'mitra_agen') {
      const p = request.nextUrl.pathname
      if (p === '/pilgrims' || p === '/jamaah' || p.startsWith('/pilgrims/') || p.startsWith('/jamaah/')) {
        const sub = p.replace(/^\/(pilgrims|jamaah)/, '')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/dashboard/mitra/jamaah${sub}`
        return NextResponse.redirect(redirectUrl)
      }
      if (p === '/registrations' || p === '/pendaftaran' || p.startsWith('/registrations/') || p.startsWith('/pendaftaran/')) {
        const sub = p.replace(/^\/(registrations|pendaftaran)/, '')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/dashboard/mitra/registrations${sub}`
        return NextResponse.redirect(redirectUrl)
      }
      if (p === '/commissions' || p.startsWith('/commissions/')) {
        const sub = p.replace(/^\/commissions/, '')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/dashboard/mitra/commissions${sub}`
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Protect Dashboard Routes based on role
    if (isDashboardRoute) {
      const pathname = request.nextUrl.pathname

      // Root /dashboard redirect
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = correctDashboard
        return NextResponse.redirect(redirectUrl)
      }

      // Disallow edit and create routes for Jamaah
      if (role === 'jamaah') {
        if (pathname.includes('/edit') || pathname.endsWith('/create')) {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/dashboard/jamaah/registrations'
          return NextResponse.redirect(redirectUrl)
        }
      }

      // If Mitra Agen tries to access Super Admin registration/jamaah routes, redirect to Mitra equivalent
      if (role === 'mitra_agen') {
        if (pathname.startsWith('/dashboard/superadmin/registrations')) {
          const sub = pathname.replace('/dashboard/superadmin/registrations', '');
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = `/dashboard/mitra/registrations${sub}`;
          return NextResponse.redirect(redirectUrl);
        }
        if (pathname.startsWith('/dashboard/superadmin/jamaah')) {
          const sub = pathname.replace('/dashboard/superadmin/jamaah', '');
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = `/dashboard/mitra/jamaah${sub}`;
          return NextResponse.redirect(redirectUrl);
        }
        if (pathname.startsWith('/dashboard/superadmin/commissions')) {
          const sub = pathname.replace('/dashboard/superadmin/commissions', '');
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = `/dashboard/mitra/commissions${sub}`;
          return NextResponse.redirect(redirectUrl);
        }
      }

      // Super Admin dashboard protection
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

      // Muthawif dashboard protection
      if (pathname.startsWith('/dashboard/muthawif') && !['super_admin', 'muthawif', 'guide'].includes(role)) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = correctDashboard
        return NextResponse.redirect(redirectUrl)
      }

      // Mitra dashboard protection
      if (pathname.startsWith('/dashboard/mitra') && !['super_admin', 'mitra_agen'].includes(role)) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = correctDashboard
        return NextResponse.redirect(redirectUrl)
      }

      // Jamaah dashboard protection (restrict non-jamaah from accidentally using jamaah dashboard)
      if (pathname.startsWith('/dashboard/jamaah') && !['super_admin', 'jamaah'].includes(role)) {
         const redirectUrl = request.nextUrl.clone()
         redirectUrl.pathname = correctDashboard
         return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return supabaseResponse
}
