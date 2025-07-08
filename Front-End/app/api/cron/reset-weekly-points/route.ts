import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

// Bu endpoint'i yetkisiz erişime karşı korumak için bir secret key kullanalım.
// Bu anahtarı .env.local dosyanıza eklemelisiniz: CRON_SECRET=...
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');

    if (authorization !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    await dbConnect();

    const updateResult = await UserModel.updateMany(
      {}, // Tüm kullanıcıları seç
      { $set: { weeklyPoints: 0 } } // weeklyPoints alanını 0 yap
    );

    console.log(`[CRON JOB] Haftalık puanlar sıfırlandı. Etkilenen kullanıcı sayısı: ${updateResult.modifiedCount}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Tüm kullanıcıların haftalık puanları başarıyla sıfırlandı.',
      modifiedCount: updateResult.modifiedCount,
    });

  } catch (error) {
    console.error('Haftalık puan sıfırlama hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Puanlar sıfırlanırken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
