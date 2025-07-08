import SynonymPracticePage from "@/components/synonym-practice-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eş Anlamlı Alıştırması - Eng4All",
  description: "Eş anlamlı kelimeleri bularak kelime dağarcığınızı geliştirin.",
};

export default function SynonymPractice() {
  return (
    <SynonymPracticePage />
  );
}
