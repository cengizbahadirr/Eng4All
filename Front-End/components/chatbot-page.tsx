"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizonal, Bot, UserCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  corrected_text?: string;
  explanation_tr?: string;
  timestamp: Date; // timestamp eklendi
}

export default function ChatbotPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // scrollAreaRef yerine messagesEndRef

  // Load chat history when component mounts and user data is available
  useEffect(() => {
    console.log("[ChatbotPage] useEffect for chat history triggered. User:", user);
    if (user?.chatHistory) {
      console.log("[ChatbotPage] User has chatHistory:", user.chatHistory);
      if (messages.length === 0 && user.chatHistory.length > 0) { // Sadece başlangıçta ve mesajlar boşsa VE geçmişte mesaj varsa yükle
        console.log("[ChatbotPage] Loading chat history into messages state.");
        // Tarihe göre sıralama (timestamp'lerin Date objesi olduğundan emin olalım)
        const sortedHistory = [...user.chatHistory].map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp) // Ensure timestamp is a Date object
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setMessages(sortedHistory);
      } else if (messages.length > 0) {
        console.log("[ChatbotPage] Messages state is not empty, not loading history to prevent overwrite.");
      } else if (user.chatHistory.length === 0) {
        console.log("[ChatbotPage] User chatHistory is empty, no messages to load.");
      }
    } else {
      console.log("[ChatbotPage] User or user.chatHistory is undefined.");
    }
  }, [user]); // user değiştiğinde (örneğin giriş/çıkış sonrası) çalışır

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessageId = Date.now().toString(); // Benzersiz ID oluştur
    const newUserMessage: Message = {
      id: userMessageId,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(parseInt(userMessageId)) // Timestamp'ı ID'den alıyoruz
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    const currentInput = inputMessage; // inputMessage state'i hemen sıfırlanacağı için sakla
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // API'ye userMessageId'yi de gönderiyoruz
        body: JSON.stringify({ message: currentInput, userMessageId: userMessageId }), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Bilinmeyen bir hata oluştu."}));
        throw new Error(errorData.error || `Sunucu hatası: ${response.status}`);
      }

      const aiData = await response.json(); // Bir tanesi silindi
      const aiResponseMessage: Message = {
        id: (parseInt(userMessageId) + 1).toString(), // AI mesajı için basit bir ID
        text: aiData.corrected_text, 
        sender: "ai",
        corrected_text: aiData.corrected_text,
        explanation_tr: aiData.explanation_tr,
        timestamp: new Date() // AI mesajı için yeni timestamp
      };
      setMessages((prevMessages) => [...prevMessages, aiResponseMessage]);
      // Sohbet geçmişi API tarafından kaydedildiği için burada mutateAuth çağırmaya gerek yok,
      // sayfa yenilendiğinde veya /api/auth/me tekrar çağrıldığında güncel geçmiş gelir.
      // Anlık güncelleme isteniyorsa, API yanıtından dönen tüm geçmişi alıp setMessages ile ayarlayabiliriz
      // veya mutateAuth() çağırabiliriz. Şimdilik bu şekilde bırakalım.

    } catch (error) {
      console.error("Chatbot API hatası:", error);
      const errorMessage = error instanceof Error ? error.message : "Mesaj gönderilirken bir sorun oluştu.";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
      setMessages((prevMessages) => [...prevMessages, {
        id: (parseInt(userMessageId) + 1).toString(),
        text: `Üzgünüm, bir sorunla karşılaştım: ${errorMessage}`,
        sender: "ai",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-lilac" />
        <p className="mt-4 text-muted-foreground">Sohbet yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl font-semibold">Erişim Reddedildi</p>
        <p className="text-muted-foreground">Chatbot'u kullanmak için lütfen giriş yapın.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      <Card className="flex-1 flex flex-col shadow-xl border-input overflow-hidden"> {/* overflow-hidden eklendi */}
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <Bot className="h-6 w-6 mr-2 text-lilac" />
            AI Gramer Asistanı
          </CardTitle>
          <CardDescription>İngilizce cümlelerinizi yazın, gramer düzeltmeleri ve açıklamalar alın.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto min-h-0"> 
          <div className="p-4"> {/* h-full kaldırıldı */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Bot className="h-16 w-16 mb-4 opacity-50" />
                <p>Merhaba! Nasıl yardımcı olabilirim?</p>
                <p className="text-sm">Örnek: "I go to school yesterday."</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 my-4 ${
                  msg.sender === "user" ? "justify-end" : ""
                }`}
              >
                {msg.sender === "ai" && (
                  <Avatar className="h-8 w-8 border border-lilac/50">
                    <AvatarFallback><Bot className="h-5 w-5 text-lilac" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow ${
                    msg.sender === "user"
                      ? "bg-lilac text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  {msg.sender === "ai" && msg.explanation_tr && msg.explanation_tr !== "Cümleniz dilbilgisi açısından doğru görünüyor." && (
                    <div className="mt-2 pt-2 border-t border-lilac/20">
                      <p className="text-xs font-semibold text-lilac dark:text-lilac-light mb-1">Açıklama:</p>
                      {/* className prop'u kaldırıldı. Stil için gerekirse 'components' prop'u kullanılabilir. */}
                      {/* Tailwind prose sınıfları genellikle ReactMarkdown'ın ürettiği HTML'e doğrudan etki eder. */}
                      <div className="prose prose-xs dark:prose-invert max-w-none"> 
                        <ReactMarkdown>
                          {msg.explanation_tr}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                   {msg.sender === "ai" && msg.explanation_tr === "Cümleniz dilbilgisi açısından doğru görünüyor." && (
                     <p className="text-xs mt-1 text-green-600 dark:text-green-400">{msg.explanation_tr}</p>
                   )}
                </div>
                {msg.sender === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "Kullanıcı"} />
                    <AvatarFallback>
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : <UserCircle />}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3 my-4">
                <Avatar className="h-8 w-8 border border-lilac/50">
                  <AvatarFallback><Bot className="h-5 w-5 text-lilac" /></AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted text-foreground rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> 
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="İngilizce mesajınızı yazın..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputMessage.trim()} className="bg-lilac hover:bg-lilac/90">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
              <span className="sr-only">Gönder</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
