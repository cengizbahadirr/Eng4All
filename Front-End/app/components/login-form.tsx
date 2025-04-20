"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login with:", email, password)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-[#4b4b4b] mb-6">Giriş Yap</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#4b4b4b]">
            E-posta
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            className="h-12 border-[#e5e5e5] rounded-xl focus:border-[#58cc02] focus:ring-[#58cc02]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#4b4b4b]">
            Şifre
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifreniz"
            className="h-12 border-[#e5e5e5] rounded-xl focus:border-[#58cc02] focus:ring-[#58cc02]"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-[#58cc02] hover:bg-[#46a302] text-white font-bold text-lg rounded-xl"
        >
          GİRİŞ YAP
        </Button>

        <div className="text-center">
          <a href="#" className="text-[#1cb0f6] hover:underline text-sm">
            Şifremi unuttum
          </a>
        </div>

        {/* Tamamen yeni bir yaklaşım - inline CSS ile sabit genişlik */}
        <div className="text-center my-4 overflow-hidden" style={{ position: "relative", maxWidth: "100%" }}>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                width: "100%",
                borderTop: "1px solid #e5e5e5",
                transform: "translateY(-50%)",
              }}
            ></div>
            <span
              style={{
                position: "relative",
                display: "inline-block",
                padding: "0 10px",
                backgroundColor: "white",
                color: "#afafaf",
                fontSize: "0.875rem",
              }}
            >
              veya
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-[#e5e5e5] text-[#4b4b4b] font-bold rounded-xl hover:bg-[#f7f7f7]"
        >
          Google ile devam et
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-[#e5e5e5] text-[#4b4b4b] font-bold rounded-xl hover:bg-[#f7f7f7]"
        >
          Facebook ile devam et
        </Button>

        <div className="text-center pt-2">
          <span className="text-[#afafaf]">
            Hesabınız yok mu?{" "}
            <a href="#" className="text-[#1cb0f6] hover:underline">
              Kaydol
            </a>
          </span>
        </div>
      </form>
    </div>
  )
}

export { LoginForm }
