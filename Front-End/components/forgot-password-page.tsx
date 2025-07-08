"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetCode, resetPassword } from "@/actions/auth-actions";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: E-posta gir, 2: Kodu ve yeni şifreyi gir
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await sendPasswordResetCode(email);
    if (result.success) {
      toast({
        title: "Kod Gönderildi",
        description: result.message,
      });
      setStep(2); // Bir sonraki adıma geç
    } else {
      toast({
        title: "Hata",
        description: result.error || "Bir hata oluştu.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Hata", description: "Şifreler eşleşmiyor.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const result = await resetPassword(token, password);
    if (result.success) {
      toast({
        title: "Başarılı",
        description: "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.",
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
        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Şifrenizi mi Unuttunuz?</CardTitle>
              <CardDescription>
                Endişelenmeyin! E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir kod gönderelim.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Gönderiliyor..." : "Sıfırlama Kodu Gönder"}
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Yeni Şifre Belirle</CardTitle>
              <CardDescription>
                {email} adresine gönderdiğimiz 6 haneli kodu ve yeni şifrenizi girin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Doğrulama Kodu</Label>
                  <Input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="6 haneli kod"
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
          </>
        )}
        <div className="p-6 pt-0 text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">
            Giriş ekranına geri dön
          </a>
        </div>
      </Card>
    </div>
  );
}
