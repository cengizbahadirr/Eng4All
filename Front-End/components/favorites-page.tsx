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
  SortAsc,
  SortDesc,
  Clock,
  ListPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

// Sample favorite words data
const initialFavoriteWords = [
  {
    id: 1,
    word: "Serendipity",
    type: "noun",
    meaning: "Şans eseri güzel bir şey bulmak",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    level: "C1",
    addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: 2,
    word: "Ambiguous",
    type: "adjective",
    meaning: "Belirsiz, birden fazla anlama gelebilen",
    phonetic: "/æmˈbɪɡ.ju.əs/",
    level: "B2",
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 3,
    word: "Procrastinate",
    type: "verb",
    meaning: "Ertelemek, sonraya bırakmak",
    phonetic: "/prəˈkræs.tɪ.neɪt/",
    level: "B1",
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 4,
    word: "Meticulous",
    type: "adjective",
    meaning: "Titiz, ayrıntılara önem veren",
    phonetic: "/məˈtɪk.jə.ləs/",
    level: "C1",
    addedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    id: 5,
    word: "Ubiquitous",
    type: "adjective",
    meaning: "Her yerde bulunan, yaygın",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    level: "C1",
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 6,
    word: "Eloquent",
    type: "adjective",
    meaning: "Güzel konuşan, belagatli",
    phonetic: "/ˈel.ə.kwənt/",
    level: "C1",
    addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: 7,
    word: "Diligent",
    type: "adjective",
    meaning: "Çalışkan, gayretli",
    phonetic: "/ˈdɪl.ɪ.dʒənt/",
    level: "B2",
    addedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
]

type SortOption = "alphabetical-asc" | "alphabetical-desc" | "date-added"

export default function FavoritesPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState("favorites")
  const [userRank, setUserRank] = useState(15)
  const [totalUsers, setTotalUsers] = useState(150)
  const [streak, setStreak] = useState(15)
  const [points, setPoints] = useState(1250)

  // Favorites list state
  const [favoriteWords, setFavoriteWords] = useState(initialFavoriteWords)
  const [filteredWords, setFilteredWords] = useState(initialFavoriteWords)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("alphabetical-asc")

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
    // Set the active navigation item to "favorites"
    setActiveNav("favorites")
  }, [])

  useEffect(() => {
    // Filter and sort words based on search term and sort option
    let result = [...favoriteWords]

    // Apply search filter
    if (searchTerm.trim()) {
      result = result.filter(
        (word) =>
          word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          word.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply sorting
    switch (sortOption) {
      case "alphabetical-asc":
        result.sort((a, b) => a.word.localeCompare(b.word))
        break
      case "alphabetical-desc":
        result.sort((a, b) => b.word.localeCompare(a.word))
        break
      case "date-added":
        result.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
        break
    }

    setFilteredWords(result)
  }, [favoriteWords, searchTerm, sortOption])

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

  const handleRemoveFavorite = (wordId: number) => {
    const wordToRemove = favoriteWords.find((word) => word.id === wordId)

    if (!wordToRemove) return

    // Remove word from favorites
    const updatedWords = favoriteWords.filter((word) => word.id !== wordId)
    setFavoriteWords(updatedWords)

    toast({
      title: "Favorilerden çıkarıldı",
      description: `"${wordToRemove.word}" kelimesi favorilerinizden çıkarıldı.`,
    })
  }

  const handleCreateQuiz = () => {
    toast({
      title: "Quiz oluşturuluyor",
      description: "Favori kelimelerinizle bir quiz oluşturuluyor...",
    })
    // In a real app, this would navigate to the quiz page with the favorite words
    // router.push("/quizzes/create?source=favorites")
  }

  const handleAddToRepetitionList = () => {
    toast({
      title: "Tekrar listesine ekleniyor",
      description: "Favori kelimeleriniz tekrar listenize ekleniyor...",
    })
    // In a real app, this would add the favorite words to the repetition list
    // and then navigate to the repetition list page
    // router.push("/review")
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
              <h1 className="text-2xl font-bold text-foreground">Favori Kelimelerim</h1>
              <p className="text-muted-foreground mt-1">Kaydettiğiniz favori kelimelerinizi görüntüleyin ve yönetin</p>
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Favorilerde ara..."
                  className="pl-8 bg-muted focus:border-lilac focus:ring-lilac"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[140px]">
                    {sortOption === "alphabetical-asc" ? (
                      <>
                        <SortAsc className="h-4 w-4 mr-2" />
                        A-Z Sırala
                      </>
                    ) : sortOption === "alphabetical-desc" ? (
                      <>
                        <SortDesc className="h-4 w-4 mr-2" />
                        Z-A Sırala
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Eklenme Tarihi
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOption("alphabetical-asc")}>
                    <SortAsc className="h-4 w-4 mr-2" />
                    A-Z Sırala
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("alphabetical-desc")}>
                    <SortDesc className="h-4 w-4 mr-2" />
                    Z-A Sırala
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("date-added")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Eklenme Tarihi
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Action Buttons */}
            {favoriteWords.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                <Button className="bg-lilac hover:bg-lilac/90 text-white" onClick={handleCreateQuiz}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Favorilerimle Quiz Oluştur
                </Button>

                <Button
                  variant="outline"
                  className="border-lilac text-lilac hover:bg-lilac/10"
                  onClick={handleAddToRepetitionList}
                >
                  <ListPlus className="h-4 w-4 mr-2" />
                  Tekrar Listesine Aktar
                </Button>
              </div>
            )}

            {/* Favorites List Display Area */}
            <div className="space-y-4">
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => (
                  <Card key={word.id} className="border-lilac/20 hover:border-lilac/40 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-foreground">{word.word}</h3>
                            <Badge variant="outline" className="text-xs">
                              {word.level}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{word.meaning}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Eklenme: {word.addedAt.toLocaleDateString("tr-TR")}
                          </p>
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
                            className="rounded-full text-lilac hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                            onClick={() => handleRemoveFavorite(word.id)}
                          >
                            <Heart className="h-5 w-5 fill-lilac" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-10 bg-muted/20 rounded-lg border border-input text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm ? "Aramanızla eşleşen kelime bulunamadı" : "Favori listeniz boş"}
                  </h3>
                  {!searchTerm && (
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Kelime detayları sayfasındaki veya rastgele kelime bölümündeki kalp ❤️ ikonunu kullanarak
                      kelimeleri favorilerinize ekleyebilirsiniz.
                    </p>
                  )}
                  {searchTerm && (
                    <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                      Aramayı Temizle
                    </Button>
                  )}
                  {!searchTerm && (
                    <Button
                      className="bg-lilac hover:bg-lilac/90 text-white"
                      onClick={() => router.push("/vocabulary")}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Kelime Çalışmaya Git
                    </Button>
                  )}
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
                    <span>Favori kelimeler</span>
                    <span className="font-medium">{favoriteWords.length}</span>
                  </div>
                  <Progress
                    value={favoriteWords.length > 0 ? Math.min(100, (favoriteWords.length / 20) * 100) : 0}
                    className="h-2 bg-muted"
                    indicatorClassName="bg-lilac"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Öğrenilen kelimeler</span>
                    <span className="font-medium">85/100</span>
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
