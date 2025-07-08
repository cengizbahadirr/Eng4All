"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Volume2,
  // ChevronRight, // Bu sayfada detay linki yok, kaldırıldı
  Heart,
  BookOpen,
  // ListChecks, // Bu sayfada kullanılmıyor
  AlertCircle as AlertCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card"; // CardHeader, CardTitle kaldırıldı, gerekirse eklenebilir
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// API'den gelen kelime verisinin arayüzü (app/api/words/by-ids/route.ts içindeki VocabularyWordFrontend ile eşleşmeli)
interface FavoriteWord {
  id: number;
  word: string;
  type?: string;
  meaning?: string; 
  turkish_word?: string;
  phonetic?: string;
  level?: string;
  category?: string;
  examples?: string[];
  isFavorite: boolean; // API'den true olarak gelecek
  type_tr?: string;
}

interface FavoriteWordListItemProps {
  word: FavoriteWord;
  onToggleFavorite: (id: number, currentIsFavorite: boolean) => void;
  onPlayPronunciation: (word: string) => void;
}

const FavoriteWordListItem = React.memo(({
  word,
  onToggleFavorite,
  onPlayPronunciation,
}: FavoriteWordListItemProps) => {
  return (
    <Card className="border-input hover:border-lilac/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-foreground">{word.word}</h3>
              {word.level && <Badge variant="outline" className="text-xs">{word.level}</Badge>}
              {word.category && <Badge variant="secondary" className="text-xs">{word.category}</Badge>}
            </div>
            {word.turkish_word && <p className="text-md font-semibold text-lilac mb-1 capitalize">{word.turkish_word}</p>}
            <p className="text-muted-foreground text-sm">{word.meaning || "Detaylı açıklama bulunmuyor."}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-lilac" onClick={() => onPlayPronunciation(word.word)}><Volume2 className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full text-lilac hover:text-red-500 hover:bg-red-500/10" onClick={() => onToggleFavorite(word.id, true)}><Heart className="h-5 w-5 fill-current" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
FavoriteWordListItem.displayName = 'FavoriteWordListItem';


export default function FavoritesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, mutate: mutateAuth } = useAuth();

  const [favoriteWordsDetails, setFavoriteWordsDetails] = useState<FavoriteWord[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteDetails = async () => {
      if (!user || !user.favoriteWords || user.favoriteWords.length === 0) {
        setFavoriteWordsDetails([]);
        setIsLoadingFavorites(false);
        return;
      }
      setIsLoadingFavorites(true);
      setError(null);
      try {
        const idsString = user.favoriteWords.join(',');
        const response = await fetch(`/api/words/by-ids?ids=${idsString}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({error: "Bilinmeyen API hatası"}));
          throw new Error(errorData.error || "Favori kelime detayları yüklenemedi.");
        }
        const data: FavoriteWord[] = await response.json();
        setFavoriteWordsDetails(data);
      } catch (err) {
        console.error("Error fetching favorite word details:", err);
        const errorMessage = err instanceof Error ? err.message : "Bilinmeyen bir hata.";
        setError(`Favori kelimeler yüklenirken bir hata oluştu: ${errorMessage}`);
        setFavoriteWordsDetails([]);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    if (!isAuthLoading && user) {
      fetchFavoriteDetails();
    } else if (!isAuthLoading && !user) {
      setIsLoadingFavorites(false);
    }
  }, [user, isAuthLoading, JSON.stringify(user?.favoriteWords)]); // user objesinin tamamını ve favori kelimelerin string halini bağımlılığa ekle


  const handleToggleFavorite = useCallback(async (id: number, currentIsFavorite: boolean) => {
    if (!user) return; // Kullanıcı yoksa işlem yapma

    const action = 'remove'; // Bu sayfada sadece favoriden çıkarma olacak

    // Optimistic UI update
    const originalList = [...favoriteWordsDetails];
    setFavoriteWordsDetails(prevWords => prevWords.filter(word => word.id !== id));

    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId: id, action }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setFavoriteWordsDetails(originalList); 
        toast({ title: "Hata", description: result.error || "Favori güncellenemedi.", variant: "destructive" });
      } else {
        toast({ title: "Başarılı", description: result.message });
        mutateAuth(); // Kullanıcı verisini (ve favori listesini) SWR ile yenile
                      // Bu, user.favoriteWords'ü güncelleyecek ve yukarıdaki useEffect'i tetikleyerek
                      // fetchFavoriteDetails'in tekrar çalışmasını sağlayacak.
      }
    } catch (error) {
      setFavoriteWordsDetails(originalList);
      toast({ title: "Hata", description: "Favori güncellenirken bir ağ hatası oluştu.", variant: "destructive" });
    }
  }, [user, toast, mutateAuth, favoriteWordsDetails]);

  const playPronunciation = useCallback((word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } else {
      toast({ variant: "destructive", title: "Hata", description: "Tarayıcınız ses sentezlemeyi desteklemiyor." });
    }
  }, [toast]);

  const filteredWordsToDisplay = favoriteWordsDetails.filter(
    (word) =>
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (word.turkish_word && word.turkish_word.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (word.meaning && word.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isAuthLoading) { // Sadece isAuthLoading kontrolü, !user durumu aşağıda ele alınıyor
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="max-w-4xl mx-auto w-full text-center py-10">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Favorilerinizi Görmek İçin Giriş Yapın</h3>
            <p className="text-muted-foreground mb-6">Favori kelimelerinizi kaydetmek ve görmek için lütfen giriş yapın.</p>
            <Button onClick={() => router.push("/login")}>Giriş Yap</Button>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Favori Kelimelerim</h1>
        <p className="text-muted-foreground mt-1">Kaydettiğiniz favori kelimelerinizi burada bulabilirsiniz</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Favorilerde ara..."
            className="pl-10 bg-background focus:border-lilac focus:ring-lilac"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoadingFavorites && <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lilac mx-auto"></div><p className="mt-3 text-muted-foreground">Favoriler yükleniyor...</p></div>}

      {!isLoadingFavorites && error && (
        <Alert variant="destructive" className="my-6">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Favoriler Yüklenemedi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoadingFavorites && !error && filteredWordsToDisplay.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10 bg-muted/20 rounded-lg border border-dashed border-input text-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? "Aramanızla eşleşen favori kelime bulunamadı." : "Favori listeniz henüz boş."}
          </h3>
          {!searchTerm && (
            <p className="text-muted-foreground mb-6 max-w-md">
              Kelime çalışma alanından beğendiğiniz kelimeleri favorilerinize ekleyebilirsiniz.
            </p>
          )}
          {searchTerm && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
              Aramayı Temizle
            </Button>
          )}
          {!searchTerm && (
            <Button className="bg-lilac hover:bg-lilac/90 text-white mt-4" onClick={() => router.push("/vocabulary")}>
              <BookOpen className="h-4 w-4 mr-2" /> Kelime Çalışmaya Git
            </Button>
          )}
        </div>
      )}

      {!isLoadingFavorites && !error && filteredWordsToDisplay.length > 0 && (
        <div className="space-y-4">
          {filteredWordsToDisplay.map((word) => (
            <FavoriteWordListItem
              key={word.id}
              word={word}
              onToggleFavorite={handleToggleFavorite}
              onPlayPronunciation={playPronunciation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
