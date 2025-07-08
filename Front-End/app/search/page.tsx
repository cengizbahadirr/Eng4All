import SearchPageClientComponent from "@/components/search-page";
import type { Metadata } from "next";
// MainDashboard importu ve sarmalayıcısı kaldırıldı, çünkü bu artık app/layout.tsx tarafından sağlanıyor.

export const metadata: Metadata = {
  title: "Arama Yap - Eng4All",
  description: "Eng4All platformunda kelime arayın ve çevirilerini bulun.",
};

export default function SearchPage() {
  return (
    // Sayfa içeriği için isteğe bağlı sarmalayıcı div kalabilir veya doğrudan bileşen render edilebilir.
    // MainDashboard'un içindeki <main> etiketi genellikle padding sağlar.
    // <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <SearchPageClientComponent />
    // </div>
  );
}
