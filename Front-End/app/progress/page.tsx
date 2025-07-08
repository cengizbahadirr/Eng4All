import ProgressPage from "@/components/progress-page";
// MainDashboard importu ve sarmalayıcısı kaldırıldı
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İlerlemem - Eng4All",
  description: "Eng4All platformundaki öğrenme ilerlemenizi takip edin.",
};

export default function Page() {
  return (
    // <div className="container mx-auto p-4 md:p-6 lg:p-8"> // İsteğe bağlı sarmalayıcı
      <ProgressPage />
    // </div>
  );
}
