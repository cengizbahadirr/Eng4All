"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface LevelInfo {
  name: string
  description: string
}

interface LevelResultProps {
  level: string
  levelInfo: LevelInfo
  isFirstTime: boolean
  onComplete: () => void
}

export function LevelResult({ level, levelInfo, isFirstTime, onComplete }: LevelResultProps) {
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle>Seviye Tespit Sonucun</CardTitle>
        <CardDescription>İngilizce seviyeni belirledik</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full border-8 border-primary/30"></div>
          <div
            className="absolute w-36 h-36 rounded-full border-8 border-transparent border-t-primary"
            style={{ transform: "rotate(45deg)" }}
          ></div>
          <div className="z-10 text-4xl font-bold">{level}</div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{levelInfo.name}</h3>
          <p className="text-muted-foreground">{levelInfo.description}</p>
        </div>

        <div className="bg-muted p-4 rounded-lg text-sm w-full">
          <p>Mevcut seviyeni bu sonuca göre güncellemek istersen profil ayarlarından değişiklik yapabilirsin.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onComplete} className="w-full bg-primary hover:bg-primary/90">
          {isFirstTime ? "Ana Sayfaya Git" : "Tamam"}
        </Button>
      </CardFooter>
    </>
  )
}
