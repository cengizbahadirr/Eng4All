import VocabularyPracticePage from "@/components/vocabulary-practice-page";
// MainDashboard importu ve sarmalayıcısı kaldırıldı, çünkü bu artık app/layout.tsx tarafından sağlanıyor.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelime Pratiği - Eng4All",
  description: "Eng4All platformunda kelime pratiği yapın.",
};

export default function VocabularyPractice() {
  return (
    // Sayfa içeriği için isteğe bağlı sarmalayıcı div kalabilir veya doğrudan bileşen render edilebilir.
    // MainDashboard'un içindeki <main> etiketi genellikle padding sağlar.
    // <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <VocabularyPracticePage />
    // </div>
  );
}
