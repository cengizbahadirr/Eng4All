"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Check, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ISynonymData {
  word: string;
  synonyms: string[];
}

export default function SynonymPracticePage() {
  const [synonymData, setSynonymData] = useState<ISynonymData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { toast } = useToast();

  const fetchSynonym = useCallback(async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setError(null);
    try {
      const response = await fetch('/api/synonyms/random');
      const result = await response.json();
      if (result.success) {
        setSynonymData(result.data);
      } else {
        throw new Error(result.error || "Veri alınamadı.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSynonym();
  }, [fetchSynonym]);

  useEffect(() => {
    if (synonymData) {
      const correctAnswer = synonymData.synonyms[0];
      const wrongOptions = ["apple", "run", "beautiful", "quickly"].filter(opt => !synonymData.synonyms.includes(opt));
      const shuffledOptions = [correctAnswer, ...wrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5);
      setOptions(shuffledOptions);
    }
  }, [synonymData]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || !synonymData) return; // synonymData yoksa işlem yapma

    setSelectedAnswer(answer);
    if (synonymData?.synonyms.includes(answer)) {
      setIsCorrect(true);
      toast({
        title: "Doğru!",
        description: `"${answer}" kelimesi, "${synonymData.word}" için doğru bir eş anlamlıdır.`,
        variant: "default",
        className: "bg-green-100 border-green-300 text-green-800",
      });
    } else {
      setIsCorrect(false);
      toast({
        title: "Yanlış!",
        description: `Doğru cevaplardan biri "${synonymData.synonyms[0]}" olabilirdi.`,
        variant: "destructive",
      });
    }
  };

  const getButtonClass = (option: string) => {
    if (!selectedAnswer) {
      return "bg-background hover:bg-accent";
    }
    if (option === selectedAnswer) {
      return isCorrect ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white";
    }
    if (synonymData?.synonyms.includes(option)) {
      return "bg-green-200 text-green-800";
    }
    return "bg-background opacity-50";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
        <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-24 w-full mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Bir Hata Oluştu</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchSynonym} className="mt-4">Tekrar Dene</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Eş Anlamlı Alıştırması</CardTitle>
          <CardDescription className="text-center">
            Verilen kelimenin eş anlamlısını seçenekler arasından bulun.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-lg text-muted-foreground">Kelime:</p>
            <p className="text-4xl font-bold tracking-wider">{synonymData?.word}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 text-lg justify-center transition-all duration-300 ${getButtonClass(option)}`}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
              >
                {option}
                {selectedAnswer === option && (isCorrect ? <Check className="ml-2 h-5 w-5" /> : <X className="ml-2 h-5 w-5" />)}
              </Button>
            ))}
          </div>
          {selectedAnswer && (
            <div className="text-center">
              <Button onClick={fetchSynonym}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Yeni Kelime
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
