import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ObjectId, Db, Filter, UpdateFilter, FindOptions } from 'mongodb';
import dbConnect from '@/lib/mongodb';
// UserModel yerine native driver kullanacağız. IGrammarScore ve IGrammarAttemptDetails interface'leri hala geçerli.
import { IGrammarScore, IGrammarAttemptDetails } from '@/models/User'; 
import { jwtVerify } from "jose";

// Native driver ile kullanmak için User şemasına benzer bir interface (models/User.ts'den kopyalanabilir veya oradan import edilebilir)
// Ancak sadece _id ve grammarScores yeterli olacak.
interface UserDBSchemaForGrammar {
  _id: ObjectId;
  grammarScores?: IGrammarScore[];
}

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET tanımlanmamış.");
    return null;
  }
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload && typeof payload.userId === 'string') {
      return payload.userId;
    }
    return null;
  } catch (error) {
    console.error("API JWT doğrulama hatası:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  console.log("/api/user/grammar-progress POST isteği alındı");
  const userId = await getUserIdFromToken(request);

  if (!userId) {
    console.error("Yetkisiz erişim: userId bulunamadı veya geçersiz.");
    return NextResponse.json({ error: 'Yetkisiz erişim. Oturum bulunamadı veya geçersiz.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("İstek gövdesi (body):", body);
    const { topicId, score, totalQuestions }: { topicId: string; score: number; totalQuestions: number } = body;

    if (!topicId || typeof score !== 'number' || typeof totalQuestions !== 'number') {
      console.error("Geçersiz istek parametreleri:", { topicId, score, totalQuestions });
      return NextResponse.json({ error: 'Geçersiz istek parametreleri.' }, { status: 400 });
    }

    const mongooseConnection = await dbConnect();
    console.log("MongoDB bağlantısı (Mongoose üzerinden) başarılı.");

    if (!mongooseConnection || !mongooseConnection.connection || !mongooseConnection.connection.db) {
        console.error("MongoDB bağlantı nesnesi, connection özelliği veya db özelliği tanımsız.");
        return NextResponse.json({ error: "Veritabanı bağlantı hatası." }, { status: 500 });
    }
    const db: Db = mongooseConnection.connection.db;
    const usersCollection = db.collection<UserDBSchemaForGrammar>('users');

    let objectIdUserId: ObjectId;
    try {
      objectIdUserId = new ObjectId(userId);
    } catch (e) {
      console.error("Geçersiz userId formatı, ObjectId'ye çevrilemedi:", userId, e);
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID formatı.' }, { status: 400 });
    }

    const user = await usersCollection.findOne({ _id: objectIdUserId });
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    let currentGrammarScores = user.grammarScores || [];
    const topicScoreIndex = currentGrammarScores.findIndex(gs => gs.topicId === topicId);
    const newAttemptDetails: IGrammarAttemptDetails = {
      score,
      totalQuestions,
      date: new Date(),
    };

    if (topicScoreIndex > -1) {
      // Konu için zaten bir skor var, güncelle
      const existingScore = currentGrammarScores[topicScoreIndex];
      existingScore.attempts = (existingScore.attempts || 0) + 1;
      existingScore.lastAttempt = newAttemptDetails;
      if (existingScore.bestScore === undefined || score > existingScore.bestScore) {
        existingScore.bestScore = score;
      }
      if (!existingScore.isCompleted && score === totalQuestions && totalQuestions > 0) {
        existingScore.isCompleted = true;
        console.log(`Konu ${topicId} başarıyla tamamlandı olarak işaretlendi.`);
      }
      currentGrammarScores[topicScoreIndex] = existingScore;
      console.log(`Gramer skoru güncellendi: Topic ID ${topicId}, Yeni Deneme Sayısı: ${existingScore.attempts}`);
    } else {
      // Konu için yeni skor, ekle
      const newGrammarScore: IGrammarScore = {
        topicId,
        attempts: 1,
        bestScore: score,
        lastAttempt: newAttemptDetails,
        isCompleted: (score === totalQuestions && totalQuestions > 0),
      };
      currentGrammarScores.push(newGrammarScore);
      console.log(`Yeni gramer skoru eklendi: Topic ID ${topicId}. Tamamlandı: ${newGrammarScore.isCompleted}`);
    }
    
    const updateResult = await usersCollection.updateOne(
      { _id: objectIdUserId },
      { $set: { grammarScores: currentGrammarScores } }
    );

    if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
      console.error("Veritabanı güncelleme hatası veya kullanıcı bulunamadı:", updateResult);
      return NextResponse.json({ error: 'Gramer ilerlemesi güncellenirken bir sorun oluştu.' }, { status: 500 });
    }
    
    console.log("Kullanıcı gramer ilerlemesi başarıyla kaydedildi (native driver).");

    // Güncellenmiş ve kaydedilmiş grammarScores'u almak için kullanıcıyı tekrar çekelim.
    const finalUserDoc = await usersCollection.findOne(
      { _id: objectIdUserId },
      { projection: { grammarScores: 1 } } 
    );
    console.log("Veritabanından son çekilen kullanıcı grammarScores (native driver):", finalUserDoc?.grammarScores);

    return NextResponse.json({
      success: true,
      message: 'Gramer alıştırma sonucu başarıyla kaydedildi.',
      updatedGrammarScores: finalUserDoc?.grammarScores || currentGrammarScores, // Veritabanından gelen güncel olanı tercih et
    }, { status: 200 });

  } catch (error) {
    console.error('Gramer ilerlemesi kaydetme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ error: 'Gramer ilerlemesi kaydedilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
