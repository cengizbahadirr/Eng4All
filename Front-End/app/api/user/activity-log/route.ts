import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User'; // UserModel import edildi
import mongoose from 'mongoose'; // mongoose.Types.ObjectId için veya doğrudan string ID kullanmak için
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken(req: NextRequest): Promise<string | null> {
  const tokenCookie = req.cookies.get('token');
  const token = tokenCookie?.value;

  if (!token || !JWT_SECRET) {
    return null;
  }
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload.sub as string) || (payload.id as string) || (payload.userId as string) || null;
  } catch (error) {
    console.error("[API/activity-log] JWT doğrulama hatası:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { durationInSeconds } = await request.json();

    if (typeof durationInSeconds !== 'number' || durationInSeconds <= 0) {
      return NextResponse.json({ success: false, error: 'Geçersiz süre değeri.' }, { status: 400 });
    }

    // Bugünün tarihini YYYY-MM-DD formatında al (saat, dakika, saniye olmadan)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Günün başlangıcına ayarla

    const db = mongoose.connection.db;
    if (!db) {
      console.error("[API/activity-log] Veritabanı bağlantısı (db) bulunamadı.");
      return NextResponse.json({ success: false, error: 'Veritabanı bağlantı hatası.' }, { status: 500 });
    }
    // IUser yerine daha genel bir Document tipi veya MongoDB'nin kendi Document tipini kullanabiliriz
    // Mongoose UserModel kullanarak güncelleme
    // 1. Bugün tarihli bir dailyActivity elemanı varsa durationInSeconds'ı artır.
    const updateResult = await UserModel.updateOne(
      { _id: userId, "dailyActivity.date": today },
      { $inc: { "dailyActivity.$.durationInSeconds": durationInSeconds } }
    );

    if (updateResult.matchedCount === 0) {
      // Eşleşen kayıt bulunamadı, yani bugün için bir aktivite kaydı yok.
      // O zaman yeni bir dailyActivity elemanı $push ile ekle.
      // UserModel.updateOne kullanırken _id string olarak verilebilir, Mongoose ObjectId'ye çevirir.
      const pushResult = await UserModel.updateOne(
        { _id: userId },
        { 
          $push: { 
            dailyActivity: { 
              date: today, 
              durationInSeconds: durationInSeconds 
            } 
          } 
        }
      );
      if (pushResult.modifiedCount === 0 && pushResult.upsertedCount === 0) {
        // Kullanıcı bulundu ama push işlemi başarısız oldu (beklenmedik durum)
         console.error(`[API/activity-log] Kullanıcı ${userId} için dailyActivity push edilemedi.`);
        return NextResponse.json({ success: false, error: 'Aktivite kaydı güncellenemedi (push).' }, { status: 500 });
      }
    } else if (updateResult.modifiedCount === 0) {
        // Eşleşen kayıt bulundu ama $inc işlemi bir şekilde başarısız oldu (beklenmedik durum)
        console.error(`[API/activity-log] Kullanıcı ${userId} için dailyActivity inc edilemedi.`);
        return NextResponse.json({ success: false, error: 'Aktivite kaydı güncellenemedi (inc).' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Aktivite süresi başarıyla kaydedildi.' }, { status: 200 });

  } catch (error) {
    console.error('Aktivite Süresi Kaydetme Hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Aktivite süresi kaydedilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
