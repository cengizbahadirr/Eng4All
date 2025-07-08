import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import mongoose from 'mongoose'; // Mongoose eklendi (dbConnect için)
import { ObjectId, Db } from 'mongodb'; // ObjectId ve Db eklendi
import dbConnect from '@/lib/mongodb'; // dbConnect eklendi
import { IChatMessage } from '@/models/User'; // IChatMessage modeli import edildi
import { jwtVerify } from 'jose'; // jwtVerify eklendi

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET; // JWT_SECRET eklendi

// Native driver ile kullanmak için User şemasına benzer bir interface
interface UserDBSchemaForChat {
  _id: ObjectId;
  chatHistory?: IChatMessage[];
}

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  if (!JWT_SECRET) {
    console.error("[Chatbot API] JWT_SECRET tanımlanmamış.");
    return null;
  }
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  if (!token) {
    console.log("[Chatbot API] Token cookie bulunamadı.");
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload && typeof payload.userId === 'string') {
      return payload.userId;
    }
    console.log("[Chatbot API] Geçersiz token payload:", payload);
    return null;
  } catch (error) {
    console.error("[Chatbot API] JWT doğrulama hatası:", error);
    return null;
  }
}

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY ortam değişkeni ayarlanmamış.");
  // Uygulama başlangıcında bu kontrol daha uygun olabilir, ancak API çağrısı öncesi de kritik.
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

// Gemini modelini yapılandırma
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest", // Veya "gemini-pro" gibi uygun bir model
  // Güvenlik ayarları (isteğe bağlı, ihtiyaca göre ayarlanabilir)
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  // Sistem talimatı (isteğe bağlı, modelin davranışını yönlendirmek için)
  systemInstruction: `You are an expert English grammar assistant. The user will provide a sentence or text in English. Your task is to:
1. Identify any grammatical errors in the provided text.
2. Provide the corrected version of the sentence/text.
3. Briefly explain the errors and the corrections made, in Turkish. The explanation should be clear and helpful for an English learner.
If the provided text is grammatically correct, state that it is correct in Turkish (e.g., "Cümleniz dilbilgisi açısından doğru görünüyor.") and do not provide corrections.
Format your response strictly as a JSON object with two keys: "corrected_text" (string) and "explanation_tr" (string).
Example for an incorrect sentence:
User: "I has a cat."
AI: { "corrected_text": "I have a cat.", "explanation_tr": "'has' fiili 'he/she/it' özneleriyle kullanılır. 'I' öznesi için 'have' kullanılmalıdır." }
Example for a correct sentence:
User: "She has a dog."
AI: { "corrected_text": "She has a dog.", "explanation_tr": "Cümleniz dilbilgisi açısından doğru görünüyor." }
Ensure the output is always a valid JSON object as specified.`,
});

export async function POST(request: NextRequest) {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI servisi yapılandırılmamış. API anahtarı eksik.' }, { status: 500 });
    }
    
    const userId = await getUserIdFromToken(request);
    // Kullanıcı girişi zorunlu değilse userId null olabilir, bu durumu ele almalıyız.
    // Şimdilik, geçmişi kaydetmek için userId'nin zorunlu olduğunu varsayalım.
    // Eğer kullanıcı giriş yapmamışsa geçmiş kaydedilmez ama chatbot çalışmaya devam edebilir.
    // Ya da giriş yapmamışsa chatbot'u hiç çalıştırmayabiliriz. Senaryo bunu netleştirmeli.
    // UC6 Ön Koşul: "Kullanıcının sisteme giriş yapması." Bu yüzden userId zorunlu.
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Sohbet geçmişi kaydedilemez.' }, { status: 401 });
    }

  try {
    const { message, userMessageId } : { message: string, userMessageId: string } = await request.json(); // userMessageId eklendi

    if (!message || typeof message !== 'string' || !userMessageId) {
      return NextResponse.json({ error: 'Geçersiz istek: Mesaj metni veya mesaj ID eksik/hatalı formatta.' }, { status: 400 });
    }

    console.log(`[Chatbot API] Gelen mesaj: "${message}", UserID: ${userId}, UserMessageID: ${userMessageId}`);

    const chat = model.startChat({
      history: [], // Sohbet geçmişi burada yönetilebilir (ileride)
      // generationConfig: { // İsteğe bağlı üretim yapılandırması
      //   maxOutputTokens: 200,
      //   temperature: 0.7,
      // }
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    let aiResponseText = response.text();
    
    console.log(`[Chatbot API] Gemini yanıtı (ham): "${aiResponseText}"`);

    // Markdown kod bloğunu temizle (eğer varsa)
    const markdownJsonMatch = aiResponseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownJsonMatch && markdownJsonMatch[1]) {
      aiResponseText = markdownJsonMatch[1];
      console.log(`[Chatbot API] Markdown temizlendi, JSON içeriği: "${aiResponseText}"`);
    } else {
      // Bazen sadece ``` ile başlayıp bitmeyebilir, sadece JSON içeriği olabilir.
      // Ya da başında/sonunda gereksiz boşluklar olabilir.
      aiResponseText = aiResponseText.trim();
    }

    // Gemini'nin yanıtının beklenen JSON formatında olup olmadığını kontrol et
    try {
      const parsedJsonResponse = JSON.parse(aiResponseText);
      // Yanıtın beklenen anahtarları içerip içermediğini de kontrol edebiliriz.
      if (typeof parsedJsonResponse.corrected_text !== 'string' || typeof parsedJsonResponse.explanation_tr !== 'string') {
        console.error("[Chatbot API] Gemini yanıtı beklenen JSON formatında değil (eksik anahtarlar):", parsedJsonResponse);
        // Fallback veya daha genel bir yanıt
        const fallbackResponse = { 
          corrected_text: message, 
          explanation_tr: "AI'dan geçerli bir düzeltme formatı alınamadı. Lütfen tekrar deneyin veya farklı bir cümle kullanın." 
        };
        // Bu fallback yanıtını da kaydetmeyi deneyebiliriz veya sadece kullanıcıya döndürebiliriz.
        // Şimdilik sadece döndürelim, kaydetme başarılı JSON için olsun.
        return NextResponse.json(fallbackResponse, { status: 200 });
      }
      
      // Başarılı yanıtı ve kullanıcı mesajını veritabanına kaydet
      const mongooseConnection = await dbConnect();
      if (!mongooseConnection || !mongooseConnection.connection || !mongooseConnection.connection.db) {
        console.error("[Chatbot API] Kayıt için MongoDB bağlantı hatası.");
        // Yanıtı yine de kullanıcıya döndür, ama kaydetme başarısız oldu.
        return NextResponse.json(parsedJsonResponse, { status: 200 }); 
      }
      const db: Db = mongooseConnection.connection.db;
      const usersCollection = db.collection<UserDBSchemaForChat>('users');
      const objectIdUserId = new ObjectId(userId);

      const userMessageToSave: IChatMessage = {
        id: userMessageId, // Frontend'den gelen ID
        text: message,
        sender: "user",
        timestamp: new Date(parseInt(userMessageId)) // ID'yi timestamp olarak kullanıyoruz
      };
      
      const aiMessageToSave: IChatMessage = {
        id: (parseInt(userMessageId) + 1).toString(), // AI mesajı için basit bir ID
        text: parsedJsonResponse.corrected_text,
        sender: "ai",
        corrected_text: parsedJsonResponse.corrected_text,
        explanation_tr: parsedJsonResponse.explanation_tr,
        timestamp: new Date()
      };

      await usersCollection.updateOne(
        { _id: objectIdUserId },
        { $push: { chatHistory: { $each: [userMessageToSave, aiMessageToSave] } } }
      );
      console.log(`[Chatbot API] Kullanıcı (${userId}) için sohbet mesajları kaydedildi.`);

      return NextResponse.json(parsedJsonResponse, { status: 200 });

    } catch (e) {
      console.error("[Chatbot API] Gemini yanıtı JSON olarak parse edilemedi veya DB kaydında hata:", aiResponseText, e);
      return NextResponse.json({ 
        corrected_text: message, 
        explanation_tr: "AI yanıtı işlenirken veya kaydedilirken bir sorun oluştu." 
      }, { status: 200 });
    }

  } catch (error) {
    console.error('[Chatbot API] Gemini API çağrısı sırasında hata:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ error: 'AI chatbot servisine ulaşılamadı.', details: errorMessage }, { status: 503 });
  }
}
