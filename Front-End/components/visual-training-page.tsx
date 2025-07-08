"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Video, PlayCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface IVideoEntry {
  url: string;
  title: string;
}

interface IVideoCategories {
  [key: string]: IVideoEntry[];
}

// Gemini'nin önerdiği, iyileştirilmiş getYouTubeVideoId fonksiyonu
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const categoryDisplayNames: { [key: string]: string } = {
  kelime: "Kelime Bilgisi",
  gramer: "Gramer",
  konusma: "Konuşma Pratiği",
  isIngilizcesi: "İş İngilizcesi",
  diger: "Diğer", // "Diğer" kategorisi eklendi
};

export default function VisualTrainingPage() {
  const [videoData, setVideoData] = useState<IVideoCategories | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [playingVideo, setPlayingVideo] = useState<IVideoEntry | null>(null);

  useEffect(() => {
    const fetchVideoLinks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/video-links');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          setVideoData(result.data);
          const firstCategory = Object.keys(result.data)[0];
          if (firstCategory) {
            setActiveTab(firstCategory);
          }
        } else {
          throw new Error(result.error || "Video verileri alınamadı.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoLinks();
  }, []);

  const renderVideoPlayerModal = () => {
    if (!playingVideo) return null;
    const videoId = getYouTubeVideoId(playingVideo.url);
    if (!videoId) return null;

    return (
      <Dialog open={!!playingVideo} onOpenChange={(isOpen) => !isOpen && setPlayingVideo(null)}>
        <DialogContent className="max-w-3xl p-0 border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{playingVideo.title}</DialogTitle>
          </DialogHeader>
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={playingVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            ></iframe>
          </AspectRatio>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <Skeleton className="h-8 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-0">
                 <Skeleton className="aspect-[16/9] w-full" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Bir Hata Oluştu</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Sayfayı Yenile
        </Button>
      </div>
    );
  }

  if (!videoData || Object.keys(videoData).length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 text-center">
        <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Video Bulunamadı</h2>
        <p className="text-muted-foreground">Gösterilecek görsel eğitim materyali bulunmamaktadır.</p>
      </div>
    );
  }

  // İçinde en az bir video olan ve adı boş olmayan kategorileri filtrele
  const categories = Object.keys(videoData).filter(
    key => key && videoData[key] && videoData[key].length > 0
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {renderVideoPlayerModal()}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Görsel Eğitim Materyalleri</h1>
        <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
          İngilizce becerilerinizi geliştirmek için çeşitli konularda eğitici videolar izleyin.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto flex flex-wrap justify-center mb-6">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {categoryDisplayNames[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(videoData[category] || []).map((video, index) => {
                const videoId = getYouTubeVideoId(video.url);
                const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '/placeholder.jpg';

                return (
                  <Card 
                    key={`${category}-${index}`} 
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group cursor-pointer"
                    onClick={() => videoId && setPlayingVideo(video)}
                  >
                    <CardHeader className="p-0 relative">
                      <AspectRatio ratio={16 / 9} className="bg-muted">
                        <img
                          src={thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => { 
                            // Resim yüklenemezse placeholder göster
                            e.currentTarget.src = '/placeholder.jpg'; 
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <PlayCircle className="h-16 w-16 text-white/80" />
                        </div>
                      </AspectRatio>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <CardTitle className="text-base font-semibold leading-tight mb-1">
                        <span className="line-clamp-2">
                          {video.title || "Başlıksız Video"}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-auto">
                        Kategori: {categoryDisplayNames[category] || category}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
              {(videoData[category] || []).length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  Bu kategoride henüz video bulunmamaktadır.
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
