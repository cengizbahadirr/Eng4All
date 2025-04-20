"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Sun, Moon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Eng4AllLogo from "@/components/eng4all-logo"
import { useTheme } from "next-themes"
import { updatePassword } from "@/actions/auth-actions"
import { useToast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    let isValid = true

    if (!password) {
      setPasswordError("Şifre gerekli")
      isValid = false
    } else if (password.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalıdır")
      isValid = false
    } else {
      setPasswordError("")
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Şifre tekrarı gerekli")
      isValid = false
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Şifreler eşleşmiyor")
      isValid = false
    } else {
      setConfirmPasswordError("")
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
      formData.append("password", password)

      const result = await updatePassword(formData)

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
          <h2 className="text-2xl font-semibold text-center text-card-foreground mb-6">Şifre Sıfırlama</h2>

          {success ? (
            <div className="text-center py-8">
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-600 dark:text-green-400">
                <p className="font-medium">Şifreniz başarıyla güncellendi!</p>
                <p className="mt-2">Artık yeni şifrenizle giriş yapabilirsiniz.</p>
              </div>
              <Button onClick={() => router.push("/login")} className="mt-4 bg-lilac hover:bg-lilac/90 text-white">
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
                  <Label htmlFor="password" className="text-card-foreground">
                    Yeni Şifre
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Yeni şifreniz"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-muted border ${
                      passwordError ? "border-red-500" : "border-input"
                    } focus:border-lilac focus:ring-lilac`}
                    disabled={isLoading}
                  />
                  {passwordError && (
                    <div className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {passwordError}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-card-foreground">
                    Şifre Tekrarı
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Şifrenizi tekrar girin"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`bg-muted border ${
                      confirmPasswordError ? "border-red-500" : "border-input"
                    } focus:border-lilac focus:ring-lilac`}
                    disabled={isLoading}
                  />
                  {confirmPasswordError && (
                    <div className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {confirmPasswordError}
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
                      Güncelleniyor...
                    </>
                  ) : (
                    "ŞİFREMİ GÜNCELLE"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
