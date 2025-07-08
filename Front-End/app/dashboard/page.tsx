import DashboardPage from "@/components/dashboard-page";
// MainDashboard importu ve sarmalayıcısı kaldırıldı
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ana Sayfa - Eng4All",
  description: "Eng4All kullanıcı ana sayfası.",
};

export default function Dashboard() {
  return (
    // <div className="container mx-auto p-4 md:p-6 lg:p-8"> // İsteğe bağlı sarmalayıcı
      <DashboardPage />
    // </div>
  );
}
