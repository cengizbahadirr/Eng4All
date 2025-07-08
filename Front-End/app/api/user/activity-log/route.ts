import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sendMessage } from '@/lib/rabbitmq';

const JWT_SECRET = process.env.JWT_SECRET;
const ACTIVITY_LOG_QUEUE = 'activity_log_queue';

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
    const userId = await getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { durationInSeconds } = await request.json();

    if (typeof durationInSeconds !== 'number' || durationInSeconds <= 0) {
      return NextResponse.json({ success: false, error: 'Geçersiz süre değeri.' }, { status: 400 });
    }

    const message = {
      userId,
      durationInSeconds,
      timestamp: new Date().toISOString(),
    };

    await sendMessage(ACTIVITY_LOG_QUEUE, JSON.stringify(message));
    
    return NextResponse.json({ success: true, message: 'Aktivite kaydı başarıyla alındı ve işlenmek üzere sıraya eklendi.' }, { status: 202 });

  } catch (error) {
    console.error('Aktivite Kaydı Sıraya Ekleme Hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ success: false, error: 'Aktivite kaydı sıraya eklenirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
