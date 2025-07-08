"use server";

import dbConnect from "@/lib/mongodb";
import UserModel from "@/models/User";
import { getUserIdFromToken } from "@/actions/auth-actions"; // Mevcut auth-actions'tan yardımcı fonksiyonu alacağız
import { revalidatePath } from "next/cache";

// getUserIdFromToken fonksiyonunu auth-actions'tan import ediyoruz.
// Yerel getUserId fonksiyonu kaldırıldı.

// Günlük farkı hesaplayan yardımcı fonksiyon
const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 1000 * 60 * 60 * 24;
  const diffInTime = date2.getTime() - date1.getTime();
  return Math.round(diffInTime / oneDay);
};

export async function updateUserStreak() {
  const userId = await getUserIdFromToken(); // Doğru fonksiyonu çağır
  if (!userId) {
    return { error: "Kullanıcı oturumu bulunamadı." };
  }

  try {
    await dbConnect();
    const user = await UserModel.findById(userId).select('lastLoginAt streakCount');

    if (!user) {
      return { error: "Kullanıcı bulunamadı." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Saati sıfırla, sadece tarihi karşılaştır

    const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0); // Saati sıfırla
    }

    let newStreakCount = user.streakCount || 0;
    let message = "";

    if (!lastLogin || daysBetween(lastLogin, today) > 1) {
      // Eğer hiç giriş yapmamışsa veya son giriş dünden eskiyse, seriyi 1'e ayarla.
      newStreakCount = 1;
      message = "Yeni bir seri başlattınız! Harika başlangıç!";
    } else if (daysBetween(lastLogin, today) === 1) {
      // Eğer son giriş dünkü tarih ise, seriyi 1 artır.
      newStreakCount++;
      message = `Seriniz ${newStreakCount} güne ulaştı. Böyle devam!`;
    } else {
      // Eğer son giriş bugünkü tarih ise, bir şey yapma.
      return { success: true, streak: newStreakCount, message: "Bugünkü girişiniz zaten sayıldı." };
    }

    user.streakCount = newStreakCount;
    user.lastLoginAt = new Date(); // Tam zamanı kaydet
    
    await user.save();

    // Profil ve dashboard'daki veriyi yenile
    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return { success: true, streak: newStreakCount, message };

  } catch (error) {
    console.error("Streak güncelleme hatası:", error);
    return { error: "Seri güncellenirken bir hata oluştu." };
  }
}
