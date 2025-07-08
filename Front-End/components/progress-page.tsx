"use client"

import { useState, useEffect } from "react"
import { Clock, BookOpen, CheckSquare, Flame, AlertCircle, Loader2, TrendingUp, Star } from "lucide-react" // TrendingUp ve Star eklendi
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge";
import { IExerciseAttempt } from "@/models/User" 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth"

export default function ProgressPage() {
  const { user, isLoading: isAuthLoading, mutate: mutateAuth } = useAuth();
  const [exerciseHistory, setExerciseHistory] = useState<IExerciseAttempt[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoadingHistory(true);
      return;
    }
    if (!user) {
      setError("İlerleme verilerini görmek için lütfen giriş yapın.");
      setIsLoadingHistory(false);
      setExerciseHistory([]);
      return;
    }
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      setError(null);
      try {
        const response = await fetch('/api/user/exercise-history');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Sunucudan ${response.status} koduyla yanıt alındı.` }));
          throw new Error(errorData.error || "İlerleme verileri yüklenemedi.");
        }
        const data = await response.json();
        if (data.success) {
          setExerciseHistory(data.history || []);
          if (user) { 
            mutateAuth(); 
          }
        } else {
          throw new Error(data.error || "İlerleme verileri alınırken bir sorun oluştu.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Bilinmeyen bir hata.";
        setError(errorMessage);
        setExerciseHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user, isAuthLoading, mutateAuth]);

  if (isAuthLoading || isLoadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-lilac" />
        <p className="mt-4 text-muted-foreground">İlerleme verileri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
         <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">İlerleme İstatistiklerim</h1>
          <p className="text-muted-foreground mt-1">Öğrenme yolculuğunuzu takip edin ve ilerleyişinizi görün</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const vocabularyPracticeHistory = exerciseHistory.filter(attempt => attempt.exerciseType === "vocabulary-practice");
  const totalVocabularyLearned = vocabularyPracticeHistory.reduce((sum, attempt) => sum + attempt.correctCount, 0);

  const quizHistory = exerciseHistory.filter(attempt => 
    attempt.exerciseType === "multiple-choice" || 
    attempt.exerciseType === "fill-in-blanks" || 
    attempt.exerciseType === "matching" || // Eşleştirme quizlerini de dahil et
    attempt.exerciseType.includes("quiz") 
  );
  const totalQuizzesCompleted = quizHistory.length;
  
  const totalActivitySeconds = user?.dailyActivity?.reduce((sum, activity) => sum + activity.durationInSeconds, 0) || 0;
  const totalActivityHours = (totalActivitySeconds / 3600).toFixed(1);

  const weeklyActivityData = Array(7).fill(0); 
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (6 - i)); 
    targetDate.setHours(0,0,0,0);
    const activityForDay = user?.dailyActivity?.find(activity => {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0,0,0,0);
      return activityDate.getTime() === targetDate.getTime();
    });
    weeklyActivityData[i] = activityForDay ? (activityForDay.durationInSeconds / 60) : 0; 
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">İlerleme İstatistiklerim</h1>
        <p className="text-muted-foreground mt-1">Öğrenme yolculuğunuzu takip edin ve ilerleyişinizi görün</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Kelime Bilgisi ({totalVocabularyLearned} kelime)
          </TabsTrigger>
          <TabsTrigger value="grammar" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Gramer ({user?.grammarScores?.filter(gs => gs.isCompleted || (gs.attempts && gs.attempts > 0)).length || 0} konu)
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Quizler ({totalQuizzesCompleted} quiz)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Çalışma Süresi</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActivityHours} saat</div>
              </CardContent>
            </Card>
            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Öğrenilen Kelimeler</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVocabularyLearned}</div>
              </CardContent>
            </Card>
            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamamlanan Quizler</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuizzesCompleted}</div>
              </CardContent>
            </Card>
            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Günlük Seri</CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.streakCount || 0} gün</div>
              </CardContent>
            </Card>
          </div>
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Haftalık Aktivite</CardTitle>
              <CardDescription>Son 7 gündeki çalışma aktiviteniz (dakika)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end justify-between px-2">
                {["6GÖ", "5GÖ", "4GÖ", "3GÖ", "2GÖ", "Dün", "Bugün"].map((dayLabel, index) => {
                  const activityMinutes = weeklyActivityData[index] || 0; 
                  const barHeightPercentage = activityMinutes > 0 ? Math.min(100, (activityMinutes / 120) * 100) : 0;
                  const barPixelHeight = (barHeightPercentage / 100) * 180; 
                  return (
                    <div key={dayLabel} className="flex flex-col items-center gap-1 w-[12%]">
                      <div 
                        title={`${activityMinutes.toFixed(0)} dk`}
                        className="bg-lilac/80 w-full rounded-t-md hover:bg-lilac transition-all"
                        style={{ height: `${Math.max(5, barPixelHeight)}px` }} 
                      ></div>
                      <span className="text-xs text-muted-foreground">{dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Kelime Alıştırmaları Geçmişi</CardTitle>
              <CardDescription>Yaptığınız kelime alıştırmalarının detayları.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {vocabularyPracticeHistory.length > 0 ? (
                vocabularyPracticeHistory.map((attempt, index) => (
                    <Card key={index} className="p-4 border-lilac/10">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">{attempt.topic || attempt.exerciseId}</p>
                        <p className="text-xs text-muted-foreground">{new Date(attempt.date).toLocaleDateString()}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div><span className="font-semibold">Skor:</span> {attempt.score}</div>
                        <div><span className="font-semibold text-green-600">Doğru:</span> {attempt.correctCount}</div>
                        <div><span className="font-semibold text-red-600">Yanlış:</span> {attempt.incorrectCount}</div>
                        <div><span className="font-semibold text-yellow-600">Boş:</span> {attempt.unansweredCount}</div>
                      </div>
                    </Card>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">Henüz tamamlanmış kelime alıştırmanız bulunmuyor.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grammar" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Gramer Konuları İlerlemesi</CardTitle>
              <CardDescription>Çalıştığınız ve tamamladığınız gramer konuları.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.grammarScores && user.grammarScores.filter(gs => gs.isCompleted || (gs.attempts && gs.attempts > 0)).length > 0 ? (
                user.grammarScores
                  .filter(gs => gs.isCompleted || (gs.attempts && gs.attempts > 0)) 
                  .map((score, index) => (
                    <Card key={index} className="p-4 border-lilac/10">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium">{score.topicId || "Bilinmeyen Konu"}</p>
                        {score.isCompleted && <Badge variant="default" className="text-xs bg-green-500/80 text-white">Tamamlandı <CheckSquare className="ml-1 h-3 w-3"/></Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Deneme Sayısı: {score.attempts || 0}
                        {score.lastAttempt?.date && (
                          <span> | Son Deneme: {new Date(score.lastAttempt.date).toLocaleDateString()}</span>
                        )}
                      </div>
                      {score.lastAttempt && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Son Skor: {score.lastAttempt.score} / {score.lastAttempt.totalQuestions}</span>
                            <span className="font-semibold">
                              %{score.lastAttempt.totalQuestions > 0 ? ((score.lastAttempt.score / score.lastAttempt.totalQuestions) * 100).toFixed(0) : 0}
                            </span>
                          </div>
                          <Progress 
                            value={score.lastAttempt.totalQuestions > 0 ? (score.lastAttempt.score / score.lastAttempt.totalQuestions) * 100 : 0} 
                            className="h-2 bg-muted" indicatorClassName="bg-lilac" 
                          />
                        </div>
                      )}
                       {typeof score.bestScore === 'number' && score.lastAttempt && score.bestScore !== score.lastAttempt.score && (
                         <p className="text-xs mt-1 text-muted-foreground flex items-center">
                           <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500"/> 
                           En İyi Skor: {score.bestScore} / {score.lastAttempt.totalQuestions} (%{score.lastAttempt.totalQuestions > 0 ? ((score.bestScore / score.lastAttempt.totalQuestions) * 100).toFixed(0) : 0})
                         </p>
                       )}
                    </Card>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">Henüz çalışılmış gramer konunuz bulunmuyor.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Quiz Geçmişi</CardTitle>
              <CardDescription>Çözdüğünüz quizlerin detayları.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {quizHistory.length > 0 ? (
                quizHistory.map((attempt, index) => (
                    <Card key={index} className="p-4 border-lilac/10">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">{attempt.topic || attempt.exerciseId} ({attempt.exerciseType})</p>
                        <p className="text-xs text-muted-foreground">{new Date(attempt.date).toLocaleDateString()}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div><span className="font-semibold">Skor:</span> {attempt.score}</div>
                        <div><span className="font-semibold text-green-600">Doğru:</span> {attempt.correctCount}</div>
                        <div><span className="font-semibold text-red-600">Yanlış:</span> {attempt.incorrectCount}</div>
                        <div><span className="font-semibold text-yellow-600">Boş:</span> {attempt.unansweredCount}</div>
                      </div>
                    </Card>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">Henüz tamamlanmış quiziniz bulunmuyor.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
