"use client"
import {
  Home,
  BookOpen,
  PenTool,
  CheckSquare,
  ListChecks,
  MessageSquare,
  Heart,
  BarChart2,
  Trophy,
  User,
  PlayCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Eng4AllLogo from "@/components/eng4all-logo"

interface SidebarProps {
  activeNav: string
  onNavClick: (nav: string) => void
}

export function Sidebar({ activeNav, onNavClick }: SidebarProps) {
  const navItems = [
    { icon: Home, label: "Ana Sayfa", path: "/dashboard" },
    { icon: BookOpen, label: "Kelime Pratiği", path: "/vocabulary" },
    { icon: PenTool, label: "Gramer Pratiği", path: "/grammar" },
    { icon: CheckSquare, label: "Quizler", path: "/quizzes" },
    { icon: ListChecks, label: "Tekrar Listesi", path: "/review" },
    { icon: Heart, label: "Favorilerim", path: "/favorites" },
    { icon: MessageSquare, label: "Chatbot", path: "/chatbot" },
    { icon: PlayCircle, label: "Görsel Eğitimler", path: "/visual-training" },
    { icon: BarChart2, label: "İlerlemem", path: "/progress" },
    { icon: Trophy, label: "Puan Tabloları", path: "/leaderboard" },
    { icon: User, label: "Profilim", path: "/profile" },
  ]

  return (
    <div className="w-64 h-screen bg-background border-r flex flex-col">
      <div className="p-4 flex items-center">
        <Eng4AllLogo size={32} />
        <h1 className="text-xl font-bold text-primary ml-2">Eng4All</h1>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
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

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Çevrimiçi</span>
        </div>
      </div>
    </div>
  )
}
