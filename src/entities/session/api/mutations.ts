import { supabase } from "@/shared/lib/supabase"
import { usernameToSyntheticEmail } from "@/shared/lib/username"

interface SignupClinicInput {
  username: string
  password: string
  fullName: string
  clinicName: string
  phone?: string
}

interface CreateStaffInput {
  username: string
  password: string
  fullName: string
  role: "doctor" | "admin"
  phone?: string
  /** Only used (and required) when the caller is a superadmin — an owner's
   * own clinic is always inferred server-side and any value sent here is
   * ignored for them. */
  clinicId?: string
  branchId?: string
}

async function invokeEdgeFunction<T>(
  name: string,
  body: object
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T & { error?: string }>(
    name,
    { body }
  )

  if (error) {
    throw new Error(error.message)
  }
  if (data && "error" in data && data.error) {
    throw new Error(data.error as string)
  }
  return data as T
}

export async function signupClinic(input: SignupClinicInput) {
  return invokeEdgeFunction<{ success: true; clinicId: string; userId: string }>(
    "signup-clinic",
    input
  )
}

export async function createStaff(input: CreateStaffInput) {
  return invokeEdgeFunction<{ success: true; userId: string }>(
    "create-staff",
    input
  )
}

export async function login(username: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToSyntheticEmail(username),
    password,
  })
  if (error) throw new Error("Login yoki parol noto'g'ri")
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
