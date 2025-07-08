import LeaderboardPage from "@/components/leaderboard-page";
// MainDashboard importu ve sarmalayıcısı kaldırıldı
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Puan Tabloları - Eng4All",
  description: "Eng4All kullanıcı puan tabloları ve sıralamalar.",
};

export default function Page() {
  return (
    // <div className="container mx-auto p-4 md:p-6 lg:p-8"> // İsteğe bağlı sarmalayıcı
      <LeaderboardPage />
    // </div>
  );
}
