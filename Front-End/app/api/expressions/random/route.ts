import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getUserIdFromToken } from '@/actions/auth-actions';
import UserModel from '@/models/User';
import mongoose from 'mongoose';
import { Db } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const mongooseInstance = await dbConnect();
    const dbFromConnection: Db | undefined = mongooseInstance.connection.db;
    if (!dbFromConnection) {
      throw new Error("Veritabanı bağlantısı kurulamadı.");
    }
    const db: Db = dbFromConnection;
    
    const user = await db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { projection: { currentLevel: 1 } }
    );
    const userLevel = user?.currentLevel || 'A1';

    const expressionsCollection = db.collection('expressions');
    const expressionsDoc = await expressionsCollection.findOne({});
    
    if (!expressionsDoc) {
      return NextResponse.json({ success: false, error: 'İfade veritabanı bulunamadı.' }, { status: 404 });
    }

    // Seviyeye ait ifade dizisine doğrudan dokümandan eriş
    const levelExpressions = expressionsDoc[userLevel];

    if (!levelExpressions || levelExpressions.length === 0) {
      return NextResponse.json({ success: false, error: `Kullanıcının seviyesi (${userLevel}) için ifade bulunamadı.` }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * levelExpressions.length);
    const randomExpression = levelExpressions[randomIndex];

    return NextResponse.json({ success: true, data: randomExpression });

  } catch (error) {
    console.error('Rastgele ifade getirme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Rastgele ifade getirilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
