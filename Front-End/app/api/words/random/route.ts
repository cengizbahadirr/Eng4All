import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WordModel from '@/models/Word'; // Word modelini import etmemiz gerekecek

export async function GET() {
  try {
    await dbConnect();

    // Veri havuzundaki toplam kelime sayısını al
    const count = await WordModel.countDocuments();

    if (count === 0) {
      return NextResponse.json({ success: false, error: 'Veri havuzunda hiç kelime bulunamadı.' }, { status: 404 });
    }

    // Rastgele bir index oluştur
    const randomIndex = Math.floor(Math.random() * count);

    // Rastgele index'teki bir kelimeyi getir
    // .skip() büyük koleksiyonlarda yavaş olabilir, alternatif olarak aggregation kullanılabilir.
    // Şimdilik bu yöntem yeterli olacaktır.
    const randomWord = await WordModel.findOne().skip(randomIndex);

    if (!randomWord) {
      return NextResponse.json({ success: false, error: 'Rastgele kelime getirilemedi.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: randomWord });

  } catch (error) {
    console.error('Rastgele kelime getirme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Şu anda rastgele kelime getirilemiyor. Lütfen daha sonra tekrar deneyin.', details: errorMessage }, { status: 500 });
  }
}
