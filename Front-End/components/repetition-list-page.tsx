"use client"

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
  Volume2,
  ChevronRight,
  Check,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Eng4AllLogo from "@/components/eng4all-logo"
import { useTheme } from "next-themes"
import { signOut } from "@/actions/auth-actions"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

// Sample repetition list data
const initialRepetitionWords = [
  {
    id: 1,
    word: "Serendipity",
    type: "noun",
    meaning: "Şans eseri güzel bir şey bulmak",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    level: "C1",
    isRepeated: false,
    addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: 2,
    word: "Ambiguous",
    type: "adjective",
    meaning: "Belirsiz, birden fazla anlama gelebilen",
    phonetic: "/æmˈbɪɡ.ju.əs/",
    level: "B2",
    isRepeated: true,
    repeatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 3,
    word: "Procrastinate",
    type: "verb",
    meaning: "Ertelemek, sonraya bırakmak",
    phonetic: "/prəˈkræs.tɪ.neɪt/",
    level: "B1",
    isRepeated: false,
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 4,
    word: "Meticulous",
    type: "adjective",
    meaning: "Titiz, ayrıntılara önem veren",
    phonetic: "/məˈtɪk.jə.ləs/",
    level: "C1",
    isRepeated: true,
    repeatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), // 12 hours ago
    addedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    id: 5,
    word: "Ubiquitous",
    type: "adjective",
    meaning: "Her yerde bulunan, yaygın",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    level: "C1",
    isRepeated: false,
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
]

// Sample vocabulary data for adding words
const sampleVocabulary = [
  {
    id: 101,
    word: "Resilient",
    type: "adjective",
    meaning: "Dayanıklı, çabuk toparlanan",
    phonetic: "/rɪˈzɪl.i.ənt/",
    level: "B2",
  },
  {
    id: 102,
    word: "Itinerary",
    type: "noun",
    meaning: "Seyahat planı, güzergah",
    phonetic: "/aɪˈtɪn.ər.ər.i/",
    level: "B1",
  },
  {
    id: 103,
    word: "Collaborate",
    type: "verb",
    meaning: "İşbirliği yapmak",
    phonetic: "/kəˈlæb.ə.reɪt/",
    level: "B1",
  },
  {
    id: 104,
    word: "Eloquent",
    type: "adjective",
    meaning: "Güzel konuşan, belagatli",
    phonetic: "/ˈel.ə.kwənt/",
    level: "C1",
  },
  {
    id: 105,
    word: "Diligent",
    type: "adjective",
    meaning: "Çalışkan, gayretli",
    phonetic: "/ˈdɪl.ɪ.dʒənt/",
    level: "B2",
  },
]

export default function RepetitionListPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState("review")
  const [userRank, setUserRank] = useState(15)
  const [totalUsers, setTotalUsers] = useState(150)
  const [streak, setStreak] = useState(15)
  const [points, setPoints] = useState(1250)

  // Repetition list state
  const [repetitionWords, setRepetitionWords] = useState(initialRepetitionWords)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<typeof sampleVocabulary>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  useEffect(() => {
    // Set the active navigation item to "review"
    setActiveNav("review")
  }, [])

  useEffect(() => {
    // Clear feedback message after 5 seconds
    if (feedbackMessage && !feedbackTimeoutRef.current) {
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedbackMessage(null)
        feedbackTimeoutRef.current = null
      }, 5000)
    }

    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
        feedbackTimeoutRef.current = null
      }
    }
  }, [feedbackMessage])

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

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim().length > 0) {
      // Filter vocabulary based on search term
      const results = sampleVocabulary.filter(
        (word) =>
          word.word.toLowerCase().includes(term.toLowerCase()) ||
          word.meaning.toLowerCase().includes(term.toLowerCase()),
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleAddWord = (wordId: number) => {
    const wordToAdd = sampleVocabulary.find((word) => word.id === wordId)

    if (!wordToAdd) return

    // Check if word already exists in repetition list
    const wordExists = repetitionWords.some((word) => word.word.toLowerCase() === wordToAdd.word.toLowerCase())

    if (wordExists) {
      setFeedbackMessage({
        type: "error",
        message: `"${wordToAdd.word}" kelimesi zaten tekrar listenizde bulunuyor.`,
      })
      return
    }

    // Add word to repetition list
    const newWord = {
      ...wordToAdd,
      isRepeated: false,
      addedAt: new Date(),
    }

    setRepetitionWords([...repetitionWords, newWord])
    setFeedbackMessage({
      type: "success",
      message: `"${wordToAdd.word}" kelimesi tekrar listenize eklendi.`,
    })

    // Clear search
    setSearchTerm("")
    setSearchResults([])
    setShowAddDialog(false)
  }

  const handleRemoveWord = (wordId: number) => {
    const wordToRemove = repetitionWords.find((word) => word.id === wordId)

    if (!wordToRemove) return

    // Remove word from repetition list
    const updatedWords = repetitionWords.filter((word) => word.id !== wordId)
    setRepetitionWords(updatedWords)

    setFeedbackMessage({
      type: "info",
      message: `"${wordToRemove.word}" kelimesi tekrar listenizden çıkarıldı.`,
    })
  }

  const handleToggleRepeated = (wordId: number) => {
    const updatedWords = repetitionWords.map((word) => {
      if (word.id === wordId) {
        const isRepeated = !word.isRepeated
        return {
          ...word,
          isRepeated,
          repeatedAt: isRepeated ? new Date() : undefined,
        }
      }
      return word
    })

    const word = repetitionWords.find((w) => w.id === wordId)
    const newStatus = !word?.isRepeated

    setRepetitionWords(updatedWords)
    setFeedbackMessage({
      type: "success",
      message: `"${word?.word}" kelimesi ${newStatus ? "tekrar edildi olarak işaretlendi." : "tekrar edilecek olarak işaretlendi."}`,
    })
  }

  const handleAutoGenerate = () => {
    // In a real app, this would call an API to generate a repetition list based on user's learning history
    // For this demo, we'll just add some sample words

    const newWords = sampleVocabulary
      .filter((word) => !repetitionWords.some((w) => w.word === word.word))
      .slice(0, 3)
      .map((word) => ({
        ...word,
        isRepeated: false,
        addedAt: new Date(),
      }))

    if (newWords.length === 0) {
      setFeedbackMessage({
        type: "info",
        message: "Eklenecek yeni kelime bulunamadı.",
      })
      return
    }

    setRepetitionWords([...repetitionWords, ...newWords])
    setFeedbackMessage({
      type: "success",
      message: `${newWords.length} yeni kelime tekrar listenize eklendi.`,
    })
  }

  const handleResetList = () => {
    setRepetitionWords([])
    setFeedbackMessage({
      type: "info",
      message: "Tekrar listeniz sıfırlandı.",
    })
  }

  const playPronunciation = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)

      toast({
        title: "Telaffuz",
        description: `"${word}" kelimesinin telaffuzu oynatılıyor.`,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Tarayıcınız ses sentezlemeyi desteklemiyor.",
      })
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
            <Input placeholder="Kelime ara..." className="pl-8 bg-muted focus:border-lilac focus:ring-lilac" />
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Kelime Tekrar Listem</h1>
              <p className="text-muted-foreground mt-1">Tekrar etmeniz gereken kelimeleri takip edin</p>
            </div>

            {/* List Management Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button className="bg-lilac hover:bg-lilac/90 text-white" onClick={handleAutoGenerate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Otomatik Oluştur / Güncelle
              </Button>

              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-lilac text-lilac hover:bg-lilac/10">
                    <Plus className="h-4 w-4 mr-2" />
                    Manuel Kelime Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tekrar Listesine Kelime Ekle</DialogTitle>
                    <DialogDescription>Tekrar etmek istediğiniz kelimeyi arayın ve ekleyin.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Kelime ara..."
                        className="pl-8 bg-muted focus:border-lilac focus:ring-lilac"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((word) => (
                          <div
                            key={word.id}
                            className="flex items-center justify-between p-3 rounded-md border border-input hover:border-lilac/50 cursor-pointer"
                            onClick={() => handleAddWord(word.id)}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{word.word}</span>
                                <Badge variant="outline" className="text-xs">
                                  {word.level}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{word.meaning}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-lilac">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : searchTerm.trim().length > 0 ? (
                        <div className="text-center p-4 text-muted-foreground">Sonuç bulunamadı</div>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">Kelime aramak için yazın</div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Kapat
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className="border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleResetList}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Listeyi Sıfırla
              </Button>
            </div>

            {/* User Feedback Area */}
            {feedbackMessage && (
              <Alert
                className={`mb-6 ${
                  feedbackMessage.type === "success"
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : feedbackMessage.type === "error"
                      ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                      : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <AlertCircle
                  className={`h-4 w-4 ${
                    feedbackMessage.type === "success"
                      ? "text-green-600 dark:text-green-400"
                      : feedbackMessage.type === "error"
                        ? "text-red-600 dark:text-red-400"
                        : "text-blue-600 dark:text-blue-400"
                  }`}
                />
                <AlertTitle
                  className={`${
                    feedbackMessage.type === "success"
                      ? "text-green-600 dark:text-green-400"
                      : feedbackMessage.type === "error"
                        ? "text-red-600 dark:text-red-400"
                        : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {feedbackMessage.type === "success"
                    ? "Başarılı"
                    : feedbackMessage.type === "error"
                      ? "Hata"
                      : "Bilgi"}
                </AlertTitle>
                <AlertDescription>{feedbackMessage.message}</AlertDescription>
              </Alert>
            )}

            {/* Word List Display Area */}
            <div className="space-y-4">
              {repetitionWords.length > 0 ? (
                repetitionWords.map((word) => (
                  <Card
                    key={word.id}
                    className={`border-lilac/20 hover:border-lilac/40 transition-colors ${
                      word.isRepeated ? "bg-muted/30 dark:bg-muted/10" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`text-xl font-bold ${word.isRepeated ? "text-muted-foreground" : "text-foreground"}`}
                            >
                              {word.word}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {word.level}
                            </Badge>
                            <Badge
                              variant={word.isRepeated ? "secondary" : "lilac"}
                              className={`text-xs ${word.isRepeated ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" : ""}`}
                            >
                              {word.isRepeated ? "Tekrar Edildi" : "Bekliyor"}
                            </Badge>
                          </div>
                          <p className={`${word.isRepeated ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                            {word.meaning}
                          </p>
                          {word.isRepeated && word.repeatedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Son tekrar: {word.repeatedAt.toLocaleDateString("tr-TR")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-lilac hover:text-lilac hover:bg-lilac/10"
                            onClick={() => playPronunciation(word.word)}
                          >
                            <Volume2 className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:text-lilac hover:bg-lilac/10"
                            onClick={() => router.push(`/vocabulary/word/${word.id}`)}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-full ${
                              word.isRepeated
                                ? "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20"
                                : "text-muted-foreground hover:text-lilac hover:bg-lilac/10"
                            }`}
                            onClick={() => handleToggleRepeated(word.id)}
                          >
                            <Check className={`h-5 w-5 ${word.isRepeated ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                            onClick={() => handleRemoveWord(word.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-10 bg-muted/20 rounded-lg border border-input text-center">
                  <ListChecks className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Tekrar listeniz boş</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    'Otomatik Oluştur' ile sistemin önermesini sağlayabilir veya 'Manuel Kelime Ekle' ile kendiniz
                    kelime ekleyebilirsiniz.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button className="bg-lilac hover:bg-lilac/90 text-white" onClick={handleAutoGenerate}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Otomatik Oluştur
                    </Button>
                    <Button
                      variant="outline"
                      className="border-lilac text-lilac hover:bg-lilac/10"
                      onClick={() => setShowAddDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Manuel Kelime Ekle
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
                    <span>Tekrar edilen kelimeler</span>
                    <span className="font-medium">
                      {repetitionWords.filter((word) => word.isRepeated).length}/{repetitionWords.length}
                    </span>
                  </div>
                  <Progress
                    value={
                      repetitionWords.length > 0
                        ? (repetitionWords.filter((word) => word.isRepeated).length / repetitionWords.length) * 100
                        : 0
                    }
                    className="h-2 bg-muted"
                    indicatorClassName="bg-lilac"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Haftalık tekrar hedefi</span>
                    <span className="font-medium">15/30</span>
                  </div>
                  <Progress value={50} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
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
        </aside>
      </div>
    </div>
  )
}
