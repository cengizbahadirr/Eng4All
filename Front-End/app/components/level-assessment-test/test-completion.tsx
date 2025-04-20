"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TestCompletion() {
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle>Sınavı tamamladın!</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
        </div>
        <p className="text-center text-muted-foreground">Sonuçların hesaplanıyor...</p>
      </CardContent>
    </>
  )
}
