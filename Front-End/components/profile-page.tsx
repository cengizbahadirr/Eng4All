"use client"

import { useState, useEffect } from "react"
import { Award, BookOpen, Calendar, Edit, Settings, Trophy, Upload, Eye, EyeOff, CheckCircle, XCircle, Image as ImageIcon, CheckCircle2 } from "lucide-react" // CheckCircle2 yerine CheckCircle olmalıydı, düzeltildi ve ImageIcon eklendi
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge as UiBadge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
// Input bileşeni artık kullanılmıyor (dosya yükleme kaldırıldığı için)
// import { Input } from "@/components/ui/input" 
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { LevelAssessmentTest } from "@/components/level-assessment-test/level-assessment-test"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { updateUserCurrentLevel, updateUserProfilePicture, updateUserBadgeVisibility, updateUserAvatar } from "@/actions/profile-actions";
import Image from 'next/image';

interface Badge {
  badgeId: string;
  name: string;
  description?: string;
  iconUrl: string;
  earnedAt: Date;
  isVisible?: boolean;
}

const localStockAvatars = [
  { id: 'male1', gender: 'male', url: '/images/avatars/male1.png' },
  { id: 'male2', gender: 'male', url: '/images/avatars/male2.png' },
  { id: 'male3', gender: 'male', url: '/images/avatars/male3.png' },
  { id: 'female1', gender: 'female', url: '/images/avatars/female1.png' },
  { id: 'female2', gender: 'female', url: '/images/avatars/female2.png' },
  { id: 'female3', gender: 'female', url: '/images/avatars/female3.png' },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showLevelTest, setShowLevelTest] = useState(false)
  const [isUploading, setIsUploading] = useState(false); 
  const [showBadgeSettings, setShowBadgeSettings] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [selectedStockAvatar, setSelectedStockAvatar] = useState<string | null>(null);

  const { toast } = useToast()
  const { user, isLoading: isAuthLoading, isError: authError, mutate: mutateAuth } = useAuth();
  
  const userData = {
    id: user?._id?.toString() || "1",
    name: user?.name || "Kullanıcı Adı",
    avatarUrl: user?.avatarUrl || "/placeholder-user.jpg", 
    level: user?.currentLevel || "Belirlenmedi", 
    points: user?.points || 0,
    successPercentage: user?.successPercentage || 0, 
    badges: user?.badges || [], 
    streak: user?.streakCount || 0,
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("tr-TR", { year: 'numeric', month: 'long' }) : "Bilinmiyor",
    bio: "İngilizce öğrenmeye hevesli bir öğrenci.", 
    stats: {
      wordsLearned: user?.points || 0, 
      correctAnswerRate: `${user?.successPercentage?.toFixed(1) || 0}%`, 
    },
  }

  const handleStockAvatarSave = async () => {
    if (!selectedStockAvatar) {
      toast({ title: "Hata", description: "Lütfen bir avatar seçin.", variant: "destructive" });
      return;
    }
    setIsUploading(true); 
    try {
      const result = await updateUserAvatar(selectedStockAvatar); 
      if (result.success && result.avatarUrl) {
        toast({ title: "Başarılı", description: "Avatarınız güncellendi." });
        mutateAuth();
        setShowAvatarSelection(false); 
        setSelectedStockAvatar(null);
      } else {
        toast({ title: "Hata", description: result.error || "Avatar güncellenirken bir sorun oluştu.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Hata", description: "Avatar güncellenirken bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLevelTestComplete = async (level: string) => {
    setShowLevelTest(false);
    toast({
      title: "Seviye Testi Tamamlandı!",
      description: `Seviyeniz ${level} olarak belirlendi. Profilinize kaydediliyor...`,
    });

    const result = await updateUserCurrentLevel(level); 
    if (result.success && result.newLevel) {
      toast({
        title: "Başarılı!",
        description: `Seviyeniz (${result.newLevel}) profilinize başarıyla kaydedildi.`,
      });
      mutateAuth(); 
    } else {
      toast({
        variant: "destructive",
        title: "Hata",
        description: result.error || "Seviyeniz kaydedilirken bir sorun oluştu.",
      });
    }
  };
  
  if (isAuthLoading) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (authError || !user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <p className="text-muted-foreground">Kullanıcı bilgileri yüklenemedi veya giriş yapılmamış.</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profilim</h1>
        <p className="text-muted-foreground mt-1">Kişisel bilgilerinizi ve istatistiklerinizi görüntüleyin</p>
      </div>

      <Card className="border-lilac/20 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                <AvatarFallback className="bg-lilac/20 text-lilac text-4xl">{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Dialog open={showAvatarSelection} onOpenChange={setShowAvatarSelection}>
                  <DialogTrigger asChild>
                     <Button size="sm" variant="outline" className="text-xs bg-white/80 hover:bg-white">
                        <ImageIcon className="h-3 w-3 mr-1" /> Avatar Seç
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Stok Avatar Seç</DialogTitle>
                      <DialogDescription>Beğendiğiniz bir avatarı seçin.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-3 py-4 max-h-80 overflow-y-auto">
                      {localStockAvatars.map(avatar => (
                        <div 
                          key={avatar.id} 
                          className={`p-1 border-2 rounded-lg cursor-pointer hover:border-purple-500 transition-all
                            ${selectedStockAvatar === avatar.url ? 'border-purple-600 ring-2 ring-purple-600' : 'border-transparent'}`}
                          onClick={() => setSelectedStockAvatar(avatar.url)}
                        >
                          <Image src={avatar.url} alt={avatar.id} width={80} height={80} className="rounded-md w-full h-auto object-cover" />
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleStockAvatarSave} disabled={isUploading || !selectedStockAvatar}>
                        {isUploading ? "Kaydediliyor..." : "Avatarı Kaydet"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                {userData.level && userData.level !== "Belirlenmedi" && (
                  <UiBadge variant="outline" className="w-fit mx-auto md:mx-0 bg-lilac/10 text-lilac border-lilac">
                    {userData.level} Seviye
                  </UiBadge>
                )}
              </div>

              <p className="text-muted-foreground mb-1">{userData.bio}</p>
              <p className="text-sm text-muted-foreground mb-4">Başarı Yüzdesi: {userData.successPercentage}%</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-lilac" />
                  <span className="text-sm">{userData.points} puan</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-lilac" />
                  <span className="text-sm">Üyelik: {userData.joinDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-lilac" />
                  <span className="text-sm">{userData.stats.wordsLearned} kelime</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{userData.streak} günlük seri</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Button className="bg-lilac hover:bg-lilac/90 text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Profili Düzenle
                </Button>
                <Button variant="outline" onClick={() => setShowLevelTest(true)}>
                  <Award className="h-4 w-4 mr-2" />
                  Seviye Testini Yap
                </Button>
                <Dialog open={showBadgeSettings} onOpenChange={setShowBadgeSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Rozet Ayarları
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rozet Görünürlük Ayarları</DialogTitle>
                      <DialogDescription>
                        Hangi rozetlerin profilinizde görüneceğini seçin.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-60 overflow-y-auto py-4 space-y-2">
                      {userData.badges.length > 0 ? userData.badges.map((badge) => (
                        <div key={badge.badgeId} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <img src={badge.iconUrl || '/placeholder.svg'} alt={badge.name} className="h-8 w-8" />
                            <span>{badge.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant={badge.isVisible === false ? "secondary" : "outline"}
                            onClick={async () => {
                              const newVisibility = !(badge.isVisible === false); 
                              const result = await updateUserBadgeVisibility(badge.badgeId, newVisibility);
                              if (result.success) {
                                toast({ title: "Başarılı", description: `${badge.name} rozetinin görünürlüğü güncellendi.` });
                                mutateAuth(); 
                              } else {
                                toast({ title: "Hata", description: result.error || "Rozet görünürlüğü güncellenemedi.", variant: "destructive" });
                              }
                            }}
                          >
                            {badge.isVisible === false ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                            {badge.isVisible === false ? "Gizli" : "Görünür"}
                          </Button>
                        </div>
                      )) : <p className="text-sm text-muted-foreground">Henüz kazanılmış rozetiniz bulunmuyor.</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Kapat</Button>
                        </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-lilac data-[state=active]:text-white">Genel Bakış</TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-lilac data-[state=active]:text-white">Rozetler</TabsTrigger>
          <TabsTrigger value="statistics" className="data-[state=active]:bg-lilac data-[state=active]:text-white">İstatistikler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Öğrenilen Kelimeler</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.stats.wordsLearned}</div>
                <p className="text-xs text-muted-foreground">Toplam puanınız</p>
              </CardContent>
            </Card>
            <Card className="border-lilac/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Başarı Yüzdesi</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" /> {/* CheckCircle burada kullanılıyor */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.stats.correctAnswerRate}</div>
                <p className="text-xs text-muted-foreground">Genel başarı oranınız</p>
                <Progress value={userData.successPercentage || 0} className="h-2 mt-2 bg-muted" indicatorClassName="bg-lilac" />
              </CardContent>
            </Card>
          </div>
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Son Kazanılan Rozetler</CardTitle>
              <CardDescription>En son kazandığınız rozetler ve başarılar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.badges.filter(b => b.isVisible !== false).slice(0, 3).map((badge) => (
                  <div key={badge.badgeId} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lilac/10 text-lg">
                      <img src={badge.iconUrl || '/placeholder.svg'} alt={badge.name} className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-sm text-muted-foreground">{badge.description || "Bu rozeti kazandınız."}</p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      {new Date(badge.earnedAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                ))}
                {userData.badges.filter(b => b.isVisible !== false).length === 0 && (
                    <p className="text-sm text-muted-foreground">Henüz görünür bir rozet kazanmadınız.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="achievements" className="space-y-4">
          <Card className="border-lilac/20">
            <CardHeader>
              <CardTitle>Tüm Rozetlerim</CardTitle>
              <CardDescription>Kazandığınız tüm rozetler ve başarılar.</CardDescription>
            </CardHeader>
            <CardContent>
              {userData.badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {userData.badges.map((badge) => (
                    <Card key={badge.badgeId} className={`border-lilac/20 ${badge.isVisible === false ? 'opacity-50' : ''}`}>
                      <CardHeader className="items-center text-center">
                        <img src={badge.iconUrl || '/placeholder.svg'} alt={badge.name} className="h-16 w-16 mx-auto mb-2" />
                        <CardTitle className="text-md">{badge.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center text-sm text-muted-foreground">
                        <p>{badge.description || "Bu rozeti kazandınız."}</p>
                        <p className="text-xs mt-1">
                          Kazanma Tarihi: {new Date(badge.earnedAt).toLocaleDateString("tr-TR")}
                        </p>
                        {badge.isVisible === false && <UiBadge variant="secondary" className="mt-2">Gizli</UiBadge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Henüz hiç rozet kazanmadınız.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="statistics" className="space-y-4"><Card className="border-lilac/20"><CardHeader><CardTitle>Öğrenme İstatistikleri</CardTitle><CardDescription>Öğrenme yolculuğunuzdaki ilerlemeniz</CardDescription></CardHeader><CardContent><div className="space-y-6"><div><h3 className="text-sm font-medium mb-2">Kelime Öğrenme İlerlemesi (Seviyelere Göre)</h3><div className="space-y-2"><div className="flex justify-between"><span className="text-sm">A1 Seviyesi</span><span className="text-sm text-muted-foreground">N/A</span></div><Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-lilac" /><div className="flex justify-between"><span className="text-sm">A2 Seviyesi</span><span className="text-sm text-muted-foreground">N/A</span></div><Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-lilac" /><div className="flex justify-between"><span className="text-sm">B1 Seviyesi</span><span className="text-sm text-muted-foreground">N/A</span></div><Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-lilac" /></div></div><Separator /><div><h3 className="text-sm font-medium mb-2">Haftalık Çalışma Saatleri (Örnek Veri)</h3><div className="h-[150px] flex items-end justify-between">{["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day, i) => (<div key={day} className="flex flex-col items-center gap-2"><div className="bg-lilac/80 w-8 rounded-t-md" style={{ height: `${Math.max(20, Math.random() * 100)}px` }}></div><span className="text-xs text-muted-foreground">{day}</span></div>))}</div></div></div></CardContent></Card></TabsContent>
      </Tabs>

      {showLevelTest && (
        <LevelAssessmentTest
          isFirstTime={!user?.currentLevel} 
          onComplete={handleLevelTestComplete}
          onClose={() => setShowLevelTest(false)}
        />
      )}
    </div>
  )
}
