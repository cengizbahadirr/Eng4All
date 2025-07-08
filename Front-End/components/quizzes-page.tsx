"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  SplitSquareHorizontal,
  Info,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { IExerciseAttempt } from "@/models/User"; 
import QuizSessionManager from '@/components/quiz-session-manager';

interface QuizType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
}

interface QuizTopicEntry {
  id: string; 
  title: string;
  description: string;
  disabled?: boolean;
}

const quizTypes: QuizType[] = [
  { id: "multiple-choice", title: "Çoktan Seçmeli", description: "Verilen soruya doğru cevabı seçin", icon: CheckCircle2 },
  { id: "fill-in-blanks", title: "Boşluk Doldurma", description: "Cümledeki boşluğa uygun kelimeyi yazın", icon: FileText, disabled: false },
  { id: "matching", title: "Eşleştirme", description: "Kelimeleri anlamlarıyla eşleştirin", icon: SplitSquareHorizontal, disabled: false },
];

const allQuestionCounts = [
  { id: "3", count: 3, time: "~2 dakika" },
  { id: "5", count: 5, time: "~3 dakika" }, 
  { id: "10", count: 10, time: "~5 dakika" },
  { id: "15", count: 15, time: "~7 dakika" }, 
  { id: "20", count: 20, time: "~10 dakika" },
];

interface QuizQuestion { 
  questionId: string;
  questionText: string; 
  options: string[];    
  correctAnswer: string; 
  wordDetails?: any; 
  explanation?: string; 
  questionType?: 'fill-in-blanks' | 'multiple-choice' | 'matching'; 
  matchPairs?: { word: string, definition: string }[]; 
}

export default function QuizzesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [selectedQuizType, setSelectedQuizType] = useState<string | null>("multiple-choice");
  const [selectedTopicCategory, setSelectedTopicCategory] = useState<"vocabulary" | "grammar" | "mixed">("vocabulary");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<string>("10"); 
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [activeQuizData, setActiveQuizData] = useState<{ questions: QuizQuestion[], settings: any } | null>(null);
  
  const currentUserLevel = user?.currentLevel?.toUpperCase() || "A1"; 

  const [vocabularyTopics, setVocabularyTopics] = useState<QuizTopicEntry[]>([]);
  const [grammarTopics, setGrammarTopics] = useState<QuizTopicEntry[]>([]);
  const [fillInBlanksQuizTopics, setFillInBlanksQuizTopics] = useState<QuizTopicEntry[]>([]);
  const [matchQuizTopics, setMatchQuizTopics] = useState<QuizTopicEntry[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  useEffect(() => {
    const levelStr = currentUserLevel;
    setVocabularyTopics([
      { id: "vocab-level", title: `Seviyeme Uygun Kelimeler (${levelStr}) (Çoktan Seçmeli)`, description: "Seviyenize uygun kelimelerden oluşan çoktan seçmeli quiz" },
      { id: "vocab-favorites", title: "Favori Kelimelerim (Çoktan Seçmeli)", description: "Favorilerinize eklediğiniz kelimelerden oluşan çoktan seçmeli quiz" },
    ]);
  }, [currentUserLevel]);

  const fetchQuizTopics = useCallback(async (quizTypeForAPI: string, level: string) => {
    if (!quizTypeForAPI || !level) return;
    setIsLoadingTopics(true);
    setSelectedTopic(null); 
    try {
      const response = await fetch(`/api/quiz-topics?type=${quizTypeForAPI}&level=${level}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `${quizTypeForAPI} konuları yüklenemedi.`);
      }
      const data = await response.json();
      if (quizTypeForAPI === 'grammar') {
        setGrammarTopics(data.topics || []);
      } else if (quizTypeForAPI === 'fill-in-blanks') {
        setFillInBlanksQuizTopics(data.topics || []);
      } else if (quizTypeForAPI === 'match') {
        setMatchQuizTopics(data.topics || []);
      }
    } catch (error) {
      toast({ title: "Konu Yükleme Hatası", description: (error as Error).message, variant: "destructive" });
      if (quizTypeForAPI === 'grammar') setGrammarTopics([]);
      else if (quizTypeForAPI === 'fill-in-blanks') setFillInBlanksQuizTopics([]);
      else if (quizTypeForAPI === 'match') setMatchQuizTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedQuizType === 'fill-in-blanks') {
        fetchQuizTopics('fill-in-blanks', currentUserLevel);
        setSelectedQuestionCount("3"); 
    } else if (selectedQuizType === 'matching') {
        fetchQuizTopics('match', currentUserLevel);
        // setSelectedQuestionCount("10"); // Eşleştirme için soru sayısı seçimi yok
    } else if (selectedTopicCategory === 'grammar' && selectedQuizType === 'multiple-choice') {
        fetchQuizTopics('grammar', currentUserLevel);
        setSelectedQuestionCount("10"); 
    } else if (selectedTopicCategory === 'vocabulary' && selectedQuizType === 'multiple-choice') {
        setSelectedQuestionCount("10"); 
    }
  }, [selectedTopicCategory, currentUserLevel, fetchQuizTopics, selectedQuizType]);

  const generateMultipleChoiceVocabularyQuestions = (words: any[], numQuestionsToGenerate: number): QuizQuestion[] => {
    const SoruOlusturacakKelimeler = words.sort(() => 0.5 - Math.random()).slice(0, numQuestionsToGenerate);
    const questions: QuizQuestion[] = [];
     for (const correctWord of SoruOlusturacakKelimeler) {
        const correctAnswerText = correctWord.turkish_word || correctWord.meaning || "Anlam bulunamadı";
        let wrongOptionsTexts: string[] = [];
        words
            .filter(w => w.id !== correctWord.id)
            .forEach(w => {
                const optionText = w.turkish_word || w.meaning;
                if (optionText && optionText !== correctAnswerText && !wrongOptionsTexts.includes(optionText) && wrongOptionsTexts.length < 3) {
                    wrongOptionsTexts.push(optionText);
                }
            });
        while (wrongOptionsTexts.length < 3) {
            wrongOptionsTexts.push(`Rastgele Seçenek ${Math.floor(Math.random() * 10000)}`);
        }
        const options = [...wrongOptionsTexts, correctAnswerText].sort(() => 0.5 - Math.random());
        questions.push({
            questionId: correctWord.id.toString(),
            questionText: `"${correctWord.word}" kelimesinin Türkçe anlamı nedir?`,
            options: options,
            correctAnswer: correctAnswerText,
            wordDetails: correctWord,
            questionType: 'multiple-choice',
        });
    }
    return questions;
  };

  const handleStartQuiz = async () => {
    if (!selectedQuizType || !selectedTopic || (selectedQuizType !== 'matching' && !selectedQuestionCount) ) {
      toast({ title: "Eksik Seçim", description: "Lütfen quiz türü, konu ve soru sayısını seçin.", variant: "destructive" });
      return;
    }
    
    let currentTopicsForSelection: QuizTopicEntry[] = [];
    if (selectedQuizType === 'fill-in-blanks') {
        currentTopicsForSelection = fillInBlanksQuizTopics;
    } else if (selectedQuizType === 'matching') {
        currentTopicsForSelection = matchQuizTopics;
    } else if (selectedTopicCategory === 'grammar') {
        currentTopicsForSelection = grammarTopics;
    } else if (selectedTopicCategory === 'vocabulary') {
        currentTopicsForSelection = vocabularyTopics;
    }

    const quizTypeInfo = quizTypes.find((type) => type.id === selectedQuizType);
    const topicInfo = currentTopicsForSelection?.find((topicEntry) => topicEntry.id === selectedTopic);

    if (!quizTypeInfo || !topicInfo) {
        toast({ title: "Hata", description: "Quiz ayarları tamamlanamadı. Lütfen seçimlerinizi kontrol edin.", variant: "destructive" });
        setIsStartingQuiz(false); return;
    }

    setIsStartingQuiz(true);
    
    let numQuestions = 0; 
    if (selectedQuizType === 'fill-in-blanks') {
        numQuestions = 3; 
    } else if (selectedQuizType !== 'matching') {
        const questionCountObj = allQuestionCounts.find((count) => count.id === selectedQuestionCount);
        numQuestions = questionCountObj ? questionCountObj.count : 10;
    }
    
    toast({ title: "Quiz Hazırlanıyor...", description: `${quizTypeInfo.title} - ${topicInfo.title} - ${selectedQuizType === 'matching' ? 'Eşleştirme' : numQuestions + ' Soru'}` });

    let generatedQuestions: QuizQuestion[] = [];
    let apiEndpoint = "";
    let quizFetchType = "";

    if (selectedQuizType === "multiple-choice") {
        if (selectedTopicCategory === "vocabulary") {
             try {
                let wordsForQuizGeneration: any[] = [];
                 if (topicInfo.id === "vocab-favorites") {
                    if (!user?.favoriteWords || user.favoriteWords.length === 0) throw new Error("Quiz oluşturmak için favori kelimeniz bulunmuyor.");
                    const minWordsNeeded = Math.max(numQuestions, 4);
                    if (user.favoriteWords.length < minWordsNeeded) throw new Error(`Quiz için en az ${minWordsNeeded} favori kelime gereklidir.`);
                    const favoriteIdsString = user.favoriteWords.join(',');
                    const favWordsResponse = await fetch(`/api/words/by-ids?ids=${favoriteIdsString}`);
                    if (!favWordsResponse.ok) throw new Error("Favori kelimeler yüklenemedi.");
                    wordsForQuizGeneration = await favWordsResponse.json();
                    if (wordsForQuizGeneration.length < minWordsNeeded) throw new Error(`API'den dönen favori kelime sayısı (${wordsForQuizGeneration.length}) quiz için yetersiz.`);
                } else {
                    let apiUrl = `/api/words?count=${numQuestions * 5}&level=${currentUserLevel}`;
                    const response = await fetch(apiUrl);
                    if (!response.ok) throw new Error("Kelimeler yüklenemedi.");
                    wordsForQuizGeneration = await response.json();
                }
                if (wordsForQuizGeneration.length === 0 && numQuestions > 0) throw new Error("Seçilen kriterlere uygun kelime bulunamadı.");
                generatedQuestions = generateMultipleChoiceVocabularyQuestions(wordsForQuizGeneration, numQuestions);

            } catch (error) {
                 toast({ title: "Kelime Quizi Hatası", description: (error as Error).message, variant: "destructive" });
                 setIsStartingQuiz(false); return;
            }
        } else if (selectedTopicCategory === "grammar") {
            apiEndpoint = `/api/grammar-quizzes?level=${currentUserLevel}&topic=${encodeURIComponent(topicInfo.id)}`;
            quizFetchType = "Gramer (Çoktan Seçmeli)";
        }
    } else if (selectedQuizType === "fill-in-blanks") {
        apiEndpoint = `/api/fill-in-blanks-quizzes?level=${currentUserLevel}&topic=${encodeURIComponent(topicInfo.id)}`;
        quizFetchType = "Boşluk Doldurma";
    } else if (selectedQuizType === "matching") {
        apiEndpoint = `/api/match-quizzes?level=${currentUserLevel}&topic=${encodeURIComponent(topicInfo.id)}`; 
        quizFetchType = "Kelime Eşleştirme";
    }

    if (apiEndpoint) {
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                throw new Error(errorData.error || `${quizFetchType} soruları "${topicInfo.title}" konusu için yüklenemedi.`);
            }
            const questionsFromApi: QuizQuestion[] = await response.json(); 
            
            if (!questionsFromApi || questionsFromApi.length === 0) {
                throw new Error(`"${topicInfo.title}" (${currentUserLevel}) konusu için ${quizFetchType.toLowerCase()} sorusu bulunamadı.`);
            }

            if (selectedQuizType === 'matching') {
                generatedQuestions = questionsFromApi; 
                numQuestions = questionsFromApi[0]?.matchPairs?.length || 0; 
            } else {
                generatedQuestions = questionsFromApi.sort(() => 0.5 - Math.random()).slice(0, numQuestions);
            }
            
            if (generatedQuestions.length === 0 ) { 
                 throw new Error(`"${topicInfo.title}" konusu için ${quizFetchType.toLowerCase()} sorusu bulunamadı (API sonrası).`);
            } else if (selectedQuizType !== 'matching' && generatedQuestions.length < numQuestions ) {
                 toast({ title: "Uyarı", description: `İstenen sayıda (${numQuestions}) "${topicInfo.title}" sorusu bulunamadı. ${generatedQuestions.length} soru ile devam ediliyor.`, variant: "default" });
            }
        } catch (error) {
            toast({ title: `${quizFetchType} Quizi Hatası`, description: (error as Error).message, variant: "destructive" });
            setIsStartingQuiz(false); return;
        }
    }
    
    if (generatedQuestions.length === 0 ) {
        toast({ title: "Soru Oluşturulamadı", description: "Seçilen kriterlere uygun soru oluşturulamadı.", variant: "destructive" });
        setIsStartingQuiz(false); return;
    }
      
    setActiveQuizData({ 
        questions: generatedQuestions, 
        settings: {
          type: selectedQuizType,
          topic: selectedTopic, 
          topicTitle: topicInfo.title,
          category: selectedQuizType === 'matching' ? 'matching' : selectedTopicCategory, 
          count: generatedQuestions.length, 
          level: currentUserLevel,
        } 
    });
    setIsStartingQuiz(false);
  };

  const handleQuizCompletion = (results: IExerciseAttempt) => { // async kaldırıldı, API isteği QuizSessionManager'da
    setActiveQuizData(null); 
    router.push('/progress'); 
  };

  const isQuizSelectionComplete = () => selectedQuizType && selectedTopic && (selectedQuizType === 'matching' || selectedQuestionCount);

  let currentAvailableTopics: QuizTopicEntry[] = [];
  if (selectedQuizType === "fill-in-blanks") {
    currentAvailableTopics = fillInBlanksQuizTopics;
  } else if (selectedQuizType === "matching") {
    currentAvailableTopics = matchQuizTopics;
  } else if (selectedTopicCategory === 'grammar' && selectedQuizType === 'multiple-choice') {
    currentAvailableTopics = grammarTopics;
  } else if (selectedTopicCategory === 'vocabulary' && selectedQuizType === 'multiple-choice') {
    currentAvailableTopics = vocabularyTopics;
  }

  const questionCountsToDisplay = selectedQuizType === 'fill-in-blanks' 
    ? allQuestionCounts.filter(qc => qc.count === 3) 
    : (selectedQuizType === 'matching' ? [] : allQuestionCounts); 

  if (isAuthLoading || isLoadingTopics) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-lilac" />
        <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (activeQuizData) {
    return (
      <QuizSessionManager 
        questions={activeQuizData.questions}
        quizSettings={activeQuizData.settings}
        onQuizComplete={handleQuizCompletion}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Quiz Seçimi</h1>
        <p className="text-muted-foreground mt-1">Bilgilerinizi test etmek için bir quiz seçin</p>
      </div>
      <div className="space-y-8">
        <Card className="border-input">
          <CardHeader><CardTitle className="text-lg">1. Quiz Türünü Seç</CardTitle><CardDescription>Hangi formatta quiz çözmek istediğinizi seçin</CardDescription></CardHeader>
          <CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{quizTypes.map((type) => (<div key={type.id} className={`cursor-pointer rounded-lg border p-4 transition-colors hover:border-lilac/50 ${selectedQuizType === type.id ? "border-lilac bg-lilac/10 dark:bg-lilac/20" : "border-input bg-card"} ${(type.disabled ?? false) ? "opacity-50 cursor-not-allowed hover:border-input" : ""}`} onClick={() => {
            if (!(type.disabled ?? false)) {
              setSelectedQuizType(type.id);
              setSelectedTopic(null); 
              if (type.id === 'fill-in-blanks') {
                fetchQuizTopics('fill-in-blanks', currentUserLevel);
                setSelectedQuestionCount("3"); 
              } else if (type.id === 'matching') {
                fetchQuizTopics('match', currentUserLevel);
              }
              else {
                 setSelectedTopicCategory("vocabulary"); 
                 setGrammarTopics([]); 
                 setFillInBlanksQuizTopics([]); 
                 setMatchQuizTopics([]);
                 setSelectedQuestionCount("10"); 
              }
            }
          }}><div className="flex flex-col items-center text-center"><div className={`mb-3 rounded-full p-2 ${selectedQuizType === type.id ? "bg-lilac/20 text-lilac" : "bg-muted text-muted-foreground"}`}><type.icon className="h-6 w-6" /></div><h3 className="font-medium">{type.title}</h3><p className="text-sm text-muted-foreground mt-1">{type.description}</p></div></div>))}</div></CardContent>
        </Card>
        
        <Card className="border-input">
          <CardHeader><CardTitle className="text-lg">2. Quiz Konusunu Seç</CardTitle><CardDescription>Hangi konuda kendinizi test etmek istediğinizi seçin</CardDescription></CardHeader>
          <CardContent><div className="space-y-6">
            {selectedQuizType === "multiple-choice" && ( 
              <div className="flex border-b border-input">
                <button className={`px-4 py-2 font-medium text-sm ${selectedTopicCategory === "vocabulary" ? "border-b-2 border-lilac text-lilac" : "text-muted-foreground hover:text-foreground"}`} onClick={() => { setSelectedTopicCategory("vocabulary"); setSelectedTopic(null); }}>Kelime Bazlı</button>
                <button className={`px-4 py-2 font-medium text-sm ${selectedTopicCategory === "grammar" ? "border-b-2 border-lilac text-lilac" : "text-muted-foreground hover:text-foreground"}`} onClick={() => { setSelectedTopicCategory("grammar"); setSelectedTopic(null); fetchQuizTopics('grammar', currentUserLevel); }}>Gramer Bazlı</button>
                <button className={`px-4 py-2 font-medium text-sm ${selectedTopicCategory === "mixed" ? "border-b-2 border-lilac text-lilac" : "text-muted-foreground hover:text-foreground"}`} onClick={() => { setSelectedTopicCategory("mixed"); setSelectedTopic(null); }}>Karışık</button>
              </div>
            )}
             {(selectedQuizType === "fill-in-blanks" || selectedQuizType === "matching") && (
                <p className="text-sm text-muted-foreground text-center">{selectedQuizType === "fill-in-blanks" ? "Boşluk doldurma" : "Kelime eşleştirme"} quizleri için konu seçin (Seviye: {currentUserLevel}):</p>
            )}
            <RadioGroup value={selectedTopic || ""} onValueChange={setSelectedTopic}><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentAvailableTopics.map((topic) => (<div key={topic.id} className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer ${selectedTopic === topic.id ? "border-lilac bg-lilac/10 dark:bg-lilac/20" : "border-input hover:bg-muted/50"} ${(topic.disabled ?? false) ? "opacity-50 cursor-not-allowed hover:border-input" : ""}`} onClick={() => !(topic.disabled ?? false) && setSelectedTopic(topic.id)}><RadioGroupItem value={topic.id} id={topic.id} disabled={topic.disabled ?? false} className="mt-1" /><Label htmlFor={topic.id} className={`flex-1 ${(topic.disabled ?? false) ? "cursor-not-allowed" : "cursor-pointer"}`}><div><h3 className="font-medium">{topic.title}</h3><p className="text-sm text-muted-foreground mt-1">{topic.description}</p></div></Label></div>))}
            </div></RadioGroup>
            {currentAvailableTopics.length === 0 && !isLoadingTopics && <p className="text-sm text-muted-foreground text-center py-4">Bu kategori veya quiz türü için uygun konu bulunamadı.</p>}
            {isLoadingTopics && <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-lilac" /></div>}
            </div></CardContent>
        </Card>
        
        {selectedQuizType !== "matching" && ( 
            <Card className="border-input">
            <CardHeader><CardTitle className="text-lg">3. Soru Sayısını Belirle</CardTitle><CardDescription>Quizde kaç soru olmasını istediğinizi seçin</CardDescription></CardHeader>
            <CardContent><div className="flex flex-wrap gap-4">
                {questionCountsToDisplay.map((option) => (
                <div 
                    key={option.id} 
                    className={`cursor-pointer rounded-lg border p-4 min-w-[120px] text-center transition-colors hover:border-lilac/50 ${selectedQuestionCount === option.id ? "border-lilac bg-lilac/10 dark:bg-lilac/20" : "border-input bg-card"}`} 
                    onClick={() => {
                        if (selectedQuizType !== 'fill-in-blanks' || option.count === 3) {
                            setSelectedQuestionCount(option.id);
                        }
                    }}>
                    <h3 className="font-medium text-lg">{option.count} Soru</h3>
                    <p className="text-sm text-muted-foreground mt-1">{option.time}</p>
                </div>
                ))}
            </div></CardContent>
            </Card>
        )}

        <Card className="border-input">
          <CardHeader><CardTitle className="text-lg">Quiz Özeti</CardTitle></CardHeader>
          <CardContent>
            {isQuizSelectionComplete() ? ( 
              <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-md"><p className="text-sm text-muted-foreground">Quiz Türü</p><p className="font-medium">{quizTypes.find((type) => type.id === selectedQuizType)?.title}</p></div>
                  <div className="p-3 bg-muted/30 rounded-md"><p className="text-sm text-muted-foreground">Quiz Konusu</p><p className="font-medium">{currentAvailableTopics.find((topic) => topic.id === selectedTopic)?.title}</p></div>
                  {selectedQuizType !== "matching" && (
                    <div className="p-3 bg-muted/30 rounded-md"><p className="text-sm text-muted-foreground">Soru Sayısı</p><p className="font-medium">
                        {selectedQuizType === 'fill-in-blanks' ? 3 : allQuestionCounts.find((count) => count.id === selectedQuestionCount)?.count} Soru
                    </p></div>
                  )}
                  {selectedQuizType === "matching" && (
                     <div className="p-3 bg-muted/30 rounded-md"><p className="text-sm text-muted-foreground">Soru Sayısı</p><p className="font-medium">Tüm Kelimeler</p></div>
                  )}
                  </div></div>
            ) : (
              <div className="flex items-center justify-center p-6 bg-muted/20 rounded-lg border border-dashed border-input"><div className="text-center"><Info className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" /><p className="text-muted-foreground">Quiz başlatmak için lütfen tüm seçimleri tamamlayın.</p></div></div>
            )}
          </CardContent>
          <CardFooter><Button className="w-full bg-lilac hover:bg-lilac/90 text-white py-6 text-lg" disabled={!isQuizSelectionComplete() || isStartingQuiz} onClick={handleStartQuiz}>{isStartingQuiz ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {isStartingQuiz ? "Quiz Hazırlanıyor..." : "Quizi Başlat"}</Button></CardFooter>
        </Card>
      </div>
    </div>
  );
}
