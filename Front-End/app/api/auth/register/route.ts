import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { name, email, password } = await req.json();

    // Genişleme 2a: Kullanıcı eksik bilgi girerse.
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Lütfen tüm alanları doldurun (isim, e-posta, şifre).' }, { status: 400 });
    }

    // Genişleme 3a: Kullanıcı daha önce aynı e-posta ile kayıt olmuşsa.
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 409 });
    }

    // Yeni kullanıcı oluşturma
    // Şifre hashleme User modelindeki pre-save hook'unda yapılıyor.
    const newUser = new UserModel({
      name,
      email,
      password,
      // Varsayılan profil alanları UC9'a göre
      currentLevel: 'A1', // Başlangıç seviyesi olarak A1 varsayalım, veya bir test ile belirlenebilir
      successPercentage: 0,
      badges: [],
      avatarUrl: '', // Varsayılan veya kullanıcı daha sonra ekleyebilir
    });

    await newUser.save();

    // Şifreyi yanıttan çıkar
    const userObject = newUser.toObject();
    delete userObject.password;

    return NextResponse.json({ message: 'Kullanıcı başarıyla kaydedildi.', user: userObject }, { status: 201 });

  } catch (error) {
    console.error('Kayıt sırasında hata:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Sunucu hatası: ' + error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Bilinmeyen bir sunucu hatası oluştu.' }, { status: 500 });
  }
}
