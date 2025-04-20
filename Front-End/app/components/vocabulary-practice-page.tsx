"use client"

import { useState, useEffect } from "react"
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
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Eng4AllLogo from "@/components/eng4all-logo"
import { useTheme } from "next-themes"
import { signOut } from "@/actions/auth-actions"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

// Sample vocabulary data
const vocabularyWords = [
  {
    id: 1,
    word: "Serendipity",
    type: "noun",
    meaning: "Şans eseri güzel bir şey bulmak",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    level: "C1",
    category: "Genel",
    examples: ["Finding that rare book was pure serendipity.", "Their meeting was a case of serendipity."],
    isFavorite: false,
  },
  {
    id: 2,
    word: "Ambiguous",
    type: "adjective",
    meaning: "Belirsiz, birden fazla anlama gelebilen",
    phonetic: "/æmˈbɪɡ.ju.əs/",
    level: "B2",
    category: "Akademik",
    examples: [
      "The instructions were ambiguous and confusing.",
      "His response was ambiguous, leaving us uncertain about his intentions.",
    ],
    isFavorite: true,
  },
  {
    id: 3,
    word: "Procrastinate",
    type: "verb",
    meaning: "Ertelemek, sonraya bırakmak",
    phonetic: "/prəˈkræs.tɪ.neɪt/",
    level: "B1",
    category: "Genel",
    examples: [
      "I always procrastinate when it comes to doing my taxes.",
      "Stop procrastinating and start working on your assignment.",
    ],
    isFavorite: false,
  },
  {
    id: 4,
    word: "Meticulous",
    type: "adjective",
    meaning: "Titiz, ayrıntılara önem veren",
    phonetic: "/məˈtɪk.jə.ləs/",
    level: "C1",
    category: "İş Hayatı",
    examples: ["She is meticulous about keeping records.", "His meticulous attention to detail impressed the clients."],
    isFavorite: false,
  },
  {
    id: 5,
    word: "Ubiquitous",
    type: "adjective",
    meaning: "Her yerde bulunan, yaygın",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    level: "C1",
    category: "Akademik",
    examples: ["Smartphones have become ubiquitous in modern society.", "Coffee shops are ubiquitous in this city."],
    isFavorite: true,
  },
  {
    id: 6,
    word: "Resilient",
    type: "adjective",
    meaning: "Dayanıklı, çabuk toparlanan",
    phonetic: "/rɪˈzɪl.i.ənt/",
    level: "B2",
    category: "Genel",
    examples: ["Children are often more resilient than adults.", "The economy proved resilient despite the crisis."],
    isFavorite: false,
  },
  {
    id: 7,
    word: "Itinerary",
    type: "noun",
    meaning: "Seyahat planı, güzergah",
    phonetic: "/aɪˈtɪn.ər.ər.i/",
    level: "B1",
    category: "Seyahat",
    examples: [
      "We need to finalize our itinerary before booking hotels.",
      "The travel agent prepared a detailed itinerary for our trip.",
    ],
    isFavorite: false,
  },
  {
    id: 8,
    word: "Collaborate",
    type: "verb",
    meaning: "İşbirliği yapmak",
    phonetic: "/kəˈlæb.ə.reɪt/",
    level: "B1",
    category: "İş Hayatı",
    examples: [
      "The two companies collaborated on the project.",
      "We need to collaborate more effectively to meet the deadline.",
    ],
    isFavorite: true,
  },
]

export default function VocabularyPracticePage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState("vocabulary")
  const [userRank, setUserRank] = useState(15)
  const [totalUsers, setTotalUsers] = useState(150)
  const [streak, setStreak] = useState(15)
  const [points, setPoints] = useState(1250)
  const [level, setLevel] = useState("B1")
  const [category, setCategory] = useState("Tümü")
  const [expandedWordId, setExpandedWordId] = useState<number | null>(null)
  const [words, setWords] = useState(vocabularyWords)
  const [filteredWords, setFilteredWords] = useState(vocabularyWords)

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
    // Set the active navigation item to "vocabulary"
    setActiveNav("vocabulary")
  }, [])

  useEffect(() => {
    // Filter words based on selected level and category
    let filtered = [...words]

    if (level !== "Tümü") {
      filtered = filtered.filter((word) => word.level === level)
    }

    if (category !== "Tümü") {
      filtered = filtered.filter((word) => word.category === category)
    }

    setFilteredWords(filtered)
  }, [level, category, words])

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

  const toggleFavorite = (id: number) => {
    setWords(words.map((word) => (word.id === id ? { ...word, isFavorite: !word.isFavorite } : word)))

    toast({
      title: words.find((w) => w.id === id)?.isFavorite ? "Favorilerden çıkarıldı" : "Favorilere eklendi",
      description: `"${words.find((w) => w.id === id)?.word}" ${
        words.find((w) => w.id === id)?.isFavorite ? "favorilerden çıkarıldı." : "favorilere eklendi."
      }`,
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

  const toggleWordDetails = (id: number) => {
    setExpandedWordId(expandedWordId === id ? null : id)
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Kelime Çalışma Alanı</h1>
              <p className="text-muted-foreground mt-1">
                Seviyenize uygun kelimelerle İngilizce kelime dağarcığınızı geliştirin
              </p>
            </div>

            {/* Filtering Options */}
            <div className="mb-6 space-y-4">
              {/* Level Tabs */}
              <div>
                <h2 className="text-sm font-medium mb-2 text-muted-foreground">Seviye</h2>
                <Tabs defaultValue={level} onValueChange={setLevel} className="w-full">
                  <TabsList className="w-full justify-start bg-muted/50 p-1">
                    <TabsTrigger value="Tümü" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                      Tümü
                    </TabsTrigger>
                    <TabsTrigger value="A1" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                      A1
                    </TabsTrigger>
                    <TabsTrigger value="A2" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                      A2
                    </TabsTrigger>
                    <TabsTrigger value="B1" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                      B1
                    </TabsTrigger>
                    <TabsTrigger value="B2" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                      B2
                    </TabsTrigger>
                    <TabsTrigger value="C1" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                      C1
                    </TabsTrigger>
                    <TabsTrigger value="C2" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                      C2
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">Kategori</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>{category}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {["Tümü", "Genel", "İş Hayatı", "Akademik", "Seyahat"].map((cat) => (
                      <DropdownMenuItem
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={category === cat ? "bg-lilac/10 text-lilac font-medium" : ""}
                      >
                        {cat}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Practice Call-to-Action */}
            <Button className="w-full mb-6 bg-lilac hover:bg-lilac/90 text-white py-6 text-lg">
              Bu Liste ile Pratik Yap
            </Button>

            {/* Word List */}
            <div className="space-y-4 mb-8">
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => (
                  <Card
                    key={word.id}
                    className={`border-lilac/20 hover:border-lilac/40 transition-colors ${expandedWordId === word.id ? "border-lilac" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-foreground">{word.word}</h3>
                            <Badge variant="outline" className="text-xs">
                              {word.level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {word.category}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{word.meaning}</p>
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
                            className={`rounded-full ${word.isFavorite ? "text-lilac" : "text-muted-foreground"} hover:text-lilac hover:bg-lilac/10`}
                            onClick={() => toggleFavorite(word.id)}
                          >
                            <Heart className={`h-5 w-5 ${word.isFavorite ? "fill-lilac" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:text-lilac hover:bg-lilac/10"
                            onClick={() => toggleWordDetails(word.id)}
                          >
                            <ChevronRight
                              className={`h-5 w-5 transition-transform ${expandedWordId === word.id ? "rotate-90" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedWordId === word.id && (
                        <div className="mt-4 pt-4 border-t border-input">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-muted-foreground">{word.type}</span>
                            <span className="text-sm text-muted-foreground">{word.phonetic}</span>
                          </div>
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Anlamlar</h4>
                            <p>{word.meaning}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Örnek Cümleler</h4>
                            <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                              {word.examples.map((example, idx) => (
                                <li key={idx} className="text-sm">
                                  {example}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-lg border border-input">
                  <p className="text-muted-foreground">Seçilen kriterlere uygun kelime bulunamadı.</p>
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
                    <span>Bu hafta öğrenilen kelime</span>
                    <span className="font-medium">25/50</span>
                  </div>
                  <Progress value={50} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Kelime doğruluğu</span>
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
        </aside>
      </div>
    </div>
  )
}
