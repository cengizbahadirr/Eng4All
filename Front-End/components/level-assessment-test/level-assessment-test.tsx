"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog" // DialogHeader, DialogTitle, DialogDescription eklendi
import { Card } from "@/components/ui/card"
import { TestInstructions } from "./test-instructions"
import { TestQuestion } from "./test-question"
import { TestCompletion } from "./test-completion"
import { LevelResult } from "./level-result"

// Örnek sorular
const questions = [
  {
    id: 1,
    text: "What ___ your name?",
    options: ["are", "is", "am", "be"],
    correctAnswer: "is",
  },
  {
    id: 2,
    text: "She ___ to school every day.",
    options: ["go", "goes", "going", "gone"],
    correctAnswer: "goes",
  },
  {
    id: 3,
    text: "I ___ watching TV right now.",
    options: ["am", "is", "are", "be"],
    correctAnswer: "am",
  },
  {
    id: 4,
    text: "They ___ dinner last night.",
    options: ["have", "had", "having", "has"],
    correctAnswer: "had",
  },
  {
    id: 5,
    text: "We ___ to the cinema tomorrow.",
    options: ["will go", "go", "goes", "going"],
    correctAnswer: "will go",
  },
]

// CEFR seviyeleri ve açıklamaları
const levels = {
  A1: {
    name: "A1 - Başlangıç Seviyesi",
    description: "Günlük hayatta kullanılan basit ifadeleri anlayabilir ve kullanabilirsin.",
  },
  A2: {
    name: "A2 - Temel Seviye",
    description: "Basit ve rutin görevler için iletişim kurabilir, bildiğin konularda bilgi alışverişi yapabilirsin.",
  },
  B1: {
    name: "B1 - Orta Seviye",
    description: "Seyahat, iş ve günlük hayatta karşılaşılan durumlarla başa çıkabilir, deneyimlerini anlatabilirsin.",
  },
  B2: {
    name: "B2 - Orta-Üstü Seviye",
    description: "Teknik tartışmalar dahil kendi uzmanlık alanında akıcı ve spontane iletişim kurabilirsin.",
  },
  C1: {
    name: "C1 - İleri Seviye",
    description: "Karmaşık metinleri anlayabilir, akıcı ve spontane bir şekilde kendinizi ifade edebilirsin.",
  },
  C2: {
    name: "C2 - Ustalık Seviyesi",
    description: "Okuduğun veya duyduğun her şeyi anlayabilir, farklı kaynaklardan bilgileri özetleyebilirsin.",
  },
}

type Step = "instructions" | "questions" | "completion" | "result"

interface LevelAssessmentTestProps {
  isFirstTime?: boolean
  onComplete: (level: string) => void
  onClose?: () => void
}

export function LevelAssessmentTest({ isFirstTime = true, onComplete, onClose }: LevelAssessmentTestProps) {
  const [open, setOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState<Step>("instructions")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<string | null>(null)

  // Dialog kapatıldığında onClose fonksiyonunu çağır
  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open && onClose) {
      onClose()
    }
  }

  // Testi başlat
  const startTest = () => {
    setCurrentStep("questions")
  }

  // Cevabı kaydet ve sonraki soruya geç
  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      setCurrentStep("completion")
      // Sonuçları hesapla (gerçek uygulamada daha karmaşık bir algoritma kullanılabilir)
      setTimeout(() => {
        calculateResult()
      }, 1500)
    }
  }

  // Sonuçları hesapla
  const calculateResult = () => {
    // Basit bir hesaplama: doğru cevapların yüzdesine göre seviye belirle
    const correctAnswers = questions.filter((q) => answers[q.id] === q.correctAnswer).length
    const percentage = (correctAnswers / questions.length) * 100

    let level = "A1"
    if (percentage >= 90) level = "C2"
    else if (percentage >= 80) level = "C1"
    else if (percentage >= 70) level = "B2"
    else if (percentage >= 60) level = "B1"
    else if (percentage >= 50) level = "A2"

    setResult(level)
    setCurrentStep("result")
  }

  // Testi tamamla
  const completeTest = () => {
    if (result) {
      onComplete(result)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 gap-0 border-none">
        {/* Erişilebilirlik için DialogHeader ve DialogTitle eklendi */}
        <DialogHeader className="p-6 pb-0 sr-only"> {/* sr-only ile görsel olarak gizlendi ama ekran okuyucular için erişilebilir */}
          <DialogTitle>Seviye Belirleme Testi</DialogTitle>
          <DialogDescription>
            İngilizce seviyenizi belirlemek için kısa bir test.
          </DialogDescription>
        </DialogHeader>
        <Card className="border-none shadow-none">
          {currentStep === "instructions" && <TestInstructions isFirstTime={isFirstTime} onStart={startTest} />}

          {currentStep === "questions" && (
            <TestQuestion
              question={questions[currentQuestionIndex]}
              totalQuestions={questions.length}
              currentQuestion={currentQuestionIndex + 1}
              onAnswer={handleAnswer}
              selectedAnswer={answers[questions[currentQuestionIndex].id]}
            />
          )}

          {currentStep === "completion" && <TestCompletion />}

          {currentStep === "result" && result && (
            <LevelResult
              level={result}
              levelInfo={levels[result as keyof typeof levels]}
              isFirstTime={isFirstTime}
              onComplete={completeTest}
            />
          )}
        </Card>
      </DialogContent>
    </Dialog>
  )
}
