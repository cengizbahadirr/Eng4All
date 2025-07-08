"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchIcon, AlertCircle, Volume2 as Volume2Icon } from "lucide-react";

// API'den gelen her bir sonucun yapısını tanımlayan arayüz
interface FetchedWordData {
  _id: string;
  id: number;
  value: {
    word: string;
    href?: string;
    type?: string;
    level?: string;
    us?: { mp3?: string; ogg?: string };
    uk?: { mp3?: string; ogg?: string };
    phonetics?: { us?: string; uk?: string };
    examples?: string[];
    type_tr?: string;
    examples_tr?: string[];
    [key: string]: any;
  };
  word: string;
  translation: string;
  examples_en: string[];
  examples_tr: string[];
  level?: string;
  type?: string;
  type_tr?: string;
}

export default function SearchPageClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<FetchedWordData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const newAudio = new Audio(audioSrc);
    newAudio.play().catch(e => console.error("Ses çalma hatası:", e));
    audioRef.current = newAudio;
  };

  const performSearch = async (termToSearch: string) => {
    if (!termToSearch.trim()) {
      // setError("Lütfen aramak istediğiniz kelimeyi giriniz."); // Bu, kullanıcı manuel arama yapmadığında kafa karıştırıcı olabilir
      setResults(null);
      setNotFound(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setNotFound(false);
    // Arama çubuğundaki terimi de senkronize et (URL'den geliyorsa)
    if (searchTerm !== termToSearch) {
        setSearchTerm(termToSearch);
    }

    try {
      const response = await fetch(`/api/search?term=${encodeURIComponent(termToSearch.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
          setResults(null);
          setError(data.message || `"${termToSearch}" kelimesi bulunamadı.`);
        } else {
          throw new Error(data.error || `API Hatası: ${response.status}`);
        }
      } else if (data && Array.isArray(data) && data.length > 0) {
        const apiData = data as FetchedWordData[];
        setResults(apiData);
        setNotFound(false);
        setError(null);
      } else {
        setResults(null);
        setNotFound(true);
        setError(null);
      }
    } catch (err) {
      console.error("Arama sırasında hata:", err);
      const errorMessage = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      setError(`Arama sırasında bir sorun oluştu: ${errorMessage}`);
      setResults(null);
      setNotFound(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // URL'i güncelleyerek arama terimini yansıt
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`, { scroll: false });
    // useEffect zaten searchParams değişikliğini yakalayıp performSearch'ü çağıracak.
    // Veya doğrudan performSearch(searchTerm) çağrılabilir, ancak URL'i güncellemek daha iyi.
  };

  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam && queryParam.trim() !== "") {
      // setSearchTerm(queryParam); // Bu satır performSearch içinde yapılıyor
      performSearch(queryParam);
    } else if (!queryParam && results) { // URL'de q yoksa ve sonuçlar varsa temizle
        // setResults(null);
        // setSearchTerm("");
        // setError(null);
        // setNotFound(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Sadece searchParams değiştiğinde çalışır

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SearchIcon className="mr-2 h-6 w-6" />
            Kelime Ara
          </CardTitle>
          <CardDescription>
            Türkçe veya İngilizce kelime arayarak çevirilerini ve örnek kullanımlarını bulun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Aranacak kelimeyi girin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Aranıyor..." : "Ara"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="text-center">
          <p>Sonuçlar yükleniyor...</p>
        </div>
      )}

      {notFound && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sonuç Bulunamadı</AlertTitle>
          <AlertDescription>
            Aradığınız "{searchParams.get("q") || searchTerm}" kelimesi bulunamadı. Lütfen farklı bir kelime deneyin veya yazımı kontrol edin.
          </AlertDescription>
        </Alert>
      )}

      {results && !isLoading && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Arama Sonuçları ({searchParams.get("q") || searchTerm})</h2>
          {results.map((result, index) => (
            <Card key={result._id || index} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">{result.word}</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Çeviri: {result.translation}
                  {result.level && <span className="ml-2 py-0.5 px-1.5 rounded-md text-xs bg-muted text-muted-foreground">Seviye: {result.level}</span>}
                  {result.type && <span className="ml-2 italic">({result.type})</span>}
                  {result.type_tr && result.type !== result.type_tr && <span className="ml-2 italic">({result.type_tr})</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm md:text-base">
                {result.examples_en && result.examples_en.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Örnek Cümleler (İngilizce):</h4>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                      {result.examples_en.map((ex: string, i: number) => (
                        <li key={`en-${index}-${i}`}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.examples_tr && result.examples_tr.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Örnek Cümleler (Türkçe):</h4>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                      {result.examples_tr.map((ex: string, i: number) => (
                        <li key={`tr-${index}-${i}`}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(!result.examples_en || result.examples_en.length === 0) &&
                 (!result.examples_tr || result.examples_tr.length === 0) && (
                   <p className="text-muted-foreground">Bu kelime için örnek cümle bulunmamaktadır.</p>
                )}
                {result.value?.phonetics?.us && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>US Fonetik: {result.value.phonetics.us}</span>
                    {result.value?.us?.mp3 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-6 w-6"
                        onClick={() => playAudio(result.value.us!.mp3!)}
                        aria-label="US Telaffuzunu Dinle"
                      >
                        <Volume2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                {result.value?.phonetics?.uk && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span>UK Fonetik: {result.value.phonetics.uk}</span>
                    {result.value?.uk?.mp3 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-6 w-6"
                        onClick={() => playAudio(result.value.uk!.mp3!)}
                        aria-label="UK Telaffuzunu Dinle"
                      >
                        <Volume2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
