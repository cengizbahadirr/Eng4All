"use client";

import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Volume2,
  ChevronRight,
  Heart,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle as AlertCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IExerciseAttempt, IUserAnswer } from "@/models/User";
import { Skeleton } from "@/components/ui/skeleton";

interface VocabularyWord {
  id: number;
  word: string;
  type?: string;
  meaning?: string;
  phonetic?: string;
  level?: string;
  category?: string;
  examples?: string[];
  isFavorite?: boolean;
  type_tr?: string;
  turkish_word?: string;
}

const LEARNED_WORDS_STORAGE_KEY = "learnedVocabularyWords";

interface PracticeModalContentProps {
  currentWord: VocabularyWord | undefined;
  currentIndex: number;
  totalWords: number;
  userAnswer: string;
  onUserAnswerChange: (e: ChangeEvent<HTMLInputElement>) => void;
  practiceResult: "correct" | "incorrect" | null;
  showAnswer: boolean;
  onCheckAnswer: () => void;
  onNextWord: () => void;
  score: { correct: number; total: number };
}

const PracticeModalContent = React.memo(({
  currentWord,
  currentIndex,
  totalWords,
  userAnswer,
  onUserAnswerChange,
  practiceResult,
  showAnswer,
  onCheckAnswer,
  onNextWord,
  score
}: PracticeModalContentProps) => {
  if (!currentWord) {
    return <p className="py-4 text-muted-foreground">Alıştırma için kelime yükleniyor veya bulunamadı.</p>;
  }
  return (
    <>
      <DialogHeader>
        <DialogTitle>Kelime Pratiği</DialogTitle>
        {totalWords > 0 && (
          <DialogDescription>
            Aşağıdaki anlamı verilen kelimeyi yazın. ({currentIndex + 1}/{totalWords})
          </DialogDescription>
        )}
      </DialogHeader>
      <div className="space-y-4 py-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-lg font-semibold text-center text-foreground">
              {currentWord.meaning}
            </p>
            {currentWord.type && (
              <p className="text-sm text-muted-foreground text-center mt-1">
                ({currentWord.type})
              </p>
            )}
          </CardContent>
        </Card>
        <Input
          type="text"
          placeholder="Kelimeyi buraya yazın..."
          value={userAnswer}
          onChange={onUserAnswerChange}
          className={`focus:border-lilac focus:ring-lilac ${
            showAnswer && practiceResult === "correct" ? "border-green-500 ring-green-500" : 
            showAnswer && practiceResult === "incorrect" ? "border-red-500 ring-red-500" : "border-input"
          }`}
          disabled={showAnswer}
          autoFocus
        />
        {showAnswer && practiceResult === "correct" && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Doğru! Kelime: <strong>{currentWord.word}</strong></span>
          </div>
        )}
        {showAnswer && practiceResult === "incorrect" && (
          <div className="flex items-center text-red-600">
            <XCircle className="h-5 w-5 mr-2" />
            <span>Yanlış. Doğru kelime: <strong>{currentWord.word}</strong></span>
          </div>
        )}
      </div>
      <DialogFooter className="sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Skor: {score.correct} / {score.total}
        </div>
        {!showAnswer ? (
          <Button onClick={onCheckAnswer} disabled={!userAnswer.trim()} className="bg-lilac hover:bg-lilac/90">Kontrol Et</Button>
        ) : (
          <Button onClick={onNextWord} className="bg-lilac hover:bg-lilac/90">
            {currentIndex < totalWords - 1 ? "Sonraki Kelime" : "Alıştırmayı Bitir"}
          </Button>
        )}
      </DialogFooter>
    </>
  );
});
PracticeModalContent.displayName = 'PracticeModalContent';

interface WordListItemProps {
  word: VocabularyWord;
  isExpanded: boolean;
  isLearned: boolean;
  onToggleFavorite: (id: number, currentIsFavorite: boolean) => void;
  onPlayPronunciation: (word: string) => void;
  onToggleDetails: (id: number) => void;
}

const WordListItem = React.memo(({
  word,
  isExpanded,
  isLearned,
  onToggleFavorite,
  onPlayPronunciation,
  onToggleDetails
}: WordListItemProps) => {
  return (
    <Card className={`border-input hover:border-lilac/40 transition-colors ${isExpanded ? "border-lilac shadow-md" : ""} ${isLearned ? "opacity-60 bg-muted/30" : ""}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-xl font-bold text-foreground ${isLearned ? "line-through" : ""}`}>{word.word}</h3>
              {word.level && <Badge variant="outline" className="text-xs">{word.level}</Badge>}
              {word.category && <Badge variant="secondary" className="text-xs">{word.category}</Badge>}
              {isLearned && <Badge variant="default" className="text-xs bg-green-500/80 text-white">Öğrenildi</Badge>}
            </div>
            {word.turkish_word && <p className="text-md font-semibold text-lilac mb-1 capitalize">{word.turkish_word}</p>}
            <p className="text-muted-foreground text-sm">{word.meaning || "Detaylı açıklama bulunmuyor."}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-lilac" onClick={() => onPlayPronunciation(word.word)}><Volume2 className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className={`rounded-full hover:text-lilac ${word.isFavorite ? "text-lilac" : "text-muted-foreground"}`} onClick={() => onToggleFavorite(word.id, !!word.isFavorite)}><Heart className={`h-5 w-5 ${word.isFavorite ? "fill-current" : ""}`} /></Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-lilac" onClick={() => onToggleDetails(word.id)}><ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} /></Button>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-input">
            {word.type && word.phonetic && <div className="flex items-center gap-2 mb-2"><span className="text-sm font-medium text-muted-foreground">{word.type}</span><span className="text-sm text-muted-foreground">{word.phonetic}</span></div>}
            {word.meaning && <div className="mb-3"><h4 className="text-sm font-medium mb-1">Anlam</h4><p className="text-sm">{word.meaning}</p></div>}
            {word.examples && word.examples.length > 0 && <div><h4 className="text-sm font-medium mb-1">Örnek Cümleler</h4><ul className="space-y-1 list-disc list-inside text-muted-foreground">{word.examples.map((example, idx) => (<li key={idx} className="text-sm">{example}</li>))}</ul></div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
WordListItem.displayName = 'WordListItem';

export default function VocabularyPracticePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, mutate: mutateAuth } = useAuth();

  const [level, setLevel] = useState("B1");
  const [category, setCategory] = useState("Tümü");
  const [expandedWordId, setExpandedWordId] = useState<number | null>(null);

  const wordCategories = [
    "Tümü",
    "Günlük Eylemler (Fiiller)",
    "Yaygın Nesneler",
    "İnsanlar ve İlişkiler",
    "Yerler ve Seyahat",
    "Yiyecek ve İçecek",
    "Zaman ve Sayılar",
    "Doğa ve Hayvanlar",
    "İş ve Eğitim",
    "Duygular ve Hisler",
    "Tanımlayıcı Kelimeler (Sıfatlar/Zarflar)",
    "Soyut Kavramlar",
    "Dilbilgisi ve İşlev Kelimeleri (Örn: a, an, the, is, to be)",
    "Teknoloji ve Bilim",
    "Sağlık ve Vücut",
    "Hobiler ve Aktiviteler",
    "Ev ve Yaşam Alanı",
    "Giyim ve Aksesuar"
  ];
  const [allWordsFromApi, setAllWordsFromApi] = useState<VocabularyWord[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceWords, setPracticeWords] = useState<VocabularyWord[]>([]);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [practiceResult, setPracticeResult] = useState<"correct" | "incorrect" | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });
  const [practiceWordCount, setPracticeWordCount] = useState<string>("10");
  const [learnedWords, setLearnedWords] = useState<Set<number>>(new Set());
  const [practiceAnswers, setPracticeAnswers] = useState<IUserAnswer[]>([]);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    const storedLearnedWords = localStorage.getItem(LEARNED_WORDS_STORAGE_KEY);
    if (storedLearnedWords) {
      setLearnedWords(new Set(JSON.parse(storedLearnedWords)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LEARNED_WORDS_STORAGE_KEY, JSON.stringify(Array.from(learnedWords)));
  }, [learnedWords]);

  useEffect(() => {
    const fetchWords = async () => {
      setIsLoadingWords(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (level && level !== "Tümü") params.append("level", level);
        if (category && category !== "Tümü") params.append("category", category);
        params.append("count", "50");
        
        const response = await fetch(`/api/words?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.details || "Kelimeler yüklenirken bir sunucu hatası oluştu.");
        }
        let data: VocabularyWord[] = await response.json();

        if (user?.favoriteWords) {
          const userFavoriteIds = new Set(user.favoriteWords);
          data = data.map(word => ({
            ...word,
            isFavorite: userFavoriteIds.has(word.id)
          }));
        }
        setAllWordsFromApi(data.sort(() => 0.5 - Math.random()));
      } catch (err) {
        console.error("Error fetching words:", err);
        const errorMessage = err instanceof Error ? err.message : "Bilinmeyen bir hata.";
        setError(`Kelimeler yüklenemedi: ${errorMessage}`);
        setAllWordsFromApi([]);
      } finally {
        setIsLoadingWords(false);
      }
    };
    fetchWords();
  }, [level, category]);

  useEffect(() => {
    if (user && allWordsFromApi.length > 0) {
      const userFavoriteIds = new Set(user.favoriteWords || []);
      setAllWordsFromApi(prevWords =>
        prevWords.map(word => ({
          ...word,
          isFavorite: userFavoriteIds.has(word.id),
        }))
      );
    } else if (!user && allWordsFromApi.length > 0) {
      setAllWordsFromApi(prevWords =>
        prevWords.map(word => ({
          ...word,
          isFavorite: false,
        }))
      );
    }
  }, [user]);


  const getPracticeableWords = useCallback(() => {
    return allWordsFromApi.filter(word => 
      !learnedWords.has(word.id) && 
      word.meaning && 
      word.meaning.trim() !== "" && 
      word.meaning.length > 4 && 
      (!word.type || word.meaning.toLowerCase() !== word.type.toLowerCase()) &&
      (!word.type_tr || word.meaning.toLowerCase() !== word.type_tr.toLowerCase())
    );
  }, [allWordsFromApi, learnedWords]);
  
  const availableForPracticeCount = getPracticeableWords().length;

  const toggleFavorite = useCallback(async (id: number, currentIsFavorite: boolean) => {
    if (!user) {
      toast({ title: "Hata", description: "Favorilere eklemek için giriş yapmalısınız.", variant: "destructive" });
      return;
    }
    const action = currentIsFavorite ? 'remove' : 'add';
    setAllWordsFromApi(prevWords => 
      prevWords.map((word) => (word.id === id ? { ...word, isFavorite: !currentIsFavorite } : word))
    );
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId: id, action }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setAllWordsFromApi(prevWords => 
          prevWords.map((word) => (word.id === id ? { ...word, isFavorite: currentIsFavorite } : word))
        );
        toast({ title: "Hata", description: result.error || "Favori güncellenemedi.", variant: "destructive" });
      } else {
        toast({ title: "Başarılı", description: result.message });
        mutateAuth();
      }
    } catch (error) {
      setAllWordsFromApi(prevWords => 
        prevWords.map((word) => (word.id === id ? { ...word, isFavorite: currentIsFavorite } : word))
      );
      toast({ title: "Hata", description: "Favori güncellenirken bir ağ hatası oluştu.", variant: "destructive" });
    }
  }, [user, toast, mutateAuth]);


  const playPronunciation = useCallback((word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } else {
      toast({ variant: "destructive", title: "Hata", description: "Tarayıcınız ses sentezlemeyi desteklemiyor." });
    }
  }, [toast]);

  const toggleWordDetails = useCallback((id: number) => {
    setExpandedWordId(prevId => (prevId === id ? null : id));
  }, []);

  const handleStartPractice = useCallback(() => {
    const practiceable = getPracticeableWords();
    if (practiceable.length === 0) {
      toast({ title: "Alıştırma Başlatılamadı", description: "Pratik yapmak için uygun yeni kelime bulunmuyor.", variant: "default" });
      return;
    }
    const count = parseInt(practiceWordCount, 10);
    const shuffledPracticeable = [...practiceable].sort(() => 0.5 - Math.random());
    const selectedPracticeWords = shuffledPracticeable.slice(0, count);

    if (selectedPracticeWords.length === 0) {
        toast({ title: "Alıştırma Başlatılamadı", description: `Seçilen sayıda (${count}) pratik yapılacak uygun yeni kelime bulunamadı.`, variant: "default" });
        return;
    }
    setPracticeWords(selectedPracticeWords);
    setCurrentPracticeIndex(0);
    setUserAnswer("");
    setPracticeResult(null);
    setShowAnswer(false);
    setPracticeScore({ correct: 0, total: selectedPracticeWords.length });
    setPracticeAnswers([]);
    setStartTime(Date.now());
    setShowPracticeModal(true);
  }, [getPracticeableWords, practiceWordCount, toast]);

  const handlePracticeInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
  }, []);

  const checkPracticeAnswer = useCallback(() => {
    if (!practiceWords[currentPracticeIndex]) return;
    const currentWord = practiceWords[currentPracticeIndex];
    const correctAnswer = currentWord.word;
    const isAnswerCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    
    setPracticeResult(isAnswerCorrect ? "correct" : "incorrect");
    
    if (isAnswerCorrect && !showAnswer) {
      setPracticeScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setLearnedWords(prev => new Set(prev).add(currentWord.id));
    }

    setPracticeAnswers(prev => [...prev, {
        questionId: currentWord.id.toString(),
        questionText: currentWord.meaning || '',
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isAnswerCorrect,
        questionType: 'fill-in-blanks'
    }]);

    setShowAnswer(true);
  }, [practiceWords, currentPracticeIndex, userAnswer, showAnswer]);

  const handleNextPracticeWord = useCallback(async () => {
    if (currentPracticeIndex < practiceWords.length - 1) {
      setCurrentPracticeIndex(prev => prev + 1);
      setUserAnswer("");
      setPracticeResult(null);
      setShowAnswer(false);
    } else {
      toast({ title: "Alıştırma Tamamlandı!", description: `${practiceScore.total} kelimeden ${practiceScore.correct} tanesini doğru bildiniz.` });
      setShowPracticeModal(false);

      if (user && practiceAnswers.length > 0) {
        const durationInSeconds = Math.round((Date.now() - startTime) / 1000);
        const correctCount = practiceAnswers.filter(a => a.isCorrect).length;
        const incorrectCount = practiceAnswers.length - correctCount;
        const totalQuestions = practiceAnswers.length;
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        const attemptData: IExerciseAttempt = {
          exerciseId: `vocabulary-practice-${level}-${category}-${new Date().toISOString()}`,
          exerciseType: "vocabulary-practice",
          category: category || "Tümü",
          topic: "Kelime Alıştırması",
          level: level || "Tümü",
          date: new Date(),
          score: score,
          totalQuestions: totalQuestions,
          correctCount: correctCount,
          incorrectCount: incorrectCount,
          unansweredCount: 0,
          answeredQuestions: practiceAnswers,
          duration: durationInSeconds,
        };

        try {
          const response = await fetch('/api/user/exercise-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attemptData),
          });
          const result = await response.json();
          if (response.ok && result.success) {
            toast({ title: "İlerleme Kaydedildi", description: "Alıştırma sonuçlarınız profilinize kaydedildi." });
          } else {
            toast({ title: "Kayıt Hatası", description: result.error || "İlerleme kaydedilemedi.", variant: "destructive" });
          }
        } catch (error) {
          toast({ title: "Ağ Hatası", description: "İlerleme kaydedilirken bir sorun oluştu.", variant: "destructive" });
          console.error("Error saving exercise history:", error);
        }
      }
    }
  }, [currentPracticeIndex, practiceWords, practiceScore, toast, user, level, category, practiceAnswers, startTime]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Kelime Çalışma Alanı</h1>
        <p className="text-muted-foreground mt-1">Seviyenize uygun kelimelerle İngilizce kelime dağarcığınızı geliştirin</p>
      </div>
      <div className="mb-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium mb-2 text-muted-foreground">Seviye</h2>
          <Tabs defaultValue={level} onValueChange={setLevel} className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 p-1 flex-wrap h-auto">
              {["Tümü", "A1", "A2", "B1", "B2", "C1", "C2"].map(lvl => (
                <TabsTrigger key={lvl} value={lvl} className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                  {lvl}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div>
          <h2 className="text-sm font-medium mb-2 text-muted-foreground">Kategori</h2>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {wordCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
            <h2 className="text-sm font-medium mb-2 text-muted-foreground">Pratik Kelime Sayısı</h2>
            <Select value={practiceWordCount} onValueChange={setPracticeWordCount}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Kelime sayısı seçin" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">5 Kelime</SelectItem>
                    <SelectItem value="10">10 Kelime</SelectItem>
                    <SelectItem value="20">20 Kelime</SelectItem>
                    <SelectItem value="50">50 Kelime</SelectItem>
                    <SelectItem value="100">100 Kelime</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <Button
        className="w-full mb-6 bg-lilac hover:bg-lilac/90 text-white py-6 text-lg"
        onClick={handleStartPractice}
        disabled={availableForPracticeCount === 0 || isLoadingWords}
      >
        Bu Liste ile Pratik Yap ({availableForPracticeCount} yeni kelime)
      </Button>

      {isLoadingWords && <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lilac mx-auto"></div><p className="mt-3 text-muted-foreground">Kelimeler yükleniyor...</p></div>}
      
      {!isLoadingWords && error && (
        <Alert variant="destructive" className="my-6">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Veri Yükleme Hatası</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!isLoadingWords && !error && allWordsFromApi.length === 0 && (
        <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-input">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Bu seviye veya kategoride henüz kelime eklenmemiştir.</p>
        </div>
      )}
      {!isLoadingWords && !error && allWordsFromApi.length > 0 && availableForPracticeCount === 0 && allWordsFromApi.some(word => !learnedWords.has(word.id)) && (
        <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-input">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Listede pratik yapmak için uygun (anlamı olan ve öğrenilmemiş) kelime bulunmuyor.</p>
          <p className="text-xs text-muted-foreground mt-1">Kelimelerin anlamlarının dolu olduğundan emin olun.</p>
        </div>
      )}
      {!isLoadingWords && !error && allWordsFromApi.length > 0 && availableForPracticeCount === 0 && allWordsFromApi.every(word => learnedWords.has(word.id)) && (
        <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-input">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-70" />
          <p className="text-muted-foreground">Tebrikler! Bu listedeki tüm kelimeleri öğrendiniz.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setLearnedWords(new Set()); }}>Öğrenilenleri Sıfırla</Button>
        </div>
      )}

      {!isLoadingWords && !error && allWordsFromApi.length > 0 && (
        <div className="space-y-4 mb-8">
          {allWordsFromApi.map((word) => (
            <WordListItem
              key={word.id}
              word={word}
              isExpanded={expandedWordId === word.id}
              isLearned={learnedWords.has(word.id)}
              onToggleFavorite={toggleFavorite}
              onPlayPronunciation={playPronunciation}
              onToggleDetails={toggleWordDetails}
            />
          ))}
        </div>
      )}

      <Dialog open={showPracticeModal} onOpenChange={setShowPracticeModal}>
        <DialogContent className="sm:max-w-md">
          {practiceWords.length > 0 && currentPracticeIndex < practiceWords.length ? (
             <PracticeModalContent
                currentWord={practiceWords[currentPracticeIndex]}
                currentIndex={currentPracticeIndex}
                totalWords={practiceWords.length}
                userAnswer={userAnswer}
                onUserAnswerChange={handlePracticeInputChange}
                practiceResult={practiceResult}
                showAnswer={showAnswer}
                onCheckAnswer={checkPracticeAnswer}
                onNextWord={handleNextPracticeWord}
                score={practiceScore}
             />
          ) : (
            <p className="py-4 text-muted-foreground">Alıştırma için kelime bulunamadı veya yüklenemedi.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
