import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Kullanıcıları haftalık puana göre büyükten küçüğe sırala
    // Sadece gerekli alanları seçerek performansı artır
    // Örnek olarak ilk 100 kullanıcıyı alalım
    const leaderboard = await UserModel.find({ weeklyPoints: { $gt: 0 } }) // Haftalık puanı 0'dan büyük olanları al
      .sort({ weeklyPoints: -1 }) // Puanı büyükten küçüğe sırala
      .limit(100) // İlk 100 kullanıcıyı al
      .select('name avatarUrl weeklyPoints currentLevel'); // Gerekli alanları seç

    if (!leaderboard) {
      return NextResponse.json({ success: false, error: 'Liderlik tablosu verileri alınamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: leaderboard });

  } catch (error) {
    console.error('Liderlik tablosu getirme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Liderlik tablosu verileri getirilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
