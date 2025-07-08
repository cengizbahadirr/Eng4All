import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // jose kütüphanesi JWT doğrulaması için daha modern ve güvenlidir

const JWT_SECRET = process.env.JWT_SECRET;

// JWT'yi doğrulamak için helper fonksiyon
async function verifyToken(token: string) {
  console.log("[Middleware] verifyToken çağrıldı. Token:", token ? "VAR" : "YOK");
  if (!JWT_SECRET) {
    console.error("[Middleware] JWT_SECRET tanımlanmamış.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log("[Middleware] verifyToken başarılı. Payload:", payload);
    return payload; // payload içinde userId olmalı
  } catch (error) {
    console.error("[Middleware] JWT doğrulama hatası:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;
  
  console.log(`[Middleware] Çalıştı. Pathname: ${pathname}, Token Cookie: ${token ? 'VAR' : 'YOK'}`);

  let userPayload = null;
  if (token) {
    console.log("[Middleware] Token bulundu, doğrulanıyor...");
    userPayload = await verifyToken(token);
    console.log("[Middleware] userPayload doğrulama sonrası:", userPayload);
  } else {
    console.log("[Middleware] Token bulunamadı.");
  }

  // Auth callback route'unu (eğer varsa, artık JWT ile gerekmeyebilir) ve statik dosyaları koruma dışında tut
  // Supabase'den kalma /auth/callback rotası artık kullanılmıyor olabilir.
  // if (pathname.startsWith("/auth/callback")) {
  //   return NextResponse.next();
  // }

  // Check if the pathname is a protected route
  const protectedRoutes = [
    "/dashboard",
    "/vocabulary",
    "/grammar",
    "/quizzes",
    "/review",
    "/favorites",
    "/chatbot",
    "/progress",
    "/leaderboard",
    "/profile",
    "/level-assessment",
    "/visual-training",
  ];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if the pathname is an auth route
  const authRoutes = ["/login", "/register", "/forgot-password"]; // forgot-password henüz implemente edilmedi
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If it's a protected route and there's no valid token/userPayload, redirect to login
  if (isProtectedRoute && !userPayload) {
    console.log(`[Middleware] Korumalı rota (${pathname}) ve userPayload yok. /login'e yönlendiriliyor.`);
    const redirectUrl = new URL("/login", request.url);
    // redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If it's an auth route and there's a valid token/userPayload, redirect to dashboard
  if (isAuthRoute && userPayload) {
    console.log(`[Middleware] Auth rotası (${pathname}) ve userPayload var. /dashboard'a yönlendiriliyor.`);
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  console.log(`[Middleware] Yönlendirme yapılmadı, devam ediliyor: ${pathname}`);

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aşağıdakiler hariç tüm istek yollarıyla eşleştir:
     * - api (API rotaları)
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyon dosyaları)
     * - favicon.ico (favicon dosyası)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
