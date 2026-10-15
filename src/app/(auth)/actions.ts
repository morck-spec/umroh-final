'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('LOGIN ERROR:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  let role = 'jamaah'

  if (data?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    role = data.user.user_metadata?.role || profile?.role || 'jamaah';
    if (profile?.role && ['super_admin', 'admin', 'admin_cabang'].includes(profile.role)) {
      role = profile.role;
    }
  }

  revalidatePath('/', 'layout')

  if (role === 'super_admin' || role === 'superadmin') {
    redirect('/dashboard/superadmin')
  } else if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'admin_cabang') {
    redirect('/dashboard/admin_cabang')
  } else if (role === 'mitra_agen') {
    redirect('/dashboard/mitra')
  } else if (role === 'muthawif' || role === 'guide') {
    redirect('/dashboard/muthawif')
  } else {
    redirect('/dashboard/jamaah')
  }
}

export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'jamaah',
      },
    },
  })

  if (error) {
    console.error('SIGNUP ERROR:', error.message)
    redirect(`/register?message=${encodeURIComponent(error.message)}`)
  }

  console.log('SIGNUP SUCCESS:', data.user?.id)

  revalidatePath('/', 'layout')
  redirect('/dashboard/jamaah')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

