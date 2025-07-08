import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/mongodb';
import UserModel, { IUser } from '@/models/User';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET tanımlanmamış.');
    return NextResponse.json({ error: 'Sunucu yapılandırma hatası.' }, { status: 500 });
  }

  console.log("[/api/auth/me] İstek alındı.");
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;
  console.log("[/api/auth/me] Token cookie'den okundu:", token ? "VAR" : "YOK", token);

  if (!token) {
    console.log("[/api/auth/me] Token bulunamadı, 401 döndürülüyor.");
    return NextResponse.json({ user: null, error: 'Yetkilendirilmemiş. Token bulunamadı.' }, { status: 401 });
  }

  try {
    console.log("[/api/auth/me] Token doğrulanmaya çalışılıyor...");
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log("[/api/auth/me] Token doğrulandı. Payload:", payload);

    const userId = (payload.userId as string) || (payload.sub as string) || (payload.id as string) || null;

    if (!userId) { 
      console.log("[/api/auth/me] Geçersiz token payload (userId bulunamadı), 401 döndürülüyor.");
      return NextResponse.json({ user: null, error: 'Geçersiz token payload.' }, { status: 401 });
    }

    console.log(`[/api/auth/me] Kullanıcı aranıyor: ${userId}`);
    await dbConnect();
    // badges alanını da seçtiğimizden emin olalım
    const user: IUser | null = await UserModel.findById(userId).select('+grammarScores +chatHistory +dailyActivity +badges +favoriteWords'); 

    if (!user) {
      return NextResponse.json({ user: null, error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    const userData = {
      _id: user._id ? user._id.toString() : undefined,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      currentLevel: user.currentLevel,
      targetLevel: user.targetLevel,
      points: user.points,
      streakCount: user.streakCount,
      favoriteWords: user.favoriteWords || [],
      grammarScores: user.grammarScores || [], 
      chatHistory: user.chatHistory || [], 
      dailyActivity: user.dailyActivity || [],
      badges: user.badges || [], // badges alanı eklendi
      successPercentage: user.successPercentage, // successPercentage eklendi
    };

    return NextResponse.json({ user: userData });

  } catch (error) {
    console.error('Token doğrulama veya kullanıcı getirme hatası:', error);
    return NextResponse.json({ user: null, error: 'Geçersiz veya süresi dolmuş token.' }, { status: 401 });
  }
}
