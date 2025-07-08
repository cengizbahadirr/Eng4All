import StudyAreasPageClientComponent from "@/components/study-areas-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Çalışma Alanları - Eng4All",
  description: "Eng4All platformunda kelime ve gramer pratik alanlarını keşfedin.",
};

export default function StudyAreasRoutePage() { // Sayfa adı farklı olsun diye RoutePage eklendi
  return (
    // Bu sayfa app/layout.tsx içindeki MainDashboard tarafından sarmalanacağı için
    // burada ek bir MainDashboard sarmalayıcısına gerek yok.
    // Sayfa içeriği için isteğe bağlı bir container div eklenebilir,
    // ancak StudyAreasPageClientComponent zaten kendi max-w-4xl mx-auto w-full sarmalayıcısına sahip.
    <StudyAreasPageClientComponent />
  );
}
