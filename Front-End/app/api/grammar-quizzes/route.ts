import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose'; // mongoose.connection.db için

// MongoDB'deki soru formatı (options bir nesne)
interface MongoGrammarQuestion {
  question: string;
  options: { [key: string]: string }; // örn: { A: "Option A", B: "Option B" }
  answer: string; // örn: "A"
  explanation?: string;
}

// QuizSessionManager'ın beklediği format
interface FrontendQuizQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

// Ana quiz dokümanının yapısı
interface LevelTopicMap {
  [topic: string]: MongoGrammarQuestion[];
}

interface GrammarQuizSetDocument {
  _id: mongoose.Types.ObjectId;
  A1?: LevelTopicMap;
  A2?: LevelTopicMap;
  B1?: LevelTopicMap;
  B2?: LevelTopicMap;
  C1?: LevelTopicMap;
  C2?: LevelTopicMap;
}

const MAIN_QUIZ_DOC_ID = "684d49150643853c329980b6"; // Güncellenmiş ID

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level'); 
  const topic = searchParams.get('topic');   

  if (!level || !topic) {
    return NextResponse.json({ error: 'Seviye ve konu parametreleri gereklidir.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Veritabanı bağlantısı bulunamadı.");
    }

    const quizCollection = db.collection<GrammarQuizSetDocument>('grammarQuizzes'); // Koleksiyon adı düzeltildi
    
    const quizDoc = await quizCollection.findOne({ _id: new mongoose.Types.ObjectId(MAIN_QUIZ_DOC_ID) });

    if (!quizDoc) {
      return NextResponse.json({ error: 'Quiz dokümanı bulunamadı. Kontrol edilen ID: ' + MAIN_QUIZ_DOC_ID + ' Koleksiyon: grammarQuizzes' }, { status: 404 });
    }

    const levelKey = level.toUpperCase() as keyof Omit<GrammarQuizSetDocument, '_id'>; 
    const levelData = quizDoc[levelKey] as LevelTopicMap | undefined;

    if (!levelData) {
      return NextResponse.json({ error: `"${level}" seviyesi için quiz verisi bulunamadı.` }, { status: 404 });
    }

    const mongoQuestions: MongoGrammarQuestion[] | undefined = levelData[topic];
    
    if (!mongoQuestions || mongoQuestions.length === 0) {
      return NextResponse.json({ error: `"${topic}" konusu için "${level}" seviyesinde quiz bulunamadı.` }, { status: 404 });
    }

    const frontendQuestions: FrontendQuizQuestion[] = mongoQuestions.map((q, index) => {
      const optionValues = Object.values(q.options);
      const correctAnswerText = q.options[q.answer];

      if (!correctAnswerText) {
        console.warn(`Soru için doğru cevap metni bulunamadı: ${q.question} (Doğru cevap anahtarı: ${q.answer})`);
      }

      return {
        questionId: `${topic.replace(/\s+/g, '-')}-${level}-${index}`, 
        questionText: q.question,
        options: optionValues,
        correctAnswer: correctAnswerText || "HATA: Doğru Cevap Belirsiz", 
        explanation: q.explanation,
      };
    });

    return NextResponse.json(frontendQuestions, { status: 200 });

  } catch (error) {
    console.error('API Gramer Quiz Getirme Hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası oluştu.';
    return NextResponse.json({ error: 'Gramer quizleri getirilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
