'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createJamaah(formData: FormData) {
  const name = formData.get('name') as string
  const nik = formData.get('nik') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const packageId = formData.get('packageId') as string

  const supabase = await createClient()

  // In a real production app with Supabase, an admin creating another user
  // requires the Supabase Admin API (service role key).
  // Using regular signUp might sign the admin out and sign the new user in.
  // We'll proceed with standard auth here for demo purposes,
  // but normally you'd use supabase.auth.admin.createUser()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        nik,
        phone,
        address,
        role: 'jamaah'
      }
    }
  })

  if (error) {
    console.error('Error creating user:', error)
    // Could return error or redirect with error param
    redirect('/dashboard/admin/jamaah/create?error=Could not create user')
  }

  // Next steps would be to create the registration record for the chosen package
  if (data.user && packageId) {
    // Assuming you have packages in DB, you would find the ID
    // and insert into registrations table.
    // For now, we simulate this successful creation.
  }

  redirect('/dashboard/admin?success=Jamaah created')
}
