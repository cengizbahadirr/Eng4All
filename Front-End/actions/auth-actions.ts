"use server"

import { getSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (!email || !password) {
      return { error: "E-posta ve şifre gereklidir." }
    }

    const supabase = getSupabaseServer()

    // Dinamik site URL'i kullanarak yönlendirme URL'i oluştur
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eng4all.vercel.app"

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      console.error("Kayıt hatası:", error.message)
      return { error: error.message }
    }

    return {
      success: true,
      message: "Kayıt başarılı! E-posta adresinizi kontrol edin.",
    }
  } catch (error) {
    console.error("Beklenmeyen hata:", error)
    return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
  }
}

export async function signIn(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "E-posta ve şifre gereklidir." }
    }

    const supabase = getSupabaseServer()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Giriş hatası:", error.message)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Beklenmeyen hata:", error)
    return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
  }
}

export async function signOut() {
  const supabase = getSupabaseServer()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function resetPassword(formData: FormData) {
  try {
    const email = formData.get("email") as string

    if (!email) {
      return { error: "E-posta gereklidir." }
    }

    const supabase = getSupabaseServer()

    // Dinamik site URL'i kullanarak yönlendirme URL'i oluştur
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eng4all.vercel.app"

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    })

    if (error) {
      console.error("Şifre sıfırlama hatası:", error.message)
      return { error: error.message }
    }

    return {
      success: true,
      message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
    }
  } catch (error) {
    console.error("Beklenmeyen hata:", error)
    return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const password = formData.get("password") as string

    if (!password) {
      return { error: "Şifre gereklidir." }
    }

    const supabase = getSupabaseServer()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error("Şifre güncelleme hatası:", error.message)
      return { error: error.message }
    }

    return {
      success: true,
      message: "Şifreniz başarıyla güncellendi.",
    }
  } catch (error) {
    console.error("Beklenmeyen hata:", error)
    return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
  }
}
