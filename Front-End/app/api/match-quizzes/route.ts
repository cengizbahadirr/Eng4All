import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId, Db } from 'mongodb';

// matchQuizzes koleksiyonundaki bir quiz'in (örn: quiz_1) yapısı
interface MatchQuizEntry {
  word: string;
  definition: string;
}

// matchQuizzes koleksiyonundaki seviye yapısı (örn: A1)
interface MatchLevelStructure {
  [quizKey: string]: MatchQuizEntry[]; // örn: quiz_1: MatchQuizEntry[]
}

// matchQuizzes koleksiyonundaki ana doküman yapısı
interface MatchQuizDocument {
  _id: ObjectId;
  A1?: MatchLevelStructure;
  A2?: MatchLevelStructure;
  B1?: MatchLevelStructure;
  B2?: MatchLevelStructure;
  C1?: MatchLevelStructure;
  C2?: MatchLevelStructure;
}

const MATCH_QUIZZES_DOC_ID = "684d6a310643853c329980bc"; // Kullanıcının sağladığı ID

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level'); // örn: A1, C1
  const topic = searchParams.get('topic'); // örn: quiz_1, quiz_2 (matchQuizzes içindeki quiz anahtarı)

  if (!level || !topic) {
    return NextResponse.json({ error: 'Seviye ve konu (quiz anahtarı) parametreleri gereklidir.' }, { status: 400 });
  }

  try {
    const mongooseInstance = await dbConnect();
    const dbFromConnection: Db | undefined = mongooseInstance.connection.db;
    if (!dbFromConnection) {
      console.error("[API/match-quizzes] Veritabanı nesnesi alınamadı.");
      throw new Error("Veritabanı bağlantısı veya nesnesi bulunamadı.");
    }
    const db: Db = dbFromConnection; // db artık undefined değil

    const collection = db.collection<MatchQuizDocument>('matchQuizzes');
    const quizDoc = await collection.findOne({ _id: new ObjectId(MATCH_QUIZZES_DOC_ID) });

    if (!quizDoc) {
      return NextResponse.json({ error: `Kelime eşleştirme quiz dokümanı bulunamadı. ID: ${MATCH_QUIZZES_DOC_ID}` }, { status: 404 });
    }

    const levelKey = level.toUpperCase() as keyof Omit<MatchQuizDocument, '_id'>;
    const levelData = quizDoc[levelKey];

    if (!levelData || !levelData[topic]) {
      return NextResponse.json({ 
        error: `Belirtilen seviye (${level}) veya konu (${topic}) için kelime eşleştirme quizi bulunamadı.` 
      }, { status: 404 });
    }

    const matchPairs: MatchQuizEntry[] = levelData[topic];

    if (!matchPairs || matchPairs.length === 0) {
        return NextResponse.json({ error: `"${topic}" konusu için eşleştirilecek kelime bulunamadı.` }, { status: 404 });
    }
    
    const formattedQuestion = {
        questionId: `${level}-${topic}`, 
        questionText: `Kelimeleri doğru tanımlarıyla eşleştirin (${topic.replace('_', ' ')})`,
        questionType: 'matching',
        matchPairs: matchPairs,
        options: [], 
        correctAnswer: '', 
    };

    return NextResponse.json([formattedQuestion], { status: 200 });

  } catch (error) {
    console.error('API Kelime Eşleştirme Quizi Getirme Hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası oluştu.';
    return NextResponse.json({ error: 'Kelime eşleştirme quizi getirilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
