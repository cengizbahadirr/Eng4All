"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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
  Send,
  Copy,
  CheckCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import Eng4AllLogo from "@/components/eng4all-logo"
import { useTheme } from "next-themes"
import { signOut } from "@/actions/auth-actions"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Types for chat messages
type MessageType = "user" | "bot"

interface ChatMessage {
  id: string
  type: MessageType
  text: string
  timestamp: Date
  correction?: string
  explanation?: string[]
}

// Dummy data for demonstration
const badges = [
  { id: 1, name: "7 Gün Streak", icon: "🔥" },
  { id: 2, name: "100 Kelime", icon: "📚" },
  { id: 3, name: "Gramer Ustası", icon: "🏆" },
]

const leaderboard = [
  { rank: 1, name: "Ahmet Y.", points: 2450, avatar: "" },
  { rank: 2, name: "Zeynep K.", points: 2320, avatar: "" },
  { rank: 3, name: "Mehmet A.", points: 2180, avatar: "" },
]

const dailyGoals = [
  { id: 1, title: "10 Puan kazan", progress: 0, total: 10, icon: "⚡" },
  { id: 2, title: "2 dersinde art arda 5 doğru yap", progress: 0, total: 2, icon: "🦉" },
  { id: 3, title: "3 dersi hatasız yap", progress: 0, total: 3, icon: "🎯" },
]

// Initial welcome message
const welcomeMessage: ChatMessage = {
  id: "welcome",
  type: "bot",
  text: "Merhaba! İngilizce cümlelerini kontrol etmemi ister misin? Yazmaya başla, hataların varsa düzeltip açıklayacağım.",
  timestamp: new Date(),
}

// Mock AI response function (simulates API call)
const getMockAIResponse = async (userMessage: string): Promise<ChatMessage> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Randomly decide if we should simulate an error (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("AI service unavailable")
  }

  // Check for common grammar errors to provide corrections
  let correction = ""
  const explanation: string[] = []

  // Simple grammar checks (this is just for demonstration)
  if (userMessage.includes("I has")) {
    correction = userMessage.replace("I has", "I have")
    explanation.push("'has' yerine 'have' kullanılmalı çünkü özne 'I'.")
  } else if (userMessage.includes("she have")) {
    correction = userMessage.replace("she have", "she has")
    explanation.push("'have' yerine 'has' kullanılmalı çünkü özne 'she'.")
  } else if (userMessage.includes("they is")) {
    correction = userMessage.replace("they is", "they are")
    explanation.push("'is' yerine 'are' kullanılmalı çünkü özne 'they'.")
  } else if (userMessage.toLowerCase().includes("i am go")) {
    correction = userMessage.replace(/i am go/i, "I am going")
    explanation.push("Sürekli eylem için 'go' yerine 'going' kullanılmalı.")
  } else if (userMessage.includes("yesterday I go")) {
    correction = userMessage.replace("yesterday I go", "yesterday I went")
    explanation.push("Geçmiş zaman için 'go' yerine 'went' kullanılmalı.")
  }

  // If no errors found
  if (!correction) {
    return {
      id: Date.now().toString(),
      type: "bot",
      text: "Harika! Cümlenizde herhangi bir gramer hatası bulamadım. Doğru kullanım için tebrikler!",
      timestamp: new Date(),
    }
  }

  // Return message with correction and explanation
  return {
    id: Date.now().toString(),
    type: "bot",
    text: "Cümlenizde bazı gramer hataları buldum:",
    timestamp: new Date(),
    correction,
    explanation,
  }
}

export default function ChatbotPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState("chatbot")
  const [userRank, setUserRank] = useState(15)
  const [totalUsers, setTotalUsers] = useState(150)
  const [streak, setStreak] = useState(15)
  const [points, setPoints] = useState(1250)
  const [level, setLevel] = useState("B1 - Orta Seviye")

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabaseBrowser()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          window.location.href = "/login"
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Çıkış başarılı",
        description: "Güvenli bir şekilde çıkış yaptınız.",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        variant: "destructive",
        title: "Çıkış başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
      })
    }
  }

  // handleNavClick fonksiyonunu güncelleyelim
  const handleNavClick = (nav: string) => {
    setActiveNav(nav)

    // Navigate to the appropriate page
    switch (nav) {
      case "home":
        router.push("/dashboard")
        break
      case "vocabulary":
        router.push("/vocabulary")
        break
      case "grammar":
        router.push("/grammar")
        break
      case "quizzes":
        router.push("/quizzes")
        break
      case "review":
        router.push("/review")
        break
      case "favorites":
        router.push("/favorites")
        break
      case "chatbot":
        router.push("/chatbot")
        break
      case "progress":
        router.push("/progress")
        break
      case "leaderboard":
        router.push("/leaderboard")
        break
      case "profile":
        router.push("/profile")
        break
      default:
        toast({
          title: "Bilgi",
          description: `${nav} sayfasına yönlendiriliyorsunuz...`,
        })
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      text: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsProcessing(true)

    try {
      // Get AI response (mock for now)
      const botResponse = await getMockAIResponse(inputMessage)
      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      // Handle error
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "bot",
        text: "Üzgünüz, AI Chatbot şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])

      toast({
        variant: "destructive",
        title: "Bağlantı hatası",
        description: "AI servisi ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      setIsProcessing(false)
      // Focus back on input
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)

    toast({
      title: "Kopyalandı",
      description: "Düzeltilmiş metin panoya kopyalandı.",
    })

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
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

  const firstName = user?.user_metadata?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Kullanıcı"

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
            <span className="hidden md:inline-block mr-2">Merhaba, {firstName}!</span>
            <Avatar className="h-8 w-8 border-2 border-lilac">
              <AvatarImage src="/placeholder.svg" alt={firstName} />
              <AvatarFallback className="bg-lilac/20 text-lilac">{firstName[0]}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <span className="text-base">🔥</span>
              <span>{streak}</span>
            </Badge>

            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <span className="text-base">💎</span>
              <span>{points}</span>
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
            {[
              { id: "home", icon: Home, label: "Ana Sayfa" },
              { id: "vocabulary", icon: BookOpen, label: "Kelime Çalışma" },
              { id: "grammar", icon: PenTool, label: "Gramer Çalışma" },
              { id: "quizzes", icon: CheckSquare, label: "Quizler" },
              { id: "review", icon: ListChecks, label: "Tekrar Listesi" },
              { id: "favorites", icon: Heart, label: "Favorilerim" },
              { id: "chatbot", icon: MessageSquare, label: "AI Chatbot" },
              { id: "progress", icon: BarChart2, label: "İlerlemem" },
              { id: "leaderboard", icon: Trophy, label: "Puan Tabloları" },
              { id: "profile", icon: User, label: "Profilim" },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeNav === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeNav === item.id ? "bg-lilac/10 text-lilac" : ""
                } ${activeNav === item.id ? "border-l-4 border-lilac" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon
                  className={`h-5 w-5 ${activeNav === item.id ? "text-lilac" : "text-muted-foreground"} mr-2`}
                />
                <span className="hidden md:inline-block">{item.label}</span>
              </Button>
            ))}
          </nav>
        </aside>

        {/* Center Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">AI Chatbot ile Gramer Kontrolü</h1>
              <p className="text-muted-foreground mt-1">
                İngilizce cümlelerinizi yazın, AI chatbot gramer hatalarını düzeltsin
              </p>
            </div>

            {/* Chat Container */}
            <Card className="flex flex-col border-lilac/20 mb-4 max-h-[500px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sohbet</CardTitle>
                <CardDescription>İngilizce cümlelerinizi yazın, AI chatbot gramer hatalarını düzeltsin</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col">
                {/* Messages Container */}
                <div ref={chatContainerRef} className="h-[300px] overflow-y-auto space-y-4 mb-4 p-1">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === "user" ? "bg-lilac text-white" : "bg-muted"
                        }`}
                      >
                        {message.type === "bot" && (
                          <div className="flex items-center mb-1">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="bg-lilac/20 text-lilac text-xs">AI</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">AI Chatbot</span>
                          </div>
                        )}

                        <p className="text-sm">{message.text}</p>

                        {/* Correction and Explanation */}
                        {message.correction && (
                          <div className="mt-2 p-2 bg-background rounded border border-lilac/30">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium text-lilac">Düzeltilmiş hali:</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(message.correction!, message.id)}
                              >
                                {copiedId === message.id ? (
                                  <CheckCheck className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                            <p className="text-sm mt-1">{message.correction}</p>
                          </div>
                        )}

                        {message.explanation && message.explanation.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-lilac">Açıklama:</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                              {message.explanation.map((item, index) => (
                                <li key={index} className="text-sm">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-1 text-right">
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="bg-lilac/20 text-lilac text-xs">AI</AvatarFallback>
                          </Avatar>
                          <div className="flex space-x-1">
                            <div
                              className="h-2 w-2 rounded-full bg-lilac/60 animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="h-2 w-2 rounded-full bg-lilac/60 animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="h-2 w-2 rounded-full bg-lilac/60 animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-input pt-3">
                  <div className="flex gap-2">
                    <Textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Kontrol edilecek İngilizce metni buraya yazın..."
                      className="min-h-[60px] resize-none focus-visible:ring-lilac"
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-lilac hover:bg-lilac/90 text-white self-end"
                      disabled={!inputMessage.trim() || isProcessing}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Gönder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 border-l border-input p-4 overflow-y-auto shrink-0">
          {/* Progress Summary */}
          <Card className="mb-4 border-lilac/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">İlerleme Özeti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bu hafta öğrenilen kelime</span>
                    <span className="font-medium">25/50</span>
                  </div>
                  <Progress value={50} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Gramer doğruluğu</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Tracking */}
          <Card className="mb-4 border-lilac/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Günlük Streak Takibi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-2">
                <div className="text-center">
                  <div className="text-4xl font-bold text-lilac flex items-center justify-center">
                    <span className="mr-2">🔥</span>
                    {streak}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Gün üst üste çalışma</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="mb-4 border-lilac/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kazanılan Rozetler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-lilac/10 flex items-center justify-center text-xl">
                      {badge.icon}
                    </div>
                    <span className="text-xs mt-1 text-center">{badge.name}</span>
                  </div>
                ))}
              </div>
              <Button variant="link" className="text-lilac p-0 h-auto w-full text-center">
                Tüm Rozetleri Gör
              </Button>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="mb-4 border-lilac/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Haftalık Liderlik Tablosu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span
                        className={`w-5 text-sm ${user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-gray-400" : user.rank === 3 ? "text-amber-600" : ""}`}
                      >
                        {user.rank}.
                      </span>
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs bg-lilac/20 text-lilac">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <span className="text-sm font-medium">{user.points}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center">
                  <span className="w-5">{userRank}.</span>
                  <span>Sen</span>
                </div>
                <span className="text-muted-foreground">
                  Sıralaman: {userRank}/{totalUsers}
                </span>
              </div>
              <Button variant="link" className="text-lilac p-0 h-auto w-full text-center mt-1">
                Tam Tabloyu Gör
              </Button>
            </CardContent>
          </Card>

          {/* Daily Goals */}
          <Card className="mb-4 border-lilac/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Günlük Görevler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyGoals.map((goal) => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{goal.icon}</span>
                      <span className="text-sm">{goal.title}</span>
                    </div>
                    <div className="flex items-center">
                      <Progress
                        value={(goal.progress / goal.total) * 100}
                        className="h-2 flex-1 bg-muted"
                        indicatorClassName="bg-lilac"
                      />
                      <span className="text-xs ml-2 text-muted-foreground">
                        {goal.progress} / {goal.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Chatbot Shortcut */}
          <Card className="border-lilac/20">
            <CardContent className="p-4">
              <Button className="w-full bg-lilac hover:bg-lilac/90 text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chatbot ile Pratik Yap
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
