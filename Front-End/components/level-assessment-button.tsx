"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { LevelAssessmentTest } from "@/components/level-assessment-test/level-assessment-test"
import { useToast } from "@/hooks/use-toast"

interface LevelAssessmentButtonProps extends ButtonProps {
  isFirstTime?: boolean
  onLevelChange?: (level: string) => void
}

export function LevelAssessmentButton({
  isFirstTime = false,
  onLevelChange,
  children = "Seviye Testi",
  ...props
}: LevelAssessmentButtonProps) {
  const [showTest, setShowTest] = useState(false)
  const { toast } = useToast()

  const handleComplete = (level: string) => {
    setShowTest(false)

    if (onLevelChange) {
      onLevelChange(level)
    }

    toast({
      title: "Seviye kaydedildi",
      description: `İngilizce seviyeniz ${level} olarak kaydedildi.`,
    })
  }

  return (
    <>
      <Button onClick={() => setShowTest(true)} {...props}>
        {children}
      </Button>

      {showTest && (
        <LevelAssessmentTest isFirstTime={isFirstTime} onComplete={handleComplete} onClose={() => setShowTest(false)} />
      )}
    </>
  )
}
