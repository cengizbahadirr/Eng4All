"use client"

import { useState } from "react"
import { Award, BookOpen, Calendar, Edit, Settings, Trophy, Clock, Volume2, Heart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { LevelAssessmentTest } from "@/components/level-assessment-test/level-assessment-test"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showLevelTest, setShowLevelTest] = useState(false)
  const { toast } = useToast()
  const { user, setUser } = useUser()

  // Sample user data
  const userData = {
    id: "1",
    name: user?.displayName || "Alperen Yılmaz",
    username: "alperen",
    email: user?.email || "alperen@example.com",
    avatarUrl: "/placeholder.svg?height=128&width=128",
    level: user?.level || "B1",
    points: user?.points || 2540,
    streak: user?.streak || 15,
    joinDate: "Ocak 2023",
    bio: "İngilizce öğrenmeye hevesli bir öğrenci. Teknoloji ve yazılım alanlarına ilgi duyuyorum.",
    achievements: [
      { id: 1, title: "Başlangıç", description: "İlk giriş", icon: "🏆", date: "10 Ocak 2023" },
      { id: 2, title: "Kelime Ustası", description: "100 kelime öğrenildi", icon: "📚", date: "25 Ocak 2023" },
      { id: 3, title: "Quiz Kralı", description: "10 quiz tamamlandı", icon: "🎯", date: "15 Şubat 2023" },
      { id: 4, title: "Düzenli Öğrenci", description: "7 gün arka arkaya çalışma", icon: "🔥", date: "22 Şubat 2023" },
      {
        id: 5,
        title: "Gramer Dehası",
        description: "Tüm temel gramer konuları tamamlandı",
        icon: "📝",
        date: "10 Mart 2023",
      },
    ],
    stats: {
      wordsLearned: 1245,
      quizzesCompleted: 24,
      grammarTopicsCompleted: 18,
      totalStudyTime: "42.5 saat",
      correctAnswerRate: "78%",
    },
  }

  const handleLevelTestComplete = (level: string) => {
    setShowLevelTest(false)

    // Update user level
    if (setUser && user) {
      setUser({
        ...user,
        level,
        hasCompletedLevelTest: true,
      })
    }

    // Save level test completion to localStorage
    localStorage.setItem("hasCompletedLevelTest", "true")
    localStorage.setItem("hasShownLevelTest", "true")

    toast({
      title: "Seviye kaydedildi",
      description: `İngilizce seviyeniz ${level} olarak kaydedildi.`,
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profilim</h1>
        <p className="text-muted-foreground mt-1">Kişisel bilgilerinizi ve istatistiklerinizi görüntüleyin</p>
      </div>

      <Card className="border-lilac/20 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={userData.avatarUrl || "/placeholder.svg?height=128&width=128"} alt={userData.name} />
                <AvatarFallback className="bg-lilac/20 text-lilac">{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full bg-background">
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                <Badge variant="outline" className="w-fit mx-auto md:mx-0 bg-lilac/10 text-lilac border-lilac">
                  {userData.level} Seviye
                </Badge>
              </div>

              <p className="text-muted-foreground mb-4">{userData.bio}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-lilac" />
                  <span className="text-sm">{userData.points} puan</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-lilac" />
                  <span className="text-sm">Üyelik: {userData.joinDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-lilac" />
                  <span className="text-sm">{userData.stats.wordsLearned} kelime</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{userData.streak} günlük seri</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Button className="bg-lilac hover:bg-lilac/90 text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Profili Düzenle
                </Button>
                <Button variant="outline" onClick={() => setShowLevelTest(true)}>
                  <Award className="h-4 w-4 mr-2" />
                  Seviye Testini Yap
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Ayarlar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Başarılar
          </TabsTrigger>
          <TabsTrigger value="statistics" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            İstatistikler
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Favoriler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Öğrenilen Kelimeler</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.stats.wordsLearned}</div>
                <p className="text-xs text-muted-foreground">Hedef: 2000</p>
                <Progress
                  value={(userData.stats.wordsLearned / 2000) * 100}
                  className="h-2 mt-2 bg-muted"
                  indicatorClassName="bg-lilac"
                />
              </CardContent>
            </Card>

            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamamlanan Quizler</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.stats.quizzesCompleted}</div>
                <p className="text-xs text-muted-foreground">Doğruluk oranı: {userData.stats.correctAnswerRate}</p>
              </CardContent>
            </Card>

            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gramer Konuları</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.stats.grammarTopicsCompleted}</div>
                <p className="text-xs text-muted-foreground">Tamamlanan konular</p>
              </CardContent>
            </Card>

            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Çalışma</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.stats.totalStudyTime}</div>
                <p className="text-xs text-muted-foreground">Son 30 günde</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Son Başarılar</CardTitle>
              <CardDescription>En son kazandığınız başarılar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lilac/10 text-lg">
                      {achievement.icon}
                    </div>
                    <div>
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">{achievement.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Tüm Başarılar</CardTitle>
              <CardDescription>Kazandığınız tüm başarılar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lilac/10 text-lg">
                      {achievement.icon}
                    </div>
                    <div>
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">{achievement.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Öğrenme İstatistikleri</CardTitle>
              <CardDescription>Öğrenme yolculuğunuzdaki ilerlemeniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Kelime Öğrenme İlerlemesi</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">A1 Seviyesi</span>
                      <span className="text-sm text-muted-foreground">95%</span>
                    </div>
                    <Progress value={95} className="h-2 bg-muted" indicatorClassName="bg-lilac" />

                    <div className="flex justify-between">
                      <span className="text-sm">A2 Seviyesi</span>
                      <span className="text-sm text-muted-foreground">82%</span>
                    </div>
                    <Progress value={82} className="h-2 bg-muted" indicatorClassName="bg-lilac" />

                    <div className="flex justify-between">
                      <span className="text-sm">B1 Seviyesi</span>
                      <span className="text-sm text-muted-foreground">67%</span>
                    </div>
                    <Progress value={67} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Haftalık Çalışma Saatleri</h3>
                  <div className="h-[150px] flex items-end justify-between">
                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day, i) => (
                      <div key={day} className="flex flex-col items-center gap-2">
                        <div
                          className="bg-lilac/80 w-8 rounded-t-md"
                          style={{ height: `${Math.max(20, Math.random() * 100)}px` }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Favori Kelimelerim</CardTitle>
              <CardDescription>Kaydettiğiniz kelimeler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-3 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium">Serendipity</h3>
                        <Badge variant="outline" className="text-xs">
                          noun
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">Şans eseri güzel bir şey bulmak</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-lilac hover:bg-lilac/10">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-lilac hover:bg-lilac/10">
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Level Assessment Test Modal */}
      {showLevelTest && (
        <LevelAssessmentTest
          isFirstTime={false}
          onComplete={handleLevelTestComplete}
          onClose={() => setShowLevelTest(false)}
        />
      )}
    </div>
  )
}
