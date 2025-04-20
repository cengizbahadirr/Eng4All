"use client"

import { useState, useEffect } from "react"

// Günlük kelime tipi tanımı
interface DailyWord {
  id: string
  word: string
  type: string
  meaning: string
  example: string
  pronunciation?: string
}

export function useDailyWord() {
  const [dailyWord, setDailyWord] = useState<DailyWord>({
    id: "",
    word: "",
    type: "",
    meaning: "",
    example: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Gerçek uygulamada, burada bir API çağrısı yapılacaktır
    // Şimdilik sahte bir kelime verisi döndürelim
    const fetchDailyWord = async () => {
      try {
        // Sahte bir API çağrısı simüle ediyoruz
        await new Promise((resolve) => setTimeout(resolve, 700))

        // Sahte günlük kelime verisi
        const mockDailyWord: DailyWord = {
          id: "1",
          word: "Serendipity",
          type: "isim",
          meaning: "Tesadüfen güzel bir şey keşfetme yeteneği",
          example: "The discovery of penicillin was a serendipity.",
          pronunciation: "/ˌserənˈdɪpɪti/",
        }

        setDailyWord(mockDailyWord)
      } catch (error) {
        console.error("Günlük kelime alınamadı:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailyWord()
  }, [])

  return { dailyWord, isLoading }
}
