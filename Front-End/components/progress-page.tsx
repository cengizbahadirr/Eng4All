"use client"

import { useState } from "react"
import { Clock, BookOpen, CheckSquare, Flame } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState("overview")

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
            Kelime Bilgisi
          </TabsTrigger>
          <TabsTrigger value="grammar" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Gramer
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Quizler
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
                <div className="text-2xl font-bold">42.5 saat</div>
                <p className="text-xs text-muted-foreground">+2.5 saat geçen haftaya göre</p>
              </CardContent>
            </Card>

            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Öğrenilen Kelimeler</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,245</div>
                <p className="text-xs text-muted-foreground">+78 geçen haftaya göre</p>
              </CardContent>
            </Card>

            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamamlanan Quizler</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+3 geçen haftaya göre</p>
              </CardContent>
            </Card>

            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Günlük Seri</CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15 gün</div>
                <p className="text-xs text-muted-foreground">Rekorunuz: 32 gün</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Haftalık Aktivite</CardTitle>
              <CardDescription>Son 7 gündeki çalışma aktiviteniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end justify-between">
                {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div
                      className="bg-lilac/80 w-12 rounded-t-md"
                      style={{ height: `${Math.max(20, Math.random() * 150)}px` }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Kelime Öğrenme İlerlemesi</CardTitle>
              <CardDescription>Seviye bazında öğrendiğiniz kelimeler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">A1 Seviyesi</span>
                  <span className="text-sm text-muted-foreground">95%</span>
                </div>
                <Progress value={95} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">A2 Seviyesi</span>
                  <span className="text-sm text-muted-foreground">82%</span>
                </div>
                <Progress value={82} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">B1 Seviyesi</span>
                  <span className="text-sm text-muted-foreground">67%</span>
                </div>
                <Progress value={67} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">B2 Seviyesi</span>
                  <span className="text-sm text-muted-foreground">43%</span>
                </div>
                <Progress value={43} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">C1 Seviyesi</span>
                  <span className="text-sm text-muted-foreground">18%</span>
                </div>
                <Progress value={18} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grammar" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Gramer Konuları İlerlemesi</CardTitle>
              <CardDescription>Tamamladığınız gramer konuları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Temel Zamanlar</span>
                    <span className="text-sm text-muted-foreground">100%</span>
                  </div>
                  <Progress value={100} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Modallar</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Koşul Cümleleri</span>
                    <span className="text-sm text-muted-foreground">70%</span>
                  </div>
                  <Progress value={70} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Pasif Yapılar</span>
                    <span className="text-sm text-muted-foreground">55%</span>
                  </div>
                  <Progress value={55} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Dolaylı Anlatım</span>
                    <span className="text-sm text-muted-foreground">30%</span>
                  </div>
                  <Progress value={30} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Quiz Performansı</CardTitle>
              <CardDescription>Son 10 quizdeki performansınız</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-lilac/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-lilac">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">B1 Seviye Quiz {i + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{Math.floor(70 + Math.random() * 30)}%</span>
                      <div className="w-16 h-2 bg-lilac/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-lilac"
                          style={{ width: `${Math.floor(70 + Math.random() * 30)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
