import ProfilePage from "@/components/profile-page";
// MainDashboard importu ve sarmalayıcısı kaldırıldı
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profilim - Eng4All",
  description: "Eng4All kullanıcı profili ve istatistikleri.",
};

export default function Page() {
  return (
    // <div className="container mx-auto p-4 md:p-6 lg:p-8"> // İsteğe bağlı sarmalayıcı
      <ProfilePage />
    // </div>
  );
}
