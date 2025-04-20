"use client"

import { useState } from "react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, BookOpen, Filter, Search, Star, ThumbsUp } from "lucide-react"

export function VisualTrainingPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Örnek video verileri
  const videos = [
    {
      id: 1,
      title: "İngilizce Temel Kelimeler",
      description: "Günlük hayatta en çok kullanılan 100 İngilizce kelime",
      duration: "15:30",
      level: "Başlangıç",
      category: "vocabulary",
      views: 1250,
      likes: 120,
      thumbnail: "/placeholder.svg?height=180&width=320",
    },
    {
      id: 2,
      title: "Present Simple Tense",
      description: "Geniş zaman kullanımı ve örnekleri",
      duration: "12:45",
      level: "Başlangıç",
      category: "grammar",
      views: 980,
      likes: 95,
      thumbnail: "/placeholder.svg?height=180&width=320",
    },
    {
      id: 3,
      title: "İngilizce Konuşma Pratiği",
      description: "Günlük diyaloglar ve pratik önerileri",
      duration: "22:10",
      level: "Orta",
      category: "speaking",
      views: 1560,
      likes: 210,
      thumbnail: "/placeholder.svg?height=180&width=320",
    },
    {
      id: 4,
      title: "İş İngilizcesi",
      description: "İş görüşmelerinde kullanabileceğiniz ifadeler",
      duration: "18:20",
      level: "İleri",
      category: "business",
      views: 750,
      likes: 85,
      thumbnail: "/placeholder.svg?height=180&width=320",
    },
  ]

  // Filtreleme fonksiyonu
  const filteredVideos = videos.filter((video) => {
    // Tab filtreleme
    if (activeTab !== "all" && video.category !== activeTab) return false

    // Arama filtreleme
    if (
      searchQuery &&
      !video.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !video.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Görsel ve Videolu Eğitimler</h1>
          <p className="text-muted-foreground">
            İngilizce öğrenmenizi hızlandıracak görsel ve videolu eğitim içerikleri
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Video ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="vocabulary">Kelime</TabsTrigger>
          <TabsTrigger value="grammar">Gramer</TabsTrigger>
          <TabsTrigger value="speaking">Konuşma</TabsTrigger>
          <TabsTrigger value="business">İş İngilizcesi</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vocabulary" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grammar" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="speaking" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="business" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface VideoCardProps {
  video: {
    id: number
    title: string
    description: string
    duration: string
    level: string
    category: string
    views: number
    likes: number
    thumbnail: string
  }
}

function VideoCard({ video }: VideoCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full h-48 object-cover" />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {video.duration}
        </div>
        <Button
          variant="default"
          size="icon"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-lilac/90 hover:bg-lilac"
        >
          <PlayCircle className="h-8 w-8" />
        </Button>
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{video.title}</CardTitle>
          <Badge variant="outline" className="ml-2 shrink-0">
            {video.level}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 mt-1">{video.description}</CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-1" />
          {video.views} izlenme
        </div>
        <div className="flex items-center">
          <ThumbsUp className="h-4 w-4 mr-1" />
          {video.likes} beğeni
        </div>
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          <Star className="h-4 w-4 mr-1" />
          Kaydet
        </Button>
      </CardFooter>
    </Card>
  )
}
