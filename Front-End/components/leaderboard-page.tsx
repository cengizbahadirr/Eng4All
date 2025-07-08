"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Trophy, Crown, Medal, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardUser {
  _id: string;
  name: string;
  avatarUrl: string;
  weeklyPoints: number;
  currentLevel: string;
}

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
  if (rank === 3) return <Award className="h-6 w-6 text-yellow-700" />;
  return <span className="font-semibold text-lg w-6 text-center">{rank}</span>;
};

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setLeaderboardData(result.data);
        } else {
          throw new Error(result.error || "Liderlik tablosu verileri alınamadı.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Liderlik tablosu alınırken hata:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-6 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Bir Hata Oluştu</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Haftalık Liderlik Tablosu</h1>
        <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
          Bu hafta en çok puan kazanan öğrencilerle rekabet et!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sıralama</CardTitle>
          <CardDescription>Haftalık puanlara göre ilk 100 kullanıcı.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            renderSkeleton()
          ) : leaderboardData.length > 0 ? (
            <ul className="divide-y divide-border">
              {leaderboardData.map((user, index) => (
                <li key={user._id} className={`flex items-center space-x-4 p-4 ${currentUser?._id === user._id ? 'bg-primary/10 rounded-lg' : ''}`}>
                  <RankIcon rank={index + 1} />
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.currentLevel || 'Seviye Belirlenmedi'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">{user.weeklyPoints}</p>
                    <p className="text-xs text-muted-foreground">puan</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Bu hafta henüz kimse puan kazanmadı.</p>
              <p className="text-sm text-muted-foreground">İlk puanı kazanarak listeye adını yazdır!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
