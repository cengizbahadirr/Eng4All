"use client"
import {
  Home,
  BookOpen,
  PenTool,
  CheckSquare,
  ListChecks,
  MessageSquare,
  Heart,
  Search,
  BarChart2,
  Trophy,
  User,
  PlayCircle,
  LogOut,
  Shuffle,
  Layers, // Layers ikonu eklendi
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Eng4AllLogo from "@/components/eng4all-logo"
import { useRouter } from "next/navigation"
import { signOut } from "@/actions/auth-actions"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"

interface SidebarProps {
  activeNav: string
  onNavClick: (nav: string) => void
}

export function Sidebar({ activeNav, onNavClick }: SidebarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, mutate: mutateAuth } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Başarıyla çıkış yaptınız.",
        });
        router.push("/login");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Çıkış Hatası",
          description: result.error || "Çıkış yapılırken bir sorun oluştu.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Çıkış Hatası",
        description: "Beklenmedik bir hata oluştu.",
      });
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const navItems = [
    { icon: Home, label: "Ana Sayfa", path: "/dashboard" },
    { icon: BookOpen, label: "Kelime Pratiği", path: "/vocabulary" },
    { icon: PenTool, label: "Gramer Pratiği", path: "/grammar" },
    { icon: CheckSquare, label: "Quizler", path: "/quizzes" },
    { icon: ListChecks, label: "Tekrar Listesi", path: "/review" },
    { icon: Heart, label: "Favorilerim", path: "/favorites" },
    { icon: Search, label: "Arama Yap", path: "/search" },
    { icon: MessageSquare, label: "Chatbot", path: "/chatbot" },
    { icon: PlayCircle, label: "Görsel Eğitimler", path: "/visual-training" },
    { icon: Layers, label: "Eş Anlamlılar", path: "/synonyms" }, // Yeni link eklendi
    { icon: BarChart2, label: "İlerlemem", path: "/progress" },
    { icon: Trophy, label: "Puan Tabloları", path: "/leaderboard" },
    { icon: User, label: "Profilim", path: "/profile" },
  ]

  return (
    <div className="w-64 h-screen bg-background border-r flex flex-col">
      <div className="p-4 flex items-center border-b">
        <Eng4AllLogo size={32} />
        <h1 className="text-xl font-bold text-primary ml-2">Eng4All</h1>
      </div>

      <div className="p-4 border-b">
        {isAuthLoading ? (
          <>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </>
        ) : user ? (
          <div>
            <p className="text-sm font-medium text-foreground">{user.name || "Kullanıcı"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Giriş yapılmadı</p>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal mb-1",
              activeNav === item.path
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
            )}
            onClick={() => onNavClick(item.path)}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t mt-auto">
        {user && (
          <Button
            variant="ghost"
            className="w-full justify-start text-left font-normal text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            onClick={async () => {
              await handleSignOut();
              mutateAuth(null, false);
            }}
            disabled={isSigningOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {isSigningOut ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
          </Button>
        )}
      </div>
    </div>
  )
}
