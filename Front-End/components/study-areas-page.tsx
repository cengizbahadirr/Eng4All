"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, PenTool, Shuffle } from "lucide-react"; // Shuffle ikonu eklendi

export default function StudyAreasPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Çalışma Alanları</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          İngilizce becerilerinizi geliştirmek için pratik alanlarımızı keşfedin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-input hover:border-lilac/50" onClick={() => router.push("/vocabulary")}>
          <CardHeader className="items-center text-center">
            <BookOpen className="h-12 w-12 text-lilac mb-3" />
            <CardTitle className="text-2xl">Kelime Pratiği</CardTitle>
            <CardDescription className="mt-1">
              Kelime dağarcığınızı genişletin, yeni kelimeler öğrenin ve öğrendiklerinizi pekiştirin.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button className="w-full max-w-xs bg-lilac hover:bg-lilac/90 text-white">
              Kelime Çalışmaya Başla
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-input hover:border-lilac/50" onClick={() => router.push("/grammar")}>
          <CardHeader className="items-center text-center">
            <PenTool className="h-12 w-12 text-lilac mb-3" />
            <CardTitle className="text-2xl">Gramer Pratiği</CardTitle>
            <CardDescription className="mt-1">
              Gramer kurallarını öğrenin, alıştırmalarla pratik yapın ve dilbilgisi becerilerinizi geliştirin.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button className="w-full max-w-xs bg-lilac hover:bg-lilac/90 text-white">
              Gramer Çalışmaya Başla
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-input hover:border-lilac/50 md:col-span-2 lg:col-span-1" onClick={() => router.push("/synonym-practice")}>
          <CardHeader className="items-center text-center">
            <Shuffle className="h-12 w-12 text-lilac mb-3" />
            <CardTitle className="text-2xl">Eş Anlamlı Alıştırması</CardTitle>
            <CardDescription className="mt-1">
              Kelimelerin eş anlamlılarını bularak kelime bilginizi derinleştirin.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button className="w-full max-w-xs bg-lilac hover:bg-lilac/90 text-white">
              Alıştırmaya Başla
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
