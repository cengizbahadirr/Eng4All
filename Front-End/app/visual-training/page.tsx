import MainDashboard from "@/components/main-dashboard"
import { VisualTrainingPage } from "@/components/visual-training-page"

export default function VisualTraining() {
  return (
    <MainDashboard initialActiveNav="/visual-training">
      <VisualTrainingPage />
    </MainDashboard>
  )
}
