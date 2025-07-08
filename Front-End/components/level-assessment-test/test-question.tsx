"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: string
}

interface TestQuestionProps {
  question: Question
  totalQuestions: number
  currentQuestion: number
  selectedAnswer?: string
  onAnswer: (questionId: number, answer: string) => void
}

export function TestQuestion({
  question,
  totalQuestions,
  currentQuestion,
  selectedAnswer,
  onAnswer,
}: TestQuestionProps) {
  const [selected, setSelected] = useState<string | undefined>(selectedAnswer)
  const progress = (currentQuestion / totalQuestions) * 100

  const handleSelect = (value: string) => {
    setSelected(value)
  }

  const handleNext = () => {
    if (selected) {
      onAnswer(question.id, selected)
      setSelected(undefined)
    }
  }

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Soru {currentQuestion} / {totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <CardTitle className="text-xl">{question.text}</CardTitle>
        <RadioGroup value={selected} onValueChange={handleSelect} className="space-y-3">
          {question.options.map((option) => (
            <div
              key={option}
              className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors ${
                selected === option ? "border-primary bg-primary/5" : "hover:bg-muted"
              }`}
              onClick={() => handleSelect(option)}
            >
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext} className="w-full bg-primary hover:bg-primary/90" disabled={!selected}>
          {currentQuestion === totalQuestions ? "Testi Tamamla" : "Sonraki Soru"}
        </Button>
      </CardFooter>
    </>
  )
}
