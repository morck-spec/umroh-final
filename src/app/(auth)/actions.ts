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
    // In a real app we'd want to return this error or redirect with error param
    redirect('/login?message=Could not authenticate user')
  }

  // Ambil role dari tabel profiles
  let role = 'jamaah'
  if (data?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
    if (profile?.role) {
      role = profile.role
    }
  }

  revalidatePath('/', 'layout')

  // Arahkan ke dashboard yang sesuai
  if (role === 'superadmin') {
    redirect('/dashboard/superadmin')
  } else if (role === 'admin') {
    redirect('/dashboard/admin')
  } else {
    redirect('/dashboard/jamaah')
  }
}

export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'jamaah', // default role
      },
    },
  })

  if (error) {
    redirect('/register?message=Could not create user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard/jamaah')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
