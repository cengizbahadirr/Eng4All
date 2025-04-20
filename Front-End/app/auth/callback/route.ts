import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL'deki next parametresini kontrol et veya varsayılan olarak dashboard'a yönlendir
  const redirectTo = requestUrl.searchParams.get("next") || "/dashboard"

  // Tam URL oluştur
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eng4all.vercel.app"
  const redirectUrl = new URL(redirectTo, baseUrl).toString()

  return NextResponse.redirect(redirectUrl)
}
