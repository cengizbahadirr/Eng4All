"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eng4AllLogo } from "@/components/eng4all-logo"

interface TestInstructionsProps {
  isFirstTime: boolean
  onStart: () => void
}

export function TestInstructions({ isFirstTime, onStart }: TestInstructionsProps) {
  return (
    <>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Eng4AllLogo />
        </div>
        <CardTitle className="text-2xl">İngilizce Seviye Tespit Sınavı</CardTitle>
        <CardDescription>
          Eng4All deneyimini sana özel hale getirmek için İngilizce seviyeni belirleyelim
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Sınav Hakkında:</h3>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center">
              <span className="mr-2">⏱️</span>
              <span>Tahmini Süre: ~5 dakika</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">📝</span>
              <span>Soru Sayısı: 5 soru</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">📚</span>
              <span>İçerik: Kelime bilgisi ve gramer konularını içeren çoktan seçmeli sorular</span>
            </li>
          </ul>
        </div>

        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 text-sm">
          <p>
            Bu test sonucuna göre sana uygun kelime ve gramer çalışmaları önereceğiz. Seviyeni doğru belirlemek için
            soruları dikkatle yanıtlamanı öneririz.
          </p>
        </div>

        {isFirstTime && (
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p>
              Bu, Eng4All'a başlarken yapacağın tek seferlik bir testtir. Sonrasında ana sayfaya yönlendirileceksin.
              İstediğin zaman profil sayfasından seviye testini tekrar yapabilirsin.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full bg-primary hover:bg-primary/90">
          Sınava Başla
        </Button>
      </CardFooter>
    </>
  )
}
