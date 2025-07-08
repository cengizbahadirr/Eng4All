"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ListPlus, Sparkles, AlertTriangle, Info, BookOpen } from 'lucide-react';
import { getRepetitionList, generateRepetitionList, markWordAsReviewed, addWordToRepetitionList } from '@/actions/repetition-actions';
import { IWord } from '@/models/Word';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import debounce from 'lodash.debounce';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RepetitionItem {
  wordId: number;
  status: 'pending' | 'reviewed';
  addedAt: Date;
  wordDetails: IWord | null;
}

export default function RepetitionListPage() {
  const [list, setList] = useState<RepetitionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Manuel Ekleme Modal State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<IWord | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchList = useCallback(async () => {
    const result = await getRepetitionList();
    if (result.success) {
      setList(result.list as RepetitionItem[]);
    } else {
      setError(result.error || "Liste getirilirken bir hata oluştu.");
      setList([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchList();
  }, [fetchList]);

  const handleGenerateList = async () => {
    setIsLoading(true);
    const result = await generateRepetitionList();
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      await fetchList(); // En güvenilir yöntem olarak listeyi yeniden çekiyoruz.
    } else {
      toast({ title: "Hata", description: result.error, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleMarkAsReviewed = async (wordId: number) => {
    const result = await markWordAsReviewed(wordId);
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      setList(prevList => 
        prevList.map(item => 
          item.wordId === wordId ? { ...item, status: 'reviewed' } : item
        )
      );
    } else {
      toast({ title: "Hata", description: result.error, variant: "destructive" });
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      try {
        const response = await fetch(`/api/words/search?query=${query}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Arama hatası:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, debouncedSearch]);

  const handleAddWord = async () => {
    if (!selectedWord) return;
    setIsAdding(true);
    
    const result = await addWordToRepetitionList(selectedWord.id);
    
    if (result.success) {
      toast({ title: "Başarılı!", description: result.message });
      setIsModalOpen(false);
      setSearchQuery('');
      setSelectedWord(null);
      await fetchList();
    } else {
      toast({ title: "Hata!", description: result.error, variant: "destructive" });
    }
    setIsAdding(false);
  };

  const renderWordList = () => (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Kelime Tekrar Listesi</h1>
        <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
          Öğrenmekte zorlandığınız kelimeleri burada tekrar edin.
        </p>
      </div>
      <div className="mb-6 flex justify-center gap-4">
        <Button onClick={handleGenerateList} disabled={isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          Listeyi Güncelle
        </Button>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><ListPlus className="mr-2 h-4 w-4" /> Manuel Ekle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tekrar Listesine Manuel Kelime Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Aramak için kelime yazın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && <p className="text-sm text-muted-foreground">Aranıyor...</p>}
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((word) => (
                  <li
                    key={word.id}
                    onClick={() => setSelectedWord(word)}
                    className={`p-2 rounded cursor-pointer ${selectedWord?.id === word.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                  >
                    {word.value.word} - {word.value.turkish_word}
                  </li>
                ))}
              </ul>
              <Button onClick={handleAddWord} disabled={!selectedWord || isAdding} className="w-full">
                {isAdding ? "Ekleniyor..." : "Seçili Kelimeyi Ekle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tekrar Edilecek Kelimeler</CardTitle>
          <CardDescription>
            Aşağıdaki kelimeleri tekrar ederek öğrenmenizi pekiştirin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {list.map((item) => (
              item.wordDetails && (
                <AccordionItem key={item.wordId} value={String(item.wordId)}>
                  <AccordionTrigger className={`flex justify-between items-center ${item.status === 'reviewed' ? 'text-muted-foreground line-through' : ''}`}>
                    <div className="flex items-center gap-2">
                      {item.status === 'reviewed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      <span>{item.wordDetails.value.word}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-2">
                      <p><strong className="font-semibold">Anlamı:</strong> {item.wordDetails.value.turkish_word}</p>
                      <p><strong className="font-semibold">Türü:</strong> {item.wordDetails.value.type}</p>
                      {item.wordDetails.value.examples && (
                        <p className="italic">"{item.wordDetails.value.examples[0]}"</p>
                      )}
                      {item.status === 'pending' && (
                        <Button size="sm" className="mt-2" onClick={() => handleMarkAsReviewed(item.wordId)}>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Tekrar Ettim
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {isLoading ? (
        <div className="text-center py-10">
          <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-8 w-1/3 mx-auto" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">
          <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
          <p>{error}</p>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tekrar Listeniz Henüz Boş</h2>
          <p className="text-muted-foreground mb-6">Yanlış yaptığınız kelimelerden veya manuel ekleyerek özel bir tekrar listesi oluşturalım.</p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleGenerateList} disabled={isLoading} size="lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Otomatik Liste Oluştur
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg"><ListPlus className="mr-2 h-5 w-5" /> Manuel Ekle</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tekrar Listesine Manuel Kelime Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Aramak için kelime yazın..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching && <p className="text-sm text-muted-foreground">Aranıyor...</p>}
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((word) => (
                      <li
                        key={word.id}
                        onClick={() => setSelectedWord(word)}
                        className={`p-2 rounded cursor-pointer ${selectedWord?.id === word.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                      >
                        {word.value.word} - {word.value.turkish_word}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={handleAddWord} disabled={!selectedWord || isAdding} className="w-full">
                    {isAdding ? "Ekleniyor..." : "Seçili Kelimeyi Ekle"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Kelime Tekrar Listesi</h1>
            <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
              Öğrenmekte zorlandığınız kelimeleri burada tekrar edin.
            </p>
          </div>
          <div className="mb-6 flex justify-center gap-4">
            <Button onClick={handleGenerateList} disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Listeyi Güncelle
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><ListPlus className="mr-2 h-4 w-4" /> Manuel Ekle</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tekrar Listesine Manuel Kelime Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Aramak için kelime yazın..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching && <p className="text-sm text-muted-foreground">Aranıyor...</p>}
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((word) => (
                      <li
                        key={word.id}
                        onClick={() => setSelectedWord(word)}
                        className={`p-2 rounded cursor-pointer ${selectedWord?.id === word.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                      >
                        {word.value.word} - {word.value.turkish_word}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={handleAddWord} disabled={!selectedWord || isAdding} className="w-full">
                    {isAdding ? "Ekleniyor..." : "Seçili Kelimeyi Ekle"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Tekrar Edilecek Kelimeler</CardTitle>
              <CardDescription>
                Aşağıdaki kelimeleri tekrar ederek öğrenmenizi pekiştirin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {list.map((item) => (
                  item.wordDetails && (
                    <AccordionItem key={item.wordId} value={String(item.wordId)}>
                      <AccordionTrigger className={`flex justify-between items-center ${item.status === 'reviewed' ? 'text-muted-foreground line-through' : ''}`}>
                        <div className="flex items-center gap-2">
                          {item.status === 'reviewed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                          <span>{item.wordDetails.value.word}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-2">
                          <p><strong className="font-semibold">Anlamı:</strong> {item.wordDetails.value.turkish_word}</p>
                          <p><strong className="font-semibold">Türü:</strong> {item.wordDetails.value.type}</p>
                          {item.wordDetails.value.examples && (
                            <p className="italic">"{item.wordDetails.value.examples[0]}"</p>
                          )}
                          {item.status === 'pending' && (
                            <Button size="sm" className="mt-2" onClick={() => handleMarkAsReviewed(item.wordId)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Tekrar Ettim
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
