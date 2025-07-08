import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import ActivityTrackerClientWrapper from "@/components/activity-tracker-client-wrapper"; // Import edildi

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Eng4All - Dil Öğrenme Uygulaması",
  description: "Eng4All ile İngilizce öğrenin",
    generator: 'v0.dev'
}

import { MainDashboard } from "@/components/main-dashboard"; // MainDashboard import edildi
import { getUser } from "@/lib/session";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser();

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/eng4all-logo.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* 
            Login, register gibi sayfaların MainDashboard'u kullanmaması gerekebilir.
            Bu durumda, bu sayfalar için ayrı bir layout dosyası (örn: app/auth/layout.tsx)
            oluşturulabilir veya MainDashboard içinde koşullu render yapılabilir.
            Şimdilik tüm sayfaların MainDashboard'u kullanacağını varsayalım.
            Eğer login/register sayfaları için farklı bir düzen gerekiyorsa, bunu ayrıca ele almalıyız.
          */}
          <MainDashboard user={user}>
            {children}
          </MainDashboard>
          <Toaster />
          <ActivityTrackerClientWrapper /> {/* Eklendi */}
        </ThemeProvider>
      </body>
    </html>
  )
}
