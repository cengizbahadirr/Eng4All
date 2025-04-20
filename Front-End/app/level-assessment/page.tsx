"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LevelAssessmentTest } from "@/components/level-assessment-test/level-assessment-test"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function LevelAssessmentPage() {
  const [showTest, setShowTest] = useState(false)
  const [userLevel, setUserLevel] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleComplete = (level: string) => {
    // Gerçek uygulamada burada API'ye seviyeyi kaydedebilirsiniz
    setUserLevel(level)
    setShowTest(false)

    toast({
      title: "Seviye kaydedildi",
      description: `İngilizce seviyeniz ${level} olarak kaydedildi.`,
    })

    // İlk kez giriş yapan kullanıcılar için ana sayfaya yönlendirme
    // router.push('/dashboard')
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">İngilizce Seviye Testi</h1>

        {userLevel ? (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p>
              Mevcut İngilizce Seviyeniz: <strong>{userLevel}</strong>
            </p>
          </div>
        ) : (
          <p className="mb-6">Henüz bir seviye testi yapmadınız.</p>
        )}

        <Button onClick={() => setShowTest(true)} className="bg-primary hover:bg-primary/90">
          {userLevel ? "Seviye Testini Tekrar Yap" : "Seviye Testini Başlat"}
        </Button>
      </div>

      {showTest && (
        <LevelAssessmentTest isFirstTime={!userLevel} onComplete={handleComplete} onClose={() => setShowTest(false)} />
      )}
    </div>
  )
}
