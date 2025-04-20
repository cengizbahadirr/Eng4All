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
  CheckCircle2,
  FileText,
  SplitSquareHorizontal,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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

// Quiz types
const quizTypes = [
  {
    id: "multiple-choice",
    title: "Çoktan Seçmeli",
    description: "Verilen soruya doğru cevabı seçin",
    icon: CheckCircle2,
  },
  {
    id: "fill-in-blanks",
    title: "Boşluk Doldurma",
    description: "Cümledeki boşluğa uygun kelimeyi yazın",
    icon: FileText,
  },
  {
    id: "matching",
    title: "Eşleştirme",
    description: "Kelimeleri anlamlarıyla eşleştirin",
    icon: SplitSquareHorizontal,
  },
]

// Quiz topics
const quizTopics = {
  vocabulary: [
    {
      id: "vocab-level",
      title: "Seviyeme Uygun Kelimeler (B1)",
      description: "Seviyenize uygun kelimelerden oluşan quiz",
    },
    {
      id: "vocab-favorites",
      title: "Favori Kelimelerim",
      description: "Favorilerinize eklediğiniz kelimelerden oluşan quiz",
    },
    {
      id: "vocab-business",
      title: "İş İngilizcesi Kelimeleri",
      description: "İş hayatında kullanılan kelimelerden oluşan quiz",
    },
    {
      id: "vocab-recent",
      title: "Son Öğrendiğim Kelimeler",
      description: "Son zamanlarda öğrendiğiniz kelimelerden oluşan quiz",
    },
  ],
  grammar: [
    {
      id: "grammar-level",
      title: "Seviyeme Uygun Gramer (B1)",
      description: "Seviyenize uygun gramer konularından oluşan quiz",
    },
    { id: "grammar-tenses", title: "Zamanlar", description: "İngilizce zaman yapılarıyla ilgili quiz" },
    { id: "grammar-conditionals", title: "Koşul Cümleleri", description: "Koşul cümleleriyle ilgili quiz" },
    { id: "grammar-modals", title: "Modal Fiiller", description: "Modal fiillerle ilgili quiz" },
  ],
  mixed: [
    {
      id: "mixed-general",
      title: "Genel Tekrar Quizi (B1)",
      description: "Kelime ve gramer karışık genel tekrar quizi",
    },
    {
      id: "mixed-daily",
      title: "Günlük Pratik Quizi",
      description: "Günlük pratik için karışık sorulardan oluşan quiz",
    },
  ],
}

// Question counts
const questionCounts = [
  { id: "10", count: 10, time: "~5 dakika" },
  { id: "20", count: 20, time: "~10 dakika" },
  { id: "30", count: 30, time: "~15 dakika" },
]

export default function QuizzesPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState("quizzes")
  const [userRank, setUserRank] = useState(15)
  const [totalUsers, setTotalUsers] = useState(150)
  const [streak, setStreak] = useState(15)
  const [points, setPoints] = useState(1250)

  // Quiz selection state
  const [selectedQuizType, setSelectedQuizType] = useState<string | null>(null)
  const [selectedTopicCategory, setSelectedTopicCategory] = useState<"vocabulary" | "grammar" | "mixed">("vocabulary")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<string | null>(null)

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
    // Set the active navigation item to "quizzes"
    setActiveNav("quizzes")
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

  const handleStartQuiz = () => {
    // Get the selected quiz details
    const quizType = quizTypes.find((type) => type.id === selectedQuizType)
    const topicCategory = selectedTopicCategory
    const topic = quizTopics[selectedTopicCategory].find((topic) => topic.id === selectedTopic)
    const questionCount = questionCounts.find((count) => count.id === selectedQuestionCount)

    toast({
      title: "Quiz Başlatılıyor",
      description: `${quizType?.title} - ${topic?.title} - ${questionCount?.count} Soru`,
    })

    // In a real app, you would navigate to the quiz page with the selected options
    // router.push(`/quiz?type=${selectedQuizType}&topic=${selectedTopic}&count=${selectedQuestionCount}`)
  }

  const isQuizSelectionComplete = () => {
    return selectedQuizType && selectedTopic && selectedQuestionCount
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
            <Input placeholder="Quiz veya konu ara..." className="pl-8 bg-muted focus:border-lilac focus:ring-lilac" />
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
              <h1 className="text-2xl font-bold text-foreground">Quiz Seçimi</h1>
              <p className="text-muted-foreground mt-1">Bilgilerinizi test etmek için bir quiz seçin</p>
            </div>

            {/* Quiz Selection Sections */}
            <div className="space-y-8">
              {/* Section 1: Quiz Type Selection */}
              <Card className="border-lilac/20">
                <CardHeader>
                  <CardTitle className="text-lg">1. Quiz Türünü Seç</CardTitle>
                  <CardDescription>Hangi formatta quiz çözmek istediğinizi seçin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quizTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors hover:border-lilac/50 ${
                          selectedQuizType === type.id
                            ? "border-lilac bg-lilac/10 dark:bg-lilac/20"
                            : "border-input bg-card"
                        }`}
                        onClick={() => setSelectedQuizType(type.id)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`mb-3 rounded-full p-2 ${
                              selectedQuizType === type.id ? "bg-lilac/20 text-lilac" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <type.icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-medium">{type.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Quiz Topic Selection */}
              <Card className="border-lilac/20">
                <CardHeader>
                  <CardTitle className="text-lg">2. Quiz Konusunu Seç</CardTitle>
                  <CardDescription>Hangi konuda kendinizi test etmek istediğinizi seçin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Topic Category Tabs */}
                    <div className="flex border-b border-input">
                      <button
                        className={`px-4 py-2 font-medium text-sm ${
                          selectedTopicCategory === "vocabulary"
                            ? "border-b-2 border-lilac text-lilac"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => {
                          setSelectedTopicCategory("vocabulary")
                          setSelectedTopic(null)
                        }}
                      >
                        Kelime Bazlı
                      </button>
                      <button
                        className={`px-4 py-2 font-medium text-sm ${
                          selectedTopicCategory === "grammar"
                            ? "border-b-2 border-lilac text-lilac"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => {
                          setSelectedTopicCategory("grammar")
                          setSelectedTopic(null)
                        }}
                      >
                        Gramer Bazlı
                      </button>
                      <button
                        className={`px-4 py-2 font-medium text-sm ${
                          selectedTopicCategory === "mixed"
                            ? "border-b-2 border-lilac text-lilac"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => {
                          setSelectedTopicCategory("mixed")
                          setSelectedTopic(null)
                        }}
                      >
                        Karışık
                      </button>
                    </div>

                    {/* Topic Options */}
                    <RadioGroup value={selectedTopic || ""} onValueChange={setSelectedTopic}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizTopics[selectedTopicCategory].map((topic) => (
                          <div
                            key={topic.id}
                            className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer ${
                              selectedTopic === topic.id ? "border-lilac bg-lilac/10 dark:bg-lilac/20" : "border-input"
                            }`}
                            onClick={() => setSelectedTopic(topic.id)}
                          >
                            <RadioGroupItem value={topic.id} id={topic.id} className="mt-1" />
                            <Label htmlFor={topic.id} className="flex-1 cursor-pointer">
                              <div>
                                <h3 className="font-medium">{topic.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Question Count Selection */}
              <Card className="border-lilac/20">
                <CardHeader>
                  <CardTitle className="text-lg">3. Soru Sayısını Belirle</CardTitle>
                  <CardDescription>Quizde kaç soru olmasını istediğinizi seçin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {questionCounts.map((option) => (
                      <div
                        key={option.id}
                        className={`cursor-pointer rounded-lg border p-4 min-w-[120px] text-center transition-colors hover:border-lilac/50 ${
                          selectedQuestionCount === option.id
                            ? "border-lilac bg-lilac/10 dark:bg-lilac/20"
                            : "border-input bg-card"
                        }`}
                        onClick={() => setSelectedQuestionCount(option.id)}
                      >
                        <h3 className="font-medium text-lg">{option.count} Soru</h3>
                        <p className="text-sm text-muted-foreground mt-1">{option.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Summary and Start Button */}
              <Card className="border-lilac/20">
                <CardHeader>
                  <CardTitle className="text-lg">Quiz Özeti</CardTitle>
                </CardHeader>
                <CardContent>
                  {isQuizSelectionComplete() ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-muted/30 rounded-md">
                          <p className="text-sm text-muted-foreground">Quiz Türü</p>
                          <p className="font-medium">{quizTypes.find((type) => type.id === selectedQuizType)?.title}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-md">
                          <p className="text-sm text-muted-foreground">Quiz Konusu</p>
                          <p className="font-medium">
                            {quizTopics[selectedTopicCategory].find((topic) => topic.id === selectedTopic)?.title}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-md">
                          <p className="text-sm text-muted-foreground">Soru Sayısı</p>
                          <p className="font-medium">
                            {questionCounts.find((count) => count.id === selectedQuestionCount)?.count} Soru
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 bg-muted/20 rounded-lg border border-input">
                      <div className="text-center">
                        <Info className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-muted-foreground">Quiz başlatmak için lütfen tüm seçimleri tamamlayın.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-lilac hover:bg-lilac/90 text-white py-6 text-lg"
                    disabled={!isQuizSelectionComplete()}
                    onClick={handleStartQuiz}
                  >
                    Quizi Başlat
                  </Button>
                </CardFooter>
              </Card>
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
                    <span>Tamamlanan quizler</span>
                    <span className="font-medium">12/20</span>
                  </div>
                  <Progress value={60} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Ortalama başarı oranı</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
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
