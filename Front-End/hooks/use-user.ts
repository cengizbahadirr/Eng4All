"use client"

import { useState, useEffect } from "react"

export interface User {
  id: string
  email: string
  displayName: string
  level?: string
  avatarUrl?: string
  points?: number
  streak?: number
  joinDate?: string
  hasCompletedLevelTest: boolean
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        // Kullanıcı bilgilerini yükle
        // ...
        setTimeout(() => {
          const newUser = {
            id: "1",
            email: "user@example.com",
            displayName: "Kullanıcı",
            level: "A2",
            points: 1250,
            streak: 7,
            joinDate: "Nisan 2023",
            hasCompletedLevelTest: false, // Yeni kullanıcılar için false
          }

          // Eğer kullanıcı varsa, localStorage'dan seviye testi durumunu kontrol et
          const hasCompletedLevelTest = localStorage.getItem("hasCompletedLevelTest") === "true"

          setUser({
            ...newUser,
            hasCompletedLevelTest,
          })

          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Kullanıcı yüklenirken hata:", error)
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return { user, setUser, loading }
}
