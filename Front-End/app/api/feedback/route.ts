import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FeedbackModel from '@/models/Feedback';
import { getUserIdFromToken } from '@/actions/auth-actions'; // Oturumdaki kullanıcıyı almak için

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 });
    }

    const { rating, comment } = await request.json();

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Geçerli bir puanlama (1-5 arası) gereklidir.' }, { status: 400 });
    }
    
    // Senaryo 2a: Yorum alanı boş bırakılırsa (isteğe bağlı değilse)
    // Şemamızda yorum alanı isteğe bağlı olduğu için bu kontrolü burada yapabiliriz.
    // Eğer yorum zorunlu olsaydı, aşağıdaki satırı aktif ederdik.
    // if (!comment) {
    //   return NextResponse.json({ success: false, error: 'Lütfen yorum alanını boş bırakmayınız.' }, { status: 400 });
    // }

    await dbConnect();

    const newFeedback = new FeedbackModel({
      userId,
      rating,
      comment,
    });

    await newFeedback.save();

    return NextResponse.json({ success: true, message: 'Geri bildiriminiz için teşekkür ederiz!' }, { status: 201 });

  } catch (error) {
    console.error('Geribildirim kaydetme hatası:', error);
    // Senaryo 3a: Sunucuya ulaşılamazsa veya başka bir hata olursa
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Bağlantı hatası, lütfen tekrar deneyiniz.', details: errorMessage }, { status: 500 });
  }
}
