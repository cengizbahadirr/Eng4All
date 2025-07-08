"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  Layers as LayersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type User = {
  _id: string;
  name: string;
  email: string;
} | null;

interface SidebarProps {
  user: User;
}

const navItems = [
    { id: "/dashboard", path: "/dashboard", label: "Ana Sayfa", icon: Home },
    { id: "/study-areas", path: "/study-areas", label: "Çalışma Alanları", icon: LayersIcon },
    { id: "/vocabulary", path: "/vocabulary", label: "Kelime Pratiği", icon: BookOpen },
    { id: "/grammar", path: "/grammar", label: "Gramer Pratiği", icon: PenTool },
    { id: "/quizzes", path: "/quizzes", label: "Quizler", icon: CheckSquare },
    { id: "/review", path: "/review", label: "Tekrar Listesi", icon: ListChecks },
    { id: "/favorites", path: "/favorites", label: "Favorilerim", icon: Heart },
    { id: "/chatbot", path: "/chatbot", label: "AI Chatbot", icon: MessageSquare },
    { id: "/visual-training", path: "/visual-training", label: "Görsel Eğitimler", icon: PlayCircle },
    { id: "/progress", path: "/progress", label: "İlerlemem", icon: BarChart2 },
    { id: "/leaderboard", path: "/leaderboard", label: "Puan Tabloları", icon: Trophy },
    { id: "/profile", path: "/profile", label: "Profilim", icon: User },
];

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeNav, setActiveNav] = useState(pathname);

  useEffect(() => {
    if (pathname) {
      setActiveNav(pathname);
    }
  }, [pathname]);

  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
    router.push(nav);
  };

  // If there is no user, don't render the sidebar.
  // This assumes that public pages like /login don't use the MainDashboard layout.
  if (!user) {
    return null;
  }

  return (
    <aside className="w-16 md:w-56 border-r border-input flex flex-col py-4 overflow-y-auto shrink-0">
      <nav className="space-y-1 px-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeNav === item.path ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              activeNav === item.path ? "bg-lilac/10 text-lilac border-l-4 border-lilac" : ""
            }`}
            onClick={() => handleNavClick(item.path)}
          >
            <item.icon
              className={`h-5 w-5 ${
                activeNav === item.path ? "text-lilac" : "text-muted-foreground"
              } mr-2`}
            />
            <span className="hidden md:inline-block">{item.label}</span>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
