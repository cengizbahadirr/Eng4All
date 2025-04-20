import { MainDashboard } from "@/components/main-dashboard"
import DashboardPage from "@/components/dashboard-page"

export default function Dashboard() {
  return (
    <MainDashboard initialActiveNav="/dashboard">
      <DashboardPage />
    </MainDashboard>
  )
}
