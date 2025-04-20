"use client"

import { useState } from "react"
import { ChevronDown, Medal, Search, Trophy, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Sahte kullanıcı verileri
  const users = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      points: 3250,
      streak: 45,
      level: "B2",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Zeynep Kaya",
      points: 3120,
      streak: 62,
      level: "B2",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Mehmet Demir",
      points: 2980,
      streak: 38,
      level: "B1",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Ayşe Çelik",
      points: 2845,
      streak: 29,
      level: "B1",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      name: "Mustafa Şahin",
      points: 2790,
      streak: 33,
      level: "B1",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 6,
      name: "Elif Yıldız",
      points: 2650,
      streak: 27,
      level: "A2",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 7,
      name: "Burak Öztürk",
      points: 2540,
      streak: 21,
      level: "B1",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 8,
      name: "Selin Aydın",
      points: 2480,
      streak: 19,
      level: "A2",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 9,
      name: "Emre Kara",
      points: 2350,
      streak: 15,
      level: "A2",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 10,
      name: "Deniz Koç",
      points: 2290,
      streak: 12,
      level: "A2",
      avatarUrl: "/placeholder.svg?height=40&width=40",
    },
  ]

  // Filtreleme fonksiyonu
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Puan Tabloları</h1>
        <p className="text-muted-foreground mt-1">Diğer öğrencilerle rekabet edin ve sıralamanızı görün</p>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kullanıcı ara..."
            className="pl-8 bg-muted focus:border-lilac focus:ring-lilac"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          Filtrele
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="global" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Genel Sıralama
          </TabsTrigger>
          <TabsTrigger value="friends" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Arkadaşlarım
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Haftalık
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
            Aylık
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>En İyi 10 Kullanıcı</CardTitle>
              <CardDescription>Tüm zamanların en yüksek puanlı kullanıcıları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                        {index === 0 ? (
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="h-6 w-6 text-gray-400" />
                        ) : index === 2 ? (
                          <Medal className="h-6 w-6 text-amber-600" />
                        ) : (
                          <span className="text-lg font-medium text-muted-foreground">{index + 1}</span>
                        )}
                      </div>
                      <Avatar className="h-10 w-10 border-2 border-lilac">
                        <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-lilac/20 text-lilac">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {user.level}
                          </Badge>
                          <span>🔥 {user.streak} gün</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <span>{user.points}</span>
                      <span className="text-xs text-muted-foreground">puan</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Sizin Sıralamanız</CardTitle>
              <CardDescription>Genel sıralamadaki yeriniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-2 rounded-lg bg-lilac/5">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium w-8 text-center">7</span>
                  <Avatar className="h-10 w-10 border-2 border-lilac">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Alperen Yılmaz" />
                    <AvatarFallback className="bg-lilac/20 text-lilac">A</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Alperen Yılmaz</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        B1
                      </Badge>
                      <span>🔥 15 gün</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <span>2540</span>
                  <span className="text-xs text-muted-foreground">puan</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Arkadaşlarınız</CardTitle>
              <CardDescription>Arkadaşlarınız arasındaki sıralama</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Henüz arkadaşınız yok</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Arkadaşlarınızı ekleyerek onlarla rekabet edebilirsiniz.
                </p>
                <Button className="bg-lilac hover:bg-lilac/90 text-white">Arkadaş Ekle</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Haftalık Sıralama</CardTitle>
              <CardDescription>Bu haftanın en yüksek puanlı kullanıcıları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers
                  .slice()
                  .sort(() => Math.random() - 0.5)
                  .map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8">
                          {index === 0 ? (
                            <Trophy className="h-6 w-6 text-yellow-500" />
                          ) : index === 1 ? (
                            <Medal className="h-6 w-6 text-gray-400" />
                          ) : index === 2 ? (
                            <Medal className="h-6 w-6 text-amber-600" />
                          ) : (
                            <span className="text-lg font-medium text-muted-foreground">{index + 1}</span>
                          )}
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-lilac">
                          <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-lilac/20 text-lilac">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {user.level}
                            </Badge>
                            <span>🔥 {user.streak} gün</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-medium">
                        <span>{Math.floor(user.points / 10)}</span>
                        <span className="text-xs text-muted-foreground">puan</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Aylık Sıralama</CardTitle>
              <CardDescription>Bu ayın en yüksek puanlı kullanıcıları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers
                  .slice()
                  .sort(() => Math.random() - 0.5)
                  .map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8">
                          {index === 0 ? (
                            <Trophy className="h-6 w-6 text-yellow-500" />
                          ) : index === 1 ? (
                            <Medal className="h-6 w-6 text-gray-400" />
                          ) : index === 2 ? (
                            <Medal className="h-6 w-6 text-amber-600" />
                          ) : (
                            <span className="text-lg font-medium text-muted-foreground">{index + 1}</span>
                          )}
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-lilac">
                          <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-lilac/20 text-lilac">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {user.level}
                            </Badge>
                            <span>🔥 {user.streak} gün</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-medium">
                        <span>{Math.floor(user.points / 3)}</span>
                        <span className="text-xs text-muted-foreground">puan</span>
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
