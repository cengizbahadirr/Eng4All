import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl

  // Create a response object
  const response = NextResponse.next()

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // This is needed for middleware authentication to work
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth callback route'unu koruma dışında tut
  if (pathname.startsWith("/auth/callback")) {
    return response
  }

  // Check if the pathname is a protected route
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/vocabulary") ||
    pathname.startsWith("/grammar") ||
    pathname.startsWith("/quizzes") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/favorites") ||
    pathname.startsWith("/chatbot") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/level-assessment") ||
    pathname.startsWith("/visual-training")

  // Check if the pathname is an auth route
  const isAuthRoute = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password"

  // If it's a protected route and there's no session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If it's an auth route and there's a session, redirect to dashboard
  if (isAuthRoute && session) {
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
