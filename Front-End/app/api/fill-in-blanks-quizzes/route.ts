import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// MongoDB'deki boşluk doldurma soru formatı
interface MongoFillBlankQuestion {
  question: string; // "I ___ (eat) breakfast every morning."
  answer: string;   // "eat"
  explanation?: string; // Opsiyonel
}

// QuizSessionManager'ın bekleyebileceği (veya uyarlayacağımız) format
interface FrontendQuizQuestion {
  questionId: string;
  questionText: string;
  options: string[]; // Boşluk doldurma için boş olacak veya hiç olmayacak
  correctAnswer: string;
  explanation?: string;
  questionType?: 'fill-in-blanks' | 'multiple-choice'; // Yeni alan
}

interface LevelTopicMapFill {
  [topic: string]: MongoFillBlankQuestion[];
}

interface FillQuizSetDocument {
  _id: mongoose.Types.ObjectId;
  A1?: LevelTopicMapFill;
  A2?: LevelTopicMapFill;
  B1?: LevelTopicMapFill;
  B2?: LevelTopicMapFill;
  C1?: LevelTopicMapFill;
  C2?: LevelTopicMapFill;
}

const FILL_QUIZZES_DOC_ID = "684d58bc0643853c329980b9"; // Sağladığınız ID

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

    const quizCollection = db.collection<FillQuizSetDocument>('fillQuizzes'); 
    
    const quizDoc = await quizCollection.findOne({ _id: new mongoose.Types.ObjectId(FILL_QUIZZES_DOC_ID) });

    if (!quizDoc) {
      return NextResponse.json({ error: 'Boşluk doldurma quiz dokümanı bulunamadı. ID: ' + FILL_QUIZZES_DOC_ID }, { status: 404 });
    }

    const levelKey = level.toUpperCase() as keyof Omit<FillQuizSetDocument, '_id'>;
    const levelData = quizDoc[levelKey] as LevelTopicMapFill | undefined;

    if (!levelData) {
      return NextResponse.json({ error: `"${level}" seviyesi için boşluk doldurma quiz verisi bulunamadı.` }, { status: 404 });
    }

    const mongoQuestions: MongoFillBlankQuestion[] | undefined = levelData[topic];
    
    if (!mongoQuestions || mongoQuestions.length === 0) {
      return NextResponse.json({ error: `"${topic}" konusu için "${level}" seviyesinde boşluk doldurma quizi bulunamadı.` }, { status: 404 });
    }

    const frontendQuestions: FrontendQuizQuestion[] = mongoQuestions.map((q, index) => {
      // Boşluk doldurma sorularında genellikle seçenek olmaz.
      // Soru metnindeki boşluğu (örn: "___") veya parantez içindeki fiili (örn: "(eat)")
      // QuizSessionManager'da bir input alanı ile değiştireceğiz.
      return {
        questionId: `${topic.replace(/\s+/g, '-')}-fill-${level}-${index}`,
        questionText: q.question, // "I ___ (eat) breakfast every morning."
        options: [], // Boşluk doldurma için seçenek yok
        correctAnswer: q.answer,
        explanation: q.explanation,
        questionType: 'fill-in-blanks', // Quiz tipini belirt
      };
    });

    return NextResponse.json(frontendQuestions, { status: 200 });

  } catch (error) {
    console.error('API Boşluk Doldurma Quiz Getirme Hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası oluştu.';
    return NextResponse.json({ error: 'Boşluk doldurma quizleri getirilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
