import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose'; 
import { IExerciseAttempt } from '@/models/User'; 
import { jwtVerify } from 'jose';
import { ObjectId, Db } from 'mongodb'; 

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
  const tokenCookie = req.cookies.get('token');
  const token = tokenCookie?.value;

  if (!token) {
    console.log("[API/exercise-history] Token cookie'den alınamadı veya boş.");
    return null;
  }
  if (!JWT_SECRET) {
    console.error("[API/exercise-history] JWT_SECRET tanımlanmamış.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload.userId as string) || (payload.sub as string) || (payload.id as string) || null;
    return userId;
  } catch (error) {
    console.error("[API/exercise-history] JWT doğrulama hatası:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const mongooseInstance = await dbConnect(); 
    const dbFromConnection: Db | undefined = mongooseInstance.connection.db; 
    
    if (!dbFromConnection) { 
        console.error("[API/exercise-history] Veritabanı nesnesi alınamadı.");
        throw new Error("Veritabanı bağlantısı veya nesnesi bulunamadı.");
    }
    const db: Db = dbFromConnection; // db artık undefined değil
    const usersCollection = db.collection('users'); 

    const userId = await getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const exerciseDataFromRequest = await request.json();
    
    const exerciseData: IExerciseAttempt = {
        exerciseId: exerciseDataFromRequest.exerciseId,
        exerciseType: exerciseDataFromRequest.exerciseType,
        category: exerciseDataFromRequest.category,
        topic: exerciseDataFromRequest.topic,
        level: exerciseDataFromRequest.level,
        date: new Date(exerciseDataFromRequest.date), 
        score: Number(exerciseDataFromRequest.score),
        totalQuestions: Number(exerciseDataFromRequest.totalQuestions),
        correctCount: Number(exerciseDataFromRequest.correctCount),
        incorrectCount: Number(exerciseDataFromRequest.incorrectCount),
        unansweredCount: Number(exerciseDataFromRequest.unansweredCount),
        answeredQuestions: exerciseDataFromRequest.answeredQuestions || [],
        duration: Number(exerciseDataFromRequest.duration),
    };
    
    console.log("[API/exercise-history] İşlenmiş exerciseData (Native Driver):", JSON.stringify(exerciseData, null, 2));

    if (!exerciseData.exerciseId || 
        !exerciseData.exerciseType || 
        !exerciseData.category ||
        !exerciseData.topic ||
        !exerciseData.level ||
        typeof exerciseData.score !== 'number' || 
        typeof exerciseData.totalQuestions !== 'number' ||
        typeof exerciseData.correctCount !== 'number' ||
        typeof exerciseData.incorrectCount !== 'number' ||
        typeof exerciseData.unansweredCount !== 'number' ||
        typeof exerciseData.duration !== 'number' ||
        !Array.isArray(exerciseData.answeredQuestions)
        ) {
      console.error("[API/exercise-history] Eksik veya geçersiz alıştırma verisi (Native Driver). Gelen Veri:", exerciseData);
      return NextResponse.json({ success: false, error: 'Eksik veya geçersiz alıştırma verisi.' }, { status: 400 });
    }
    
    const pointsGained = exerciseData.correctCount * 10; // Örnek: Her doğru cevap 10 puan

    const updateOperation = {
      $push: { exerciseHistory: exerciseData as any }, // Tip kontrolünü atlatmak için 'as any' kullanabiliriz
      $inc: { 
        points: pointsGained,
        weeklyPoints: pointsGained,
      }
    };

    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) }, 
      updateOperation as any // Veya tüm operasyonu 'as any' olarak cast edebiliriz
    );

    if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 0) {
        console.error("[API/exercise-history] Kullanıcı bulunamadı veya güncelleme başarısız (Native Driver). UserId:", userId);
        return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı veya güncelleme yapılamadı.' }, { status: 404 });
    }
     if (updateResult.modifiedCount === 0 && updateResult.matchedCount > 0) {
        console.warn("[API/exercise-history] Kullanıcı bulundu ancak exerciseHistory güncellenmedi (Native Driver).", updateResult);
    }

    return NextResponse.json({ success: true, message: 'Alıştırma geçmişi başarıyla kaydedildi (Native Driver).' }, { status: 201 });

  } catch (error) {
    console.error('Alıştırma Geçmişi Kaydetme Hatası (Native Driver):', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Alıştırma geçmişi kaydedilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const mongooseInstance = await dbConnect();
    const dbFromConnection: Db | undefined = mongooseInstance.connection.db; 
     if (!dbFromConnection) {
        console.error("[API/exercise-history] GET: Veritabanı nesnesi alınamadı.");
        throw new Error("Veritabanı bağlantısı veya nesnesi bulunamadı.");
    }
    const db: Db = dbFromConnection; // db artık undefined değil
    const usersCollection = db.collection('users');

    const userId = await getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const user = await usersCollection.findOne(
        { _id: new ObjectId(userId) },
        { projection: { exerciseHistory: 1 } } 
    );
        
    if (!user) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    const history = user.exerciseHistory || [];
    const sortedHistory = (history as IExerciseAttempt[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, history: sortedHistory }, { status: 200 });

  } catch (error) {
    console.error('Alıştırma Geçmişi Getirme Hatası (Native Driver):', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Alıştırma geçmişi getirilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
