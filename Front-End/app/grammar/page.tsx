import GrammarPracticePage from "@/components/grammar-practice-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gramer Çalışma | eng4all",
  description: "İngilizce gramer kurallarını öğrenin ve pratik yapın",
}

export default function GrammarPage() {
  return <GrammarPracticePage />
}
