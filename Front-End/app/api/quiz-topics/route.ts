import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId, Db } from 'mongodb';

interface QuizTopicInfo {
  id: string; 
  title: string; 
  description: string; 
}

interface LevelDataStructure {
  [topic: string]: any[]; 
}

interface QuizDocumentStructure {
  _id: mongoose.Types.ObjectId | ObjectId; 
  A1?: LevelDataStructure;
  A2?: LevelDataStructure;
  B1?: LevelDataStructure;
  B2?: LevelDataStructure;
  C1?: LevelDataStructure;
  C2?: LevelDataStructure;
}

const GRAMMAR_QUIZZES_DOC_ID = "684d49150643853c329980b6";
const FILL_QUIZZES_DOC_ID = "684d58bc0643853c329980b9";
const MATCH_QUIZZES_DOC_ID = "684d6a310643853c329980bc"; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const quizType = searchParams.get('type'); 
  const level = searchParams.get('level');   

  if (!quizType || !level) {
    return NextResponse.json({ error: 'Quiz türü ve seviye parametreleri gereklidir.' }, { status: 400 });
  }

  let collectionName: string;
  let docIdString: string;
  let quizTypeDescription: string;

  if (quizType === 'grammar') {
    collectionName = 'grammarQuizzes';
    docIdString = GRAMMAR_QUIZZES_DOC_ID;
    quizTypeDescription = 'gramer';
  } else if (quizType === 'fill-in-blanks') {
    collectionName = 'fillQuizzes';
    docIdString = FILL_QUIZZES_DOC_ID;
    quizTypeDescription = 'boşluk doldurma';
  } else if (quizType === 'match') {
    collectionName = 'matchQuizzes';
    docIdString = MATCH_QUIZZES_DOC_ID;
    quizTypeDescription = 'kelime eşleştirme';
  }
   else {
    return NextResponse.json({ error: 'Geçersiz quiz türü.' }, { status: 400 });
  }

  try {
    const mongooseInstance = await dbConnect();
    const dbFromConnection: Db | undefined = mongooseInstance.connection.db;
    if (!dbFromConnection) {
      console.error(`[API/quiz-topics] ${quizTypeDescription}: Veritabanı nesnesi alınamadı.`);
      throw new Error("Veritabanı bağlantısı veya nesnesi bulunamadı.");
    }
    const db: Db = dbFromConnection; // db artık undefined değil

    const collection = db.collection<QuizDocumentStructure>(collectionName);
    const quizDoc = await collection.findOne({ _id: new ObjectId(docIdString) });

    if (!quizDoc) {
      return NextResponse.json({ error: `${quizTypeDescription} için quiz dokümanı bulunamadı. ID: ${docIdString}` }, { status: 404 });
    }

    const levelKey = level.toUpperCase() as keyof Omit<QuizDocumentStructure, '_id'>;
    const levelData = quizDoc[levelKey] as LevelDataStructure | undefined;

    if (!levelData) {
      return NextResponse.json({ topics: [] }, { status: 200 }); 
    }

    const topics: QuizTopicInfo[] = Object.keys(levelData).map(topicKey => ({
      id: topicKey, 
      title: `${topicKey.replace(/_/g, ' ')} (${level.toUpperCase()})`, 
      description: `${topicKey.replace(/_/g, ' ')} konusu ile ilgili ${quizTypeDescription} quizi.`,
    }));

    return NextResponse.json({ topics }, { status: 200 });

  } catch (error) {
    console.error(`API ${quizTypeDescription} Konu Getirme Hatası:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası oluştu.';
    return NextResponse.json({ error: `Quiz konuları getirilirken bir hata oluştu.`, details: errorMessage }, { status: 500 });
  }
}
