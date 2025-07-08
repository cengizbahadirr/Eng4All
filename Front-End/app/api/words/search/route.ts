import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WordModel from '@/models/Word';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.length < 2) {
      // Arama terimi çok kısaysa veya yoksa boş dizi döndür
      return NextResponse.json([]);
    }

    await dbConnect();

    // 'value.word' alanında büyük/küçük harf duyarsız ve başlangıçtan itibaren arama yap
    const words = await WordModel.find({
      'value.word': { $regex: `^${query}`, $options: 'i' }
    })
    .limit(10) // Sonuçları ilk 10 ile sınırla
    .select('id value.word value.turkish_word'); // Sadece gerekli alanları seç

    return NextResponse.json(words);
    
  } catch (error) {
    console.error("Kelime arama hatası:", error);
    return NextResponse.json({ message: 'Arama sırasında bir sunucu hatası oluştu.' }, { status: 500 });
  }
}
