"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/actions/auth-actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState(""); // 6 haneli kod için state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Hata", description: "Şifreler eşleşmiyor.", variant: "destructive" });
      return;
    }
    if (!token || token.length !== 6) {
        toast({ title: "Hata", description: "Lütfen e-postanıza gelen 6 haneli kodu girin.", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    const result = await resetPassword(token, password);

    if (result.success) {
      toast({
        title: "Başarılı",
        description: result.message,
      });
      router.push("/login");
    } else {
      toast({
        title: "Hata",
        description: result.error || "Bir hata oluştu.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Yeni Şifre Belirle</CardTitle>
          <CardDescription>
            E-postanıza gelen 6 haneli kodu ve yeni şifrenizi girin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Doğrulama Kodu</Label>
              <Input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="E-postanıza gelen 6 haneli kod"
                required
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Yeni Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
