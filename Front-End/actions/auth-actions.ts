"use server";

import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import UserModel from "@/models/User"; 
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; 
import crypto from "crypto";
import { Resend } from 'resend';
import { jwtVerify } from 'jose'; // jwtVerify importu eklendi
import { ResetPasswordEmail } from '@/components/emails/ResetPasswordEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET ortam değişkeni tanımlanmamış.");
}

const createToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET!, {
    expiresIn: "1d", 
  });
};

export async function signUp(formData: FormData) {
  try {
    await dbConnect(); 

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!email || !password || !name) {
      return { error: "İsim, e-posta ve şifre gereklidir." };
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }

    const newUser = new UserModel({
      name,
      email,
      password, 
      currentLevel: 'A1', 
      successPercentage: 0,
      badges: [],
      avatarUrl: '/placeholder-user.jpg', 
    });

    await newUser.save();

    const userIdString = newUser._id?.toString();
    if (!userIdString) {
      throw new Error("Kullanıcı ID'si oluşturulamadı.");
    }
    const token = createToken(userIdString);

    const cookieStore = await cookies();
    cookieStore.set("token", token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax", 
      path: "/",
      maxAge: 60 * 60 * 24, 
    });

    return {
      success: true,
      message: "Kayıt başarılı! Yönlendiriliyorsunuz...",
    };
  } catch (error: any) {
    console.error("Kayıt hatası:", error);
    if (error.code === 11000) { 
        return { error: "Bu e-posta adresi zaten kayıtlı." };
    }
    return { error: error.message || "Bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await dbConnect(); 

    if (!email || !password) {
      return { error: "E-posta ve şifre gereklidir." };
    }

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return { error: "Geçersiz e-posta veya şifre." };
    }

    if (!user.password) {
        return { error: "Kullanıcı hesabı yapılandırma hatası." };
    }
    
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return { error: "Geçersiz e-posta veya şifre." };
    }

    const userIdStringFromUser = user._id?.toString();
    if (!userIdStringFromUser) {
        throw new Error("Kullanıcı ID'si oluşturulamadı.");
    }
    const token = createToken(userIdStringFromUser);

    const cookieStore = await cookies();
    cookieStore.set("token", token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, 
    });

  } catch (error: any) {
    console.error("[signIn Action] Giriş sırasında genel hata:", error);
    return { error: "Bir hata oluştu. Lütfen tekrar deneyin." };
  }

  return { success: true };
}

export async function signOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token"); 
    return { success: true, message: "Başarıyla çıkış yapıldı." };
  } catch (error: any) {
    console.error("Çıkış hatası:", error);
    return { error: "Çıkış yapılırken bir hata oluştu." };
  }
}

// Şifre Sıfırlama Kodu Gönderme Action'ı
export async function sendPasswordResetCode(email: string) {
  await dbConnect();
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      // Güvenlik nedeniyle, e-postanın bulunup bulunmadığını belli etmiyoruz.
      console.log(`[Auth Action] Şifre sıfırlama isteği (e-posta bulunamadı): ${email}`);
      return { success: true, message: "E-posta adresiniz sistemde kayıtlıysa, şifre sıfırlama talimatları gönderilecektir." };
    }

    // 6 haneli sayısal bir kod oluştur
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Token'ı hash'le
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika geçerlilik süresi

    // user.save() yerine doğrudan updateOne ile atomik güncelleme yap
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: hashedToken,
          passwordResetExpires: resetTokenExpires,
        },
      }
    );

    // Resend ile e-posta gönder
    try {
      await resend.emails.send({
        from: 'Eng4All <onboarding@resend.dev>', // Gönderen adresi (Resend'de domain'i doğrulamanız gerekebilir)
        to: user.email,
        subject: 'Eng4All Şifre Sıfırlama Kodunuz',
        react: ResetPasswordEmail({ resetCode: resetToken }),
      });
      console.log(`[Auth Action] Şifre sıfırlama e-postası ${user.email} adresine gönderildi.`);
    } catch (emailError) {
      console.error("E-posta gönderme hatası:", emailError);
      return { error: "Şifre sıfırlama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin." };
    }

    return { success: true, message: "E-posta adresiniz sistemde kayıtlıysa, şifre sıfırlama talimatları gönderilecektir." };

  } catch (error) {
    console.error("Şifre sıfırlama kodu gönderme hatası:", error);
    return { error: "İstek işlenirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

// Bu fonksiyonu diğer action'larda kullanmak için export edelim
export async function getUserIdFromToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');
  const token = tokenCookie?.value;

  if (!token || !JWT_SECRET) {
    return null;
  }
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload.userId as string) || (payload.sub as string) || null;
  } catch (error) {
    return null;
  }
}

// Şifre Sıfırlama Action'ı
export async function resetPassword(token: string, newPassword: string) {
  await dbConnect();
  try {
    // Kullanıcının girdiği token'ı hash'le
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Süresi dolmamış token'ı bul
    }).select('+password'); // Diğer alanlar artık varsayılan olarak geliyor

    if (!user) {
      return { error: "Geçersiz veya süresi dolmuş şifre sıfırlama kodu." };
    }

    // Yeni şifreyi ayarla ve kaydet (pre-save hook'u hash'leyecektir)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    return { success: true, message: "Şifreniz başarıyla güncellendi." };

  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    return { error: "Şifre güncellenirken bir hata oluştu." };
  }
}
