"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Settings, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eng4AllLogo } from "@/components/eng4all-logo";
import { useTheme } from "next-themes";
import { signOut } from "@/actions/auth-actions";
import { useToast } from "@/hooks/use-toast";

type User = {
  _id: string;
  name: string;
  email: string;
  streakCount?: number;
  points?: number;
  avatarUrl?: string;
} | null;

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Çıkış başarılı",
        description: "Güvenli bir şekilde çıkış yaptınız.",
      });
      router.push("/login");
      router.refresh(); // Ensure the layout is re-rendered for the logged-out state
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Çıkış başarısız",
        description: "Bir hata oluştu.",
      });
    }
  };

  return (
    <header className="w-full py-3 px-4 border-b border-input flex items-center justify-between sticky top-0 z-10 bg-background">
      <div className="flex items-center">
        <Eng4AllLogo />
        <span className="text-lilac text-2xl font-bold ml-2 hidden sm:inline-block">eng4all</span>
      </div>
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kelime veya konu ara..."
            className="pl-8 bg-muted focus:border-lilac focus:ring-lilac"
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && globalSearchTerm.trim() !== "") {
                router.push(`/search?q=${encodeURIComponent(globalSearchTerm.trim())}`);
                setGlobalSearchTerm("");
              }
            }}
          />
        </div>
      </div>
      {user ? (
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center text-sm font-medium">
            <span className="hidden md:inline-block mr-2">Merhaba, {user.name}!</span>
            <Avatar className="h-8 w-8 border-2 border-lilac">
              <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-lilac/20 text-lilac">{user.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <span className="text-base">🔥</span>
              <span>{user.streakCount || 0}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <span className="text-base">💎</span>
              <span>{user.points || 0}</span>
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-lilac" /> : <Moon className="h-5 w-5 text-lilac" />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Settings">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full" aria-label="Logout">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/login')}>Giriş Yap</Button>
          <Button onClick={() => router.push('/register')}>Kaydol</Button>
        </div>
      )}
    </header>
  );
}
