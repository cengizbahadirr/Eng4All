import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SynonymModel from '@/models/Synonym';
import { getUserIdFromToken } from '@/actions/auth-actions';
import UserModel from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    await dbConnect();

    // Kullanıcının seviyesini al
    const user = await UserModel.findById(userId).select('currentLevel');
    const userLevel = user?.currentLevel || 'A1';

    // Eş anlamlıların olduğu dokümanı çek
    const synonymDoc = await SynonymModel.findOne().lean();
    if (!synonymDoc) {
      return NextResponse.json({ success: false, error: 'Eş anlamlı veritabanı bulunamadı.' }, { status: 404 });
    }

    const levelSynonyms = synonymDoc[userLevel];

    if (!levelSynonyms || levelSynonyms.length === 0) {
      return NextResponse.json({ success: false, error: `Kullanıcının seviyesi (${userLevel}) için eş anlamlı bulunamadı.` }, { status: 404 });
    }

    // Seviyeye uygun ifadeler arasından rastgele bir tane seç
    const randomIndex = Math.floor(Math.random() * levelSynonyms.length);
    const randomSynonymData = levelSynonyms[randomIndex];

    return NextResponse.json({ success: true, data: randomSynonymData });

  } catch (error) {
    console.error('Rastgele eş anlamlı getirme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Rastgele eş anlamlı getirilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
