"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Sun,
  Moon,
  BookOpen,
  MessageSquare,
  Award,
  BarChart2,
  Brain,
  Heart,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Eng4AllLogo from "@/components/eng4all-logo"
import { useTheme } from "next-themes"

export default function LandingPage() {
  const [language, setLanguage] = useState("TÜRKÇE")
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // Sayfalar ve ikonları
  const pages = [
    { name: "Dashboard", path: "/dashboard", icon: <BarChart2 className="h-5 w-5 mr-2" /> },
    { name: "Kelime Çalışması", path: "/vocabulary", icon: <BookOpen className="h-5 w-5 mr-2" /> },
    { name: "Gramer Çalışması", path: "/grammar", icon: <Brain className="h-5 w-5 mr-2" /> },
    { name: "Quizler", path: "/quizzes", icon: <Award className="h-5 w-5 mr-2" /> },
    { name: "Tekrar Listesi", path: "/review", icon: <RotateCcw className="h-5 w-5 mr-2" /> },
    { name: "Favorilerim", path: "/favorites", icon: <Heart className="h-5 w-5 mr-2" /> },
    { name: "AI Chatbot", path: "/chatbot", icon: <MessageSquare className="h-5 w-5 mr-2" /> },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-20 py-10 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center mb-16">
          {/* Left side - Empty circle (no bird) */}
          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
            <div className="w-64 h-64 md:w-80 md:h-80 bg-muted rounded-full flex items-center justify-center">
              {/* Decorative element instead of bird */}
              <div className="w-32 h-32 bg-lilac/20 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-lilac/40 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right side - Text and buttons */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
            <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left mb-6 text-foreground">
              Dil öğrenmenin ücretsiz, eğlenceli ve etkili yolu!
            </h1>

            <Button
              className="w-full md:w-80 h-12 bg-lilac hover:bg-lilac/90 text-white font-bold text-lg rounded-xl mb-3"
              onClick={() => router.push("/register")}
            >
              BAŞLA
            </Button>

            <Button
              variant="outline"
              className="w-full md:w-80 h-12 border-input text-lilac font-bold text-lg rounded-xl hover:bg-muted/50"
              onClick={() => router.push("/login")}
            >
              ZATEN HESABIM VAR
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Özelliklerimiz</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.path}
                className="bg-card hover:bg-card/90 border border-border rounded-xl p-6 flex flex-col items-center cursor-pointer transition-all duration-200 hover:shadow-md"
                onClick={() => router.push(page.path)}
              >
                <div className="w-12 h-12 rounded-full bg-lilac/10 flex items-center justify-center mb-4">
                  <div className="text-lilac">{page.icon}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{page.name}</h3>
                <p className="text-sm text-muted-foreground text-center">{getFeatureDescription(page.name)}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 border-t border-input">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-4">
          <div className="flex items-center mr-6 text-muted-foreground">
            <div className="w-6 h-6 mr-2 flex items-center justify-center">
              <span className="text-lg">🇺🇸</span>
            </div>
            <span>İNGİLİZCE</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Her özellik için açıklama metni
function getFeatureDescription(pageName: string): string {
  switch (pageName) {
    case "Dashboard":
      return "Öğrenme sürecinizi takip edin ve ilerleyişinizi görün."
    case "Kelime Çalışması":
      return "Yeni kelimeler öğrenin ve kelime dağarcığınızı genişletin."
    case "Gramer Çalışması":
      return "İngilizce dilbilgisi kurallarını öğrenin ve pratik yapın."
    case "Quizler":
      return "Bilginizi test edin ve öğrenme sürecinizi pekiştirin."
    case "Tekrar Listesi":
      return "Öğrendiğiniz kelimeleri tekrar ederek kalıcı hale getirin."
    case "Favorilerim":
      return "En sevdiğiniz kelimeleri kaydedin ve kolayca erişin."
    case "AI Chatbot":
      return "Yapay zeka destekli chatbot ile gramer kontrolü yapın."
    default:
      return "İngilizce öğrenmenize yardımcı olacak özellik."
  }
}
