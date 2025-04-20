import LeaderboardPage from "@/components/leaderboard-page"
import MainDashboard from "@/components/main-dashboard"

export default function Page() {
  return (
    <MainDashboard initialActiveNav="/leaderboard">
      <LeaderboardPage />
    </MainDashboard>
  )
}
