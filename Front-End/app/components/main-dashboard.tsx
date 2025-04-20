"use client"

import { type ReactNode, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Search,
  Settings,
  LogOut,
  Home,
  BookOpen,
  PenTool,
  CheckSquare,
  ListChecks,
  Heart,
  MessageSquare,
  BarChart2,
  Trophy,
  User,
  Sun,
  Moon,
  PlayCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eng4AllLogo } from "@/components/eng4all-logo"
import { useTheme } from "next-themes"
import { signOut } from "@/actions/auth-actions"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import { LevelAssessmentTest } from "@/components/level-assessment-test/level-assessment-test"

interface MainDashboardProps {
  children: ReactNode
  initialActiveNav?: string
}

export default function MainDashboard({ children, initialActiveNav = "/dashboard" }: MainDashboardProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { user, loading } = useUser()
  const [showLevelTest, setShowLevelTest] = useState(false)
  const [activeNav, setActiveNav] = useState(initialActiveNav)

  // Sample data
  const userData = {
    name: user?.displayName || "Kullanıcı",
    streak: user?.streak || 15,
    points: user?.points || 1250,
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }
      } catch (error) {
        console.error("Session check error:", error)
      }
    }

    checkUser()
  }, [router])

  useEffect(() => {
    // Update active nav based on current path
    if (pathname) {
      setActiveNav(pathname)
    }
  }, [pathname])

  const handleSignOut = async () => {
    try {
      const result = await signOut()

      if (result.success) {
        toast({
          title: "Çıkış başarılı",
          description: "Güvenli bir şekilde çıkış yaptınız.",
        })
        router.push("/login")
        router.refresh()
      } else if (result.error) {
        toast({
          variant: "destructive",
          title: "Çıkış başarısız",
          description: result.error,
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        variant: "destructive",
        title: "Çıkış başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
      })
    }
  }

  const handleNavClick = (nav: string) => {
    setActiveNav(nav)

    // Navigate to the corresponding page
    switch (nav) {
      case "/dashboard":
      case "dashboard":
        router.push("/dashboard")
        break
      case "/vocabulary":
      case "vocabulary":
        router.push("/vocabulary")
        break
      case "/grammar":
      case "grammar":
        router.push("/grammar")
        break
      case "/quizzes":
      case "quizzes":
        router.push("/quizzes")
        break
      case "/review":
      case "review":
        router.push("/review")
        break
      case "/favorites":
      case "favorites":
        router.push("/favorites")
        break
      case "/chatbot":
      case "chatbot":
        router.push("/chatbot")
        break
      case "/visual-training":
      case "visual-training":
        router.push("/visual-training")
        break
      case "/progress":
      case "progress":
        router.push("/progress")
        break
      case "/leaderboard":
      case "leaderboard":
        router.push("/leaderboard")
        break
      case "/profile":
      case "profile":
        router.push("/profile")
        break
      default:
        router.push(nav)
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Define navigation items
  const navItems = [
    { id: "/dashboard", path: "/dashboard", label: "Ana Sayfa", icon: Home },
    { id: "/vocabulary", path: "/vocabulary", label: "Kelime Çalışma", icon: BookOpen },
    { id: "/grammar", path: "/grammar", label: "Gramer Çalışma", icon: PenTool },
    { id: "/quizzes", path: "/quizzes", label: "Quizler", icon: CheckSquare },
    { id: "/review", path: "/review", label: "Tekrar Listesi", icon: ListChecks },
    { id: "/favorites", path: "/favorites", label: "Favorilerim", icon: Heart },
    { id: "/chatbot", path: "/chatbot", label: "AI Chatbot", icon: MessageSquare },
    { id: "/visual-training", path: "/visual-training", label: "Görsel Eğitimler", icon: PlayCircle },
    { id: "/progress", path: "/progress", label: "İlerlemem", icon: BarChart2 },
    { id: "/leaderboard", path: "/leaderboard", label: "Puan Tabloları", icon: Trophy },
    { id: "/profile", path: "/profile", label: "Profilim", icon: User },
  ]

  // Log the navigation items to debug
  console.log("Navigation Items:", navItems)
  console.log("Active Nav:", activeNav)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="w-full py-3 px-4 border-b border-input flex items-center justify-between sticky top-0 z-10 bg-background">
        <div className="flex items-center">
          <Eng4AllLogo />
          <span className="text-lilac text-2xl font-bold ml-2 hidden sm:inline-block">eng4all</span>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kelime veya konu ara..."
              className="pl-8 bg-muted focus:border-lilac focus:ring-lilac"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center text-sm font-medium">
            <span className="hidden md:inline-block mr-2">Merhaba, {userData.name}!</span>
            <Avatar className="h-8 w-8 border-2 border-lilac">
              <AvatarImage src="/placeholder.svg" alt={userData.name} />
              <AvatarFallback className="bg-lilac/20 text-lilac">{userData.name[0]}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <span className="text-base">🔥</span>
              <span>{userData.streak}</span>
            </Badge>

            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <span className="text-base">💎</span>
              <span>{userData.points}</span>
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-lilac" /> : <Moon className="h-5 w-5 text-lilac" />}
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Settings">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full" aria-label="Logout">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-16 md:w-56 border-r border-input flex flex-col py-4 overflow-y-auto shrink-0">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeNav === item.id || activeNav === item.path ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeNav === item.id || activeNav === item.path ? "bg-lilac/10 text-lilac" : ""
                } ${activeNav === item.id || activeNav === item.path ? "border-l-4 border-lilac" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    activeNav === item.id || activeNav === item.path ? "text-lilac" : "text-muted-foreground"
                  } mr-2`}
                />
                <span className="hidden md:inline-block">{item.label}</span>
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Level Assessment Test Modal */}
      {showLevelTest && (
        <LevelAssessmentTest
          isFirstTime={false}
          onComplete={(level) => {
            setShowLevelTest(false)
            toast({
              title: "Seviye kaydedildi",
              description: `İngilizce seviyeniz ${level} olarak kaydedildi.`,
            })
          }}
          onClose={() => setShowLevelTest(false)}
        />
      )}
    </div>
  )
}

export { MainDashboard }
