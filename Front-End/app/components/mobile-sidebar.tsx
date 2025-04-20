"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./sidebar"

import {
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
  PlayCircle,
} from "lucide-react"

interface MobileSidebarProps {
  activeNav: string
  onNavClick: (nav: string) => void
}

export function MobileSidebar({ activeNav, onNavClick }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  const handleNavClick = (nav: string) => {
    onNavClick(nav)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü Aç</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar activeNav={activeNav} onNavClick={handleNavClick} />
      </SheetContent>
    </Sheet>
  )
}

const navItems = [
  { icon: Home, label: "Ana Sayfa", path: "/dashboard" },
  { icon: BookOpen, label: "Kelime Çalışma", path: "/vocabulary" },
  { icon: PenTool, label: "Gramer Çalışma", path: "/grammar" },
  { icon: CheckSquare, label: "Quizler", path: "/quizzes" },
  { icon: ListChecks, label: "Tekrar Listesi", path: "/review" },
  { icon: Heart, label: "Favorilerim", path: "/favorites" },
  { icon: MessageSquare, label: "AI Chatbot", path: "/chatbot" },
  { icon: PlayCircle, label: "Görsel Eğitimler", path: "/visual-training" },
  { icon: BarChart2, label: "İlerlemem", path: "/progress" },
  { icon: Trophy, label: "Puan Tabloları", path: "/leaderboard" },
  { icon: User, label: "Profilim", path: "/profile" },
]
