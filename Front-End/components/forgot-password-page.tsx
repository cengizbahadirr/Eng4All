"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Sun, Moon, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Eng4AllLogo from "@/components/eng4all-logo"
import { useTheme } from "next-themes"
import { resetPassword } from "@/actions/auth-actions"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    let isValid = true

    if (!email) {
      setEmailError("E-posta gerekli")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Geçersiz e-posta")
      isValid = false
    } else {
      setEmailError("")
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setGeneralError("")

    try {
      const formData = new FormData()
      formData.append("email", email)

      const result = await resetPassword(formData)

      if (result.error) {
        setGeneralError(result.error)
        toast({
          variant: "destructive",
          title: "İşlem başarısız",
          description: result.error,
        })
      } else if (result.success) {
        setSuccess(true)
        toast({
          title: "İşlem başarılı",
          description: result.message,
        })
      }
    } catch (error) {
      setGeneralError("Bir hata oluştu. Lütfen tekrar deneyin.")
      toast({
        variant: "destructive",
        title: "İşlem başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5 text-lilac" /> : <Moon className="h-5 w-5 text-lilac" />}
        </Button>
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8 flex items-center">
          <Eng4AllLogo />
          <span className="text-lilac text-3xl font-bold ml-2">eng4all</span>
        </div>

        <div className="w-full bg-card rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Button variant="ghost" size="sm" className="mr-2 text-muted-foreground" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Geri
            </Button>
            <h2 className="text-2xl font-semibold text-center text-card-foreground flex-1 mr-8">Şifremi Unuttum</h2>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-600 dark:text-green-400">
                <p className="font-medium">Şifre sıfırlama bağlantısı gönderildi!</p>
                <p className="mt-2">
                  Lütfen e-posta adresinizi kontrol edin ve şifrenizi sıfırlamak için bağlantıya tıklayın.
                </p>
              </div>
              <Button onClick={() => router.push("/")} className="mt-4 bg-lilac hover:bg-lilac/90 text-white">
                Giriş sayfasına dön
              </Button>
            </div>
          ) : (
            <>
              {generalError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-card-foreground">
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-muted border ${
                      emailError ? "border-red-500" : "border-input"
                    } focus:border-lilac focus:ring-lilac`}
                    disabled={isLoading}
                  />
                  {emailError && (
                    <div className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {emailError}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-lilac hover:bg-lilac/90 text-white font-bold text-lg rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    "ŞİFREMİ SIFIRLA"
                  )}
                </Button>
              </form>

              <div className="text-center mt-6">
                <span className="text-muted-foreground">
                  <Link href="/login" className="text-lilac hover:underline">
                    Giriş sayfasına dön
                  </Link>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
