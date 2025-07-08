"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react'; 
import { IExerciseAttempt, IUserAnswer } from '@/models/User'; 
import { Input } from "@/components/ui/input"; 
import { useAuth } from '@/hooks/useAuth'; 
import { useToast } from "@/hooks/use-toast"; 
import { triggerBadgeCheck } from '@/actions/badge-actions';

interface MatchQuizEntry { 
  word: string;
  definition: string;
}

interface QuizQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  wordDetails?: any; 
  questionType?: 'fill-in-blanks' | 'multiple-choice' | 'matching';
  matchPairs?: MatchQuizEntry[]; 
}

interface QuizSettings {
  type: string | null; 
  topic: string | null; 
  topicTitle?: string; 
  category: string;
  count: number; 
  level?: string; 
}

interface QuizSessionManagerProps {
  questions: QuizQuestion[];
  quizSettings: QuizSettings;
  onQuizComplete: (results: IExerciseAttempt) => void;
}

const QuizSessionManager: React.FC<QuizSessionManagerProps> = ({ questions, quizSettings, onQuizComplete }) => {
  const router = useRouter(); 
  const { user, mutate: mutateAuth } = useAuth(); // mutateAuth eklendi
  const { toast } = useToast(); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [isSubmittingResults, setIsSubmittingResults] = useState(false);

  const [selectedWordEntry, setSelectedWordEntry] = useState<MatchQuizEntry | null>(null);
  const [selectedDefinitionText, setSelectedDefinitionText] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); 
  const [shuffledDefinitions, setShuffledDefinitions] = useState<string[]>([]); 

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const currentUserLevel = quizSettings.level || user?.currentLevel?.toUpperCase() || "A1"; 

  useEffect(() => {
    if (currentQuestion?.questionType === 'matching' && currentQuestion.matchPairs) {
      const definitionsOnly = currentQuestion.matchPairs.map(pair => pair.definition);
      setShuffledDefinitions([...definitionsOnly].sort(() => 0.5 - Math.random()));
      setMatches({}); 
      setSelectedWordEntry(null);
      setSelectedDefinitionText(null);
      setIsSubmitted(false); 
    }
  }, [currentQuestion]);

  const handleOptionChange = (value: string) => {
    if (isSubmitted) return; 
    setSelectedOption(value);
  };

  const handleFillInBlankChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitted) return;
    setSelectedOption(event.target.value); 
  };

  const handleWordSelect = (wordEntry: MatchQuizEntry) => {
    if (isSubmitted || matches[wordEntry.word] || isSubmittingResults) return; 
    setSelectedWordEntry(wordEntry);
  };

  const handleDefinitionSelect = (definitionText: string) => {
    if (isSubmitted || Object.values(matches).includes(definitionText) || isSubmittingResults) return; 
    
    if (selectedWordEntry) {
      setMatches(prev => ({ ...prev, [selectedWordEntry.word]: definitionText }));
      setSelectedWordEntry(null);
      setSelectedDefinitionText(null); 
    } else {
      setSelectedDefinitionText(definitionText);
    }
  };
  
  const allWordsMatched = useMemo(() => {
    if (currentQuestion?.questionType !== 'matching' || !currentQuestion.matchPairs) return false;
    return currentQuestion.matchPairs.length === Object.keys(matches).length;
  }, [currentQuestion, matches]);

  const handleSubmitAnswer = () => {
    if (currentQuestion.questionType === 'matching') {
        if (allWordsMatched) {
            setIsSubmitted(true); 
            setShowResults(true); 
        } else {
            toast({title: "Eksik Eşleştirme", description: "Lütfen tüm kelimeleri tanımlarıyla eşleştirin.", variant: "default"});
        }
        return;
    }
    if (!selectedOption && currentQuestion.questionType === 'multiple-choice') {
        return;
    }
    setUserAnswers(prev => ({ ...prev, [currentQuestion.questionId]: selectedOption || "" }));
    setIsSubmitted(true); 
  };

  const handleNextQuestion = () => { 
    if (currentQuestion.questionType !== 'matching') {
        if (!isSubmitted && currentQuestion.questionType === 'multiple-choice' && !selectedOption) {
            return;
        }
        if (!isSubmitted) { 
            setUserAnswers(prev => ({ ...prev, [currentQuestion.questionId]: selectedOption || "" }));
        }
    }
    
    setIsSubmitted(false); 
    setSelectedOption(undefined); 

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setShowResults(true);
    }
  };
  
  const calculateResults = (): IExerciseAttempt => {
    let overallScore = 0;
    let overallCorrectCount = 0;
    let overallIncorrectCount = 0;
    let overallUnansweredCount = 0;
    let totalItemsToMatch = 0; 

    const answeredQuestionsData: IUserAnswer[] = questions.map((q: QuizQuestion) => {
      let userAnswerText = "";
      let isCorrectOverallForQuestion = false; 
      let questionScore = 0;

      if (q.questionType === 'fill-in-blanks') {
        userAnswerText = userAnswers[q.questionId] || "";
        if (userAnswerText) {
            isCorrectOverallForQuestion = userAnswerText.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            if (isCorrectOverallForQuestion) {
                questionScore = 10; 
                overallCorrectCount++;
            } else {
                overallIncorrectCount++;
            }
        } else {
            overallUnansweredCount++;
        }
      } else if (q.questionType === 'matching') {
        const questionMatches = matches; 
        userAnswerText = Object.entries(questionMatches).map(([word, def]) => `${word}: ${def}`).join('; ');
        
        let correctMatchesForThisQuiz = 0;
        totalItemsToMatch = q.matchPairs?.length || 0;

        q.matchPairs?.forEach((pair: MatchQuizEntry) => {
          if (questionMatches[pair.word] === pair.definition) {
            correctMatchesForThisQuiz++;
          }
        });
        
        overallCorrectCount = correctMatchesForThisQuiz; 
        overallIncorrectCount = totalItemsToMatch - correctMatchesForThisQuiz; 
        
        if (totalItemsToMatch > 0) {
            questionScore = Math.round((correctMatchesForThisQuiz / totalItemsToMatch) * 100);
            if (correctMatchesForThisQuiz === totalItemsToMatch) {
                isCorrectOverallForQuestion = true; 
            }
        }
      } else { 
        userAnswerText = userAnswers[q.questionId] || "";
         if (userAnswerText) {
            isCorrectOverallForQuestion = userAnswerText === q.correctAnswer;
            if (isCorrectOverallForQuestion) {
                questionScore = 10; 
                overallCorrectCount++;
            } else {
                overallIncorrectCount++;
            }
        } else {
            overallUnansweredCount++;
        }
      }
      overallScore += questionScore; 
      
      return {
        questionId: q.questionId,
        questionText: q.questionText,
        userAnswer: userAnswerText || "Cevaplanmadı",
        correctAnswer: q.questionType === 'matching' 
            ? (q.matchPairs?.map((p: MatchQuizEntry) => `${p.word}: ${p.definition}`).join('; ') || '') 
            : q.correctAnswer,
        isCorrect: isCorrectOverallForQuestion, 
        explanation: q.explanation,
        options: q.options, 
        questionType: q.questionType || 'multiple-choice',
      };
    });
    
    let finalTotalQuestions = questions.length;
    if (quizSettings.type === 'matching' && questions.length === 1 && totalItemsToMatch > 0) {
        finalTotalQuestions = totalItemsToMatch; 
        overallScore = Math.round(overallScore); 
    } else if (quizSettings.type !== 'matching' && questions.length > 0) {
        overallScore = Math.round((overallCorrectCount / questions.length) * 100);
    } else if (questions.length === 0) {
        overallScore = 0;
    }

    const duration = Math.floor((Date.now() - startTime) / 1000); 
    const exerciseIdForDB = quizSettings.topic || 'unknown-topic';

    return {
      exerciseId: exerciseIdForDB, 
      exerciseType: quizSettings.type || 'quiz',
      category: quizSettings.category,
      topic: quizSettings.topicTitle || quizSettings.topic || 'Genel', 
      level: currentUserLevel, 
      score: overallScore,
      correctCount: overallCorrectCount, 
      incorrectCount: overallIncorrectCount, 
      unansweredCount: overallUnansweredCount, 
      totalQuestions: finalTotalQuestions, 
      duration,
      date: new Date(), 
      answeredQuestions: answeredQuestionsData, 
    };
  };
  
  const handleQuizCompletion = async (results: IExerciseAttempt) => {
    if (isSubmittingResults) return; 
    setIsSubmittingResults(true);

    if (!user) {
        toast({ title: "Hata", description: "Sonuçları kaydetmek için kullanıcı oturumu bulunamadı.", variant: "destructive" });
        setIsSubmittingResults(false);
        return;
    }
    console.log("Quiz Sonuçları (API'ye gönderilecek):", JSON.stringify(results, null, 2));
    try {
        const response = await fetch('/api/user/exercise-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results),
        });
        const apiResult = await response.json();
        if (response.ok && apiResult.success) {
            toast({ title: "İlerleme Kaydedildi", description: "Quiz sonuçlarınız profilinize kaydedildi." });
            
            triggerBadgeCheck().then(badgeResults => {
              badgeResults.forEach(br => {
                if (br.success && br.awardedBadge) {
                  toast({
                    title: "Yeni Rozet Kazandınız!",
                    description: `${br.awardedBadge.name} - ${br.awardedBadge.description}`,
                    duration: 7000, 
                  });
                  mutateAuth(); // Yeni rozet kazanıldığında SWR cache'ini güncelle
                } else if (br.error) {
                  console.warn("Rozet verme hatası:", br.error);
                }
              });
            }).catch(err => console.error("triggerBadgeCheck hatası:", err));

            onQuizComplete(results); 
        } else {
            toast({ title: "Kayıt Hatası", description: apiResult.error || "Quiz sonuçları kaydedilemedi.", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Ağ Hatası", description: "Quiz sonuçları kaydedilirken bir sorun oluştu.", variant: "destructive" });
        console.error("Error saving quiz history:", error);
    } finally {
        setIsSubmittingResults(false);
    }
  };

  if (showResults) {
    const results = calculateResults();
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Quiz Sonuçları: {quizSettings.topicTitle}</CardTitle>
          <CardDescription>Performansınız aşağıda özetlenmiştir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><p className="text-sm text-muted-foreground">Puan</p><p className="text-2xl font-bold">{results.score}</p></div>
            <div><p className="text-sm text-muted-foreground">Doğru</p><p className="text-2xl font-bold text-green-500">{results.correctCount} / {results.totalQuestions}</p></div>
            <div><p className="text-sm text-muted-foreground">Yanlış</p><p className="text-2xl font-bold text-red-500">{results.incorrectCount}</p></div>
            <div><p className="text-sm text-muted-foreground">Boş</p><p className="text-2xl font-bold">{results.unansweredCount}</p></div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Cevap Detayları:</h3>
            {results.answeredQuestions.map((ans: IUserAnswer, idx: number) => ( 
              <div key={idx} className={`p-3 rounded-md border ${ans.isCorrect ? 'border-green-200 bg-green-50' : (ans.userAnswer === "Cevaplanmadı" ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50')}`}>
                <p className="font-medium">{idx + 1}. {ans.questionText}</p>
                {ans.questionType === 'fill-in-blanks' ? (
                  <>
                    <p className={`text-sm ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>Sizin Cevabınız: {ans.userAnswer}</p>
                    {!ans.isCorrect && <p className="text-sm text-blue-700">Doğru Cevap: {ans.correctAnswer}</p>}
                  </>
                ) : ans.questionType === 'matching' ? (
                    <>
                     <p className={`text-sm ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>Sizin Eşleştirmeleriniz: <pre className="whitespace-pre-wrap">{ans.userAnswer}</pre></p>
                     {!ans.isCorrect && <p className="text-sm text-blue-700">Doğru Eşleştirmeler: <pre className="whitespace-pre-wrap">{ans.correctAnswer}</pre></p>}
                    </>
                ) : ( 
                  <>
                    <p className="text-sm">Seçenekler: {ans.options ? ans.options.join(', ') : 'Yok'}</p>
                    <p className={`text-sm ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>Sizin Cevabınız: {ans.userAnswer}</p>
                    {!ans.isCorrect && <p className="text-sm text-blue-700">Doğru Cevap: {ans.correctAnswer}</p>}
                  </>
                )}
                {ans.explanation && <p className="text-xs text-muted-foreground mt-1"><i>Açıklama: {ans.explanation}</i></p>}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleQuizCompletion(results)} className="w-full" disabled={isSubmittingResults}>
            {isSubmittingResults ? "Kaydediliyor..." : "Sonuçları Kaydet ve Çık"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center p-10">Quiz yüklenirken bir sorun oluştu veya soru bulunamadı.</div>;
  }

  if (currentQuestion.questionType === 'matching') {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl">{quizSettings.topicTitle || "Kelime Eşleştirme"}</CardTitle>
                <CardDescription>{currentQuestion.questionText}</CardDescription>
                <Progress value={(Object.keys(matches).length / (currentQuestion.matchPairs?.length || 1)) * 100} className="w-full h-2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-center text-muted-foreground">Kelimeler</h4>
                        {currentQuestion.matchPairs?.map((pair: MatchQuizEntry) => ( 
                            <Button
                                key={`word-${pair.word}`}
                                variant={selectedWordEntry?.word === pair.word ? "secondary" : "outline"}
                                className={`w-full justify-start p-3 h-auto text-left text-sm break-words whitespace-normal 
                                  ${matches[pair.word] ? 'bg-green-100 border-green-400 text-green-700 line-through opacity-50 pointer-events-none' : ''}
                                  ${selectedWordEntry?.word === pair.word ? 'ring-2 ring-purple-500 border-purple-500' : ''}`}
                                onClick={() => handleWordSelect(pair)}
                                disabled={!!matches[pair.word] || isSubmitted || isSubmittingResults}
                            >
                                {pair.word}
                            </Button>
                        ))}
                    </div>
                    <div className="space-y-3">
                         <h4 className="font-semibold text-center text-muted-foreground">Tanımlar</h4>
                        {shuffledDefinitions.map((definitionText: string, index: number) => ( 
                             <Button
                                key={`def-${index}`} 
                                variant={"outline"}
                                className={`w-full justify-start p-3 h-auto text-left text-sm break-words whitespace-normal 
                                  ${Object.values(matches).includes(definitionText) ? 'bg-green-100 border-green-400 text-green-700 line-through opacity-50 pointer-events-none' : ''}
                                  ${selectedWordEntry && !Object.values(matches).includes(definitionText) ? 'hover:bg-purple-100 hover:border-purple-400' : ''}
                                  ${selectedDefinitionText === definitionText ? 'ring-2 ring-purple-500 border-purple-500' : ''}
                                `}
                                onClick={() => handleDefinitionSelect(definitionText)}
                                disabled={Object.values(matches).includes(definitionText) || isSubmitted || isSubmittingResults}
                            >
                                {definitionText}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
                 <Button 
                    onClick={handleSubmitAnswer} 
                    disabled={!allWordsMatched || isSubmitted || isSubmittingResults}
                    className="w-full"
                >
                    {isSubmitted ? "Sonuçlar Hesaplanıyor..." : (allWordsMatched ? "Eşleştirmeyi Bitir & Sonuçları Gör" : "Tüm Kelimeleri Eşleştirin")}
                </Button>
                <Button variant="outline" onClick={() => router.back()} className="w-full" disabled={isSubmittingResults}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Çık
                </Button>
            </CardFooter>
        </Card>
    );
  }

  const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-xl">{quizSettings.topicTitle || "Quiz"} ({currentQuestionIndex + 1} / {questions.length})</CardTitle>
        </div>
        <Progress value={progressValue} className="w-full h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-semibold min-h-[60px]">{currentQuestion.questionText}</p>
        
        {currentQuestion.questionType === 'fill-in-blanks' ? (
          <Input
            type="text"
            value={selectedOption || ""}
            onChange={handleFillInBlankChange}
            placeholder="Cevabınızı buraya yazın..."
            className="border-input focus:border-lilac"
            disabled={isSubmitted || isSubmittingResults}
          />
        ) : ( 
          <RadioGroup value={selectedOption} onValueChange={handleOptionChange} className="space-y-2" disabled={isSubmitted || isSubmittingResults}>
            {currentQuestion.options.map((option: string, index: number) => ( 
              <Label
                key={index}
                htmlFor={`option-${index}`}
                className={`flex items-center space-x-3 rounded-md border p-3 cursor-pointer transition-colors 
                  ${isSubmitted && option === currentQuestion.correctAnswer ? 'bg-green-100 border-green-300' : ''}
                  ${isSubmitted && selectedOption === option && option !== currentQuestion.correctAnswer ? 'bg-red-100 border-red-300' : ''}
                  ${!isSubmitted && selectedOption === option ? 'border-lilac bg-lilac/10' : 'hover:bg-muted/50'}`}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <span>{option}</span>
              </Label>
            ))}
          </RadioGroup>
        )}

        {isSubmitted && currentQuestion.explanation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
            <Info className="inline-block h-4 w-4 mr-1" />
            <strong>Açıklama:</strong> {currentQuestion.explanation}
          </div>
        )}
         {isSubmitted && currentQuestion.questionType === 'fill-in-blanks' && (
          <div className={`mt-4 p-3 rounded-md text-sm ${selectedOption?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'}`}>
            {selectedOption?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? 
              <CheckCircle className="inline-block h-4 w-4 mr-1" /> : 
              <XCircle className="inline-block h-4 w-4 mr-1" />}
            Doğru Cevap: <strong>{currentQuestion.correctAnswer}</strong>
          </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmittingResults} > 
          <ChevronLeft className="mr-2 h-4 w-4" /> Çık
        </Button>
        {!isSubmitted ? (
            <Button onClick={handleSubmitAnswer} disabled={(currentQuestion.questionType === 'multiple-choice' && !selectedOption) || isSubmittingResults}>
                Cevabı Gönder <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        ) : (
            <Button onClick={() => handleNextQuestion()} disabled={isSubmittingResults}>
                {currentQuestionIndex < questions.length - 1 ? "Sonraki Soru" : "Sonuçları Gör"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizSessionManager;
