"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Volume2, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import { LevelAssessmentTest } from "@/components/level-assessment-test/level-assessment-test"

export function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading, setUser } = useUser()
  const [showLevelTest, setShowLevelTest] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Sample data for the dashboard
  const userData = {
    name: user?.displayName || "Alperen",
    level: user?.level || "B1",
    levelName: "Orta Seviye",
    streak: user?.streak || 15,
    points: user?.points || 1250,
    weeklyProgress: 25,
    hasLevel: !!user?.level,
  }

  const leaderboard = [
    { name: "Ahmet Y.", points: 2450, rank: 1, initial: "A" },
    { name: "Zeynep K.", points: 2320, rank: 2, initial: "Z" },
    { name: "Mehmet A.", points: 2180, rank: 3, initial: "M" },
  ]

  const randomWord = {
    word: "Serendipity",
    type: "noun",
    meaning: "Şans eseri güzel bir şey bulmak",
    example: "Finding this book was pure serendipity.",
    isFavorite: false,
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }
      } catch (error) {
        console.error("Session check error:", error)
      }
    }

    checkUser()
  }, [router])

  const handleLevelTestComplete = (level: string) => {
    setShowLevelTest(false)
    if (setUser && user) {
      setUser({
        ...user,
        level,
        hasCompletedLevelTest: true,
      })
      localStorage.setItem("hasCompletedLevelTest", "true")
    }
    toast({
      title: "Seviye kaydedildi",
      description: `İngilizce seviyeniz ${level} olarak kaydedildi.`,
    })
  }

  const handleFeedbackSubmit = () => {
    // Here you would typically send the feedback to your backend
    console.log("Feedback submitted:", { rating, feedback })

    // Show success message
    setFeedbackSubmitted(true)

    // Reset form after a delay (optional)
    setTimeout(() => {
      setRating(0)
      setFeedback("")
      setFeedbackSubmitted(false)
    }, 5000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
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
        <h1 className="text-2xl font-bold text-foreground">Ana Sayfa</h1>
        <p className="text-muted-foreground mt-1">Dil öğrenme yolculuğunuza hoş geldiniz</p>
      </div>

      {/* Welcome Card */}
      <Card className="border-lilac/20 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-lilac/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-lilac" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Hoş Geldiniz, {userData.name}!</h2>
              {userData.hasLevel ? (
                <div className="flex items-center mt-1">
                  <span className="text-muted-foreground">Seviyeniz: </span>
                  <Badge variant="outline" className="ml-2 bg-lilac/10 text-lilac border-lilac">
                    {userData.level} - {userData.levelName}
                  </Badge>
                </div>
              ) : (
                <p className="text-muted-foreground">Seviyenizi belirlemek için seviye testini yapın.</p>
              )}
            </div>
          </div>

          {!userData.hasLevel && (
            <div className="mt-2">
              <Button className="bg-lilac hover:bg-lilac/90 text-white" onClick={() => setShowLevelTest(true)}>
                Seviye Tespit Sınavına Başla!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Start Action Cards */}
      <h2 className="text-lg font-semibold mb-4">Hızlı Başlangıç</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1 */}
        <Card className="border-lilac/20 hover:border-lilac/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Kelime Pratiğine Başla</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">Günün kelime hedefini tamamla</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-lilac hover:bg-lilac/90 text-white" onClick={() => router.push("/vocabulary")}>
              Başla
            </Button>
          </CardFooter>
        </Card>

        {/* Card 2 */}
        <Card className="border-lilac/20 hover:border-lilac/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gramer Pratiğine Başla</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">Gramer bilgini pekiştir</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-lilac hover:bg-lilac/90 text-white" onClick={() => router.push("/grammar")}>
              Başla
            </Button>
          </CardFooter>
        </Card>

        {/* Card 3 */}
        <Card className="border-lilac/20 hover:border-lilac/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Hızlı Quiz Çöz</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">Bilgini test et</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-lilac hover:bg-lilac/90 text-white" onClick={() => router.push("/quizzes")}>
              Başla
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Random Word of the Day */}
      <h2 className="text-lg font-semibold mb-4">Günün Rastgele Kelimesi</h2>
      <Card className="border-lilac/20 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center text-base">
            <span>{randomWord.word}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-lilac hover:bg-lilac/10">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-lilac hover:bg-lilac/10">
                <Heart className="h-4 w-4" fill={randomWord.isFavorite ? "currentColor" : "none"} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {randomWord.type}
              </Badge>
            </div>
            <p className="text-muted-foreground">{randomWord.meaning}</p>
            <div className="pt-2 border-t">
              <p className="text-sm italic">"{randomWord.example}"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback and Site Rating Section */}
      <h2 className="text-lg font-semibold mb-4">Geri Bildiriminiz</h2>
      <Card className="border-lilac/20 mb-6">
        <CardContent className="p-6">
          {feedbackSubmitted ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-lilac text-xl font-semibold mb-2">Teşekkürler!</div>
              <p className="text-muted-foreground text-center">Geri bildiriminiz için teşekkür ederiz.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Genel Puanınız:</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none focus:ring-0"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? "fill-lilac text-lilac" : "text-muted-foreground"
                        } hover:text-lilac transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium mb-2">
                  Kısa Mesajınız (isteğe bağlı):
                </label>
                <Textarea
                  id="feedback"
                  placeholder="Eklemek istediğiniz bir not var mı?"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="resize-none focus:border-lilac focus:ring-lilac"
                />
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={rating === 0}
                  className="bg-lilac hover:bg-lilac/90 text-white"
                >
                  Gönder
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Level Assessment Test Modal */}
      {showLevelTest && (
        <LevelAssessmentTest
          isFirstTime={true}
          onComplete={handleLevelTestComplete}
          onClose={() => setShowLevelTest(false)}
        />
      )}
    </div>
  )
}

export default DashboardPage
