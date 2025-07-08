"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Volume2, Heart, Star, RefreshCw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { LevelAssessmentTest } from "@/components/level-assessment-test/level-assessment-test";
import { updateUserCurrentLevel } from "@/actions/profile-actions";
import { IWord } from "@/models/Word";
import { toggleFavoriteWord } from "@/actions/user-actions";
import { Skeleton } from "@/components/ui/skeleton";

// İfade arayüzü
interface IExpression {
  expression: string;
  type: string;
  turkish_meaning: string;
  example_sentence: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, mutate: mutateAuth } = useAuth();
  
  const [showLevelTest, setShowLevelTest] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [randomWord, setRandomWord] = useState<IWord | null>(null);
  const [isWordLoading, setIsWordLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const [randomExpression, setRandomExpression] = useState<IExpression | null>(null);
  const [isExpressionLoading, setIsExpressionLoading] = useState(true);

  const fetchRandomWord = useCallback(async () => {
    setIsWordLoading(true);
    try {
      const response = await fetch('/api/words/random');
      const result = await response.json();
      if (result.success) {
        setRandomWord(result.data);
        if (user?.favoriteWords && result.data?.id) {
          setIsFavorite(user.favoriteWords.includes(result.data.id));
        }
      } else {
        toast({ title: "Hata", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Rastgele kelime getirilemedi.", variant: "destructive" });
    } finally {
      setIsWordLoading(false);
    }
  }, [toast, user?.favoriteWords]);

  const fetchRandomExpression = useCallback(async () => {
    setIsExpressionLoading(true);
    try {
      const response = await fetch('/api/expressions/random');
      const result = await response.json();
      if (result.success) {
        setRandomExpression(result.data);
      } else {
        console.error("İfade getirme hatası:", result.error);
        setRandomExpression(null);
      }
    } catch (error) {
      console.error("İfade getirme hatası:", error);
      setRandomExpression(null);
    } finally {
      setIsExpressionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRandomWord();
      fetchRandomExpression();
    }
  }, [user, fetchRandomWord, fetchRandomExpression]);

  const handleToggleFavorite = async () => {
    if (!randomWord || !randomWord.id || isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    const result = await toggleFavoriteWord(randomWord.id);
    if (result.success) {
      setIsFavorite(result.isFavorite ?? false);
      toast({
        title: "Başarılı",
        description: result.isFavorite ? "Kelime favorilere eklendi." : "Kelime favorilerden çıkarıldı.",
      });
      mutateAuth();
    } else {
      toast({ title: "Hata", description: result.error, variant: "destructive" });
    }
    setIsTogglingFavorite(false);
  };

  const userData = {
    name: user?.name || "Kullanıcı",
    level: user?.currentLevel || "Belirlenmedi",
    levelName: user?.currentLevel ? `${user.currentLevel} Seviyesi` : "Seviye Yok",
    hasLevel: !!user?.currentLevel,
  };

  const handleLevelTestComplete = async (level: string) => {
    setShowLevelTest(false);
    const result = await updateUserCurrentLevel(level);
    if (result.success && result.newLevel) {
      toast({ title: "Başarılı!", description: `Seviyeniz (${result.newLevel}) profilinize başarıyla kaydedildi.` });
      mutateAuth(); 
    } else {
      toast({ variant: "destructive", title: "Hata", description: result.error || "Seviyeniz kaydedilirken bir sorun oluştu." });
    }
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Puanlama Gerekli",
        description: "Lütfen göndermeden önce bir puan seçin.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: feedback }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast({
          title: "Teşekkürler!",
          description: result.message,
        });
        setFeedbackSubmitted(true);
        setTimeout(() => {
          setRating(0);
          setFeedback("");
          setFeedbackSubmitted(false);
        }, 5000);
      } else {
        toast({
          title: "Hata",
          description: result.error || "Geri bildirim gönderilirken bir sorun oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Bağlantı Hatası",
        description: "Sunucuya ulaşılamadı, lütfen tekrar deneyiniz.",
        variant: "destructive",
      });
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthLoading && !user) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Giriş yapmanız gerekiyor. Yönlendiriliyorsunuz...</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Ana Sayfa</h1>
        <p className="text-muted-foreground mt-1">Dil öğrenme yolculuğunuza hoş geldiniz</p>
      </div>

      <Card className="border-lilac/20 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-lilac/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-lilac" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Hoş Geldiniz, {userData.name}!</h2>
              {userData.hasLevel ? (
                <div className="flex items-center mt-1">
                  <span className="text-muted-foreground">Seviyeniz: </span>
                  <Badge variant="outline" className="ml-2 bg-lilac/10 text-lilac border-lilac">
                    {userData.level} - {userData.levelName}
                  </Badge>
                </div>
              ) : (
                <p className="text-muted-foreground">Seviyenizi belirlemek için seviye testini yapın.</p>
              )}
            </div>
          </div>
          {!userData.hasLevel && (
            <div className="mt-2">
              <Button className="bg-lilac hover:bg-lilac/90 text-white" onClick={() => setShowLevelTest(true)}>
                Seviye Tespit Sınavına Başla!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-4">Hızlı Başlangıç</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-lilac/20 hover:border-lilac/50 transition-colors">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Kelime Pratiğine Başla</CardTitle></CardHeader>
          <CardContent className="pb-2"><p className="text-sm text-muted-foreground">Günün kelime hedefini tamamla</p></CardContent>
          <CardFooter><Button className="w-full bg-lilac hover:bg-lilac/90 text-white" onClick={() => router.push("/vocabulary")}>Başla</Button></CardFooter>
        </Card>
        <Card className="border-lilac/20 hover:border-lilac/50 transition-colors">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Gramer Pratiğine Başla</CardTitle></CardHeader>
          <CardContent className="pb-2"><p className="text-sm text-muted-foreground">Gramer bilgini pekiştir</p></CardContent>
          <CardFooter><Button className="w-full bg-lilac hover:bg-lilac/90 text-white" onClick={() => router.push("/grammar")}>Başla</Button></CardFooter>
        </Card>
        <Card className="border-lilac/20 hover:border-lilac/50 transition-colors">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Hızlı Quiz Çöz</CardTitle></CardHeader>
          <CardContent className="pb-2"><p className="text-sm text-muted-foreground">Bilgini test et</p></CardContent>
          <CardFooter><Button className="w-full bg-lilac hover:bg-lilac/90 text-white" onClick={() => router.push("/quizzes")}>Başla</Button></CardFooter>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-4">Günün Rastgele Kelimesi</h2>
      <Card className="border-lilac/20 mb-6">
        {isWordLoading ? (
          <CardContent className="p-6">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        ) : randomWord ? (
          <>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center text-2xl">
                <span>{randomWord.value.word}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-lilac hover:bg-lilac/10" onClick={fetchRandomWord}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-lilac hover:bg-lilac/10" onClick={handleToggleFavorite} disabled={isTogglingFavorite}>
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{randomWord.value.phonetics?.us || ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{randomWord.value.type}</Badge>
                  <Badge variant="secondary" className="text-xs">{randomWord.value.level}</Badge>
                </div>
                <p className="text-muted-foreground">{randomWord.value.turkish_word}</p>
                {randomWord.value.examples && randomWord.value.examples.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm italic">"{randomWord.value.examples[0]}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="p-6 text-center text-muted-foreground">
            Rastgele kelime yüklenemedi.
          </CardContent>
        )}
      </Card>

      <h2 className="text-lg font-semibold mb-4">Günün İfadesi</h2>
      <Card className="border-lilac/20 mb-6">
        {isExpressionLoading ? (
          <CardContent className="p-6">
            <Skeleton className="h-6 w-2/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        ) : randomExpression ? (
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Badge variant="secondary">{randomExpression.type}</Badge>
                <p className="font-semibold text-lg">"{randomExpression.expression}"</p>
                <p className="text-sm text-muted-foreground">{randomExpression.turkish_meaning}</p>
                <p className="text-xs italic text-muted-foreground pt-2">Örnek: {randomExpression.example_sentence}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={fetchRandomExpression}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-6 text-center text-muted-foreground">
            Seviyenize uygun ifade bulunamadı.
          </CardContent>
        )}
      </Card>

      <h2 className="text-lg font-semibold mb-4">Geri Bildiriminiz</h2>
      <Card className="border-lilac/20 mb-6">
        <CardContent className="p-6">
          {feedbackSubmitted ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-lilac text-xl font-semibold mb-2">Teşekkürler!</div>
              <p className="text-muted-foreground text-center">Geri bildiriminiz için teşekkür ederiz.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Genel Puanınız:</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="p-1 focus:outline-none focus:ring-0">
                      <Star className={`h-6 w-6 ${star <= rating ? "fill-lilac text-lilac" : "text-muted-foreground"} hover:text-lilac transition-colors`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium mb-2">Kısa Mesajınız (isteğe bağlı):</label>
                <Textarea id="feedback" placeholder="Eklemek istediğiniz bir not var mı?" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="resize-none focus:border-lilac focus:ring-lilac" />
              </div>
              <div className="pt-2">
                <Button onClick={handleFeedbackSubmit} disabled={rating === 0} className="bg-lilac hover:bg-lilac/90 text-white">Gönder</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showLevelTest && (
        <LevelAssessmentTest
          isFirstTime={!userData.hasLevel}
          onComplete={handleLevelTestComplete}
          onClose={() => setShowLevelTest(false)}
        />
      )}
    </div>
  );
}
