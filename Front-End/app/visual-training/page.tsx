import VisualTrainingPage from "@/components/visual-training-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Görsel Eğitimler - Eng4All",
  description: "Eng4All platformunda görsel eğitimlerle öğrenin.",
};

export default function VisualTraining() {
  return (
    <VisualTrainingPage />
  );
}
