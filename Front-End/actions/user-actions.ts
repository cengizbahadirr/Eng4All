"use server";

import dbConnect from "@/lib/mongodb";
import UserModel from "@/models/User";
import { getUserIdFromToken } from "@/actions/auth-actions";
import { revalidatePath } from "next/cache";

interface FavoriteActionResult {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}

export async function toggleFavoriteWord(wordId: number): Promise<FavoriteActionResult> {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return { success: false, error: "Kullanıcı oturumu bulunamadı." };
  }

  try {
    await dbConnect();
    const user = await UserModel.findById(userId).select('favoriteWords');

    if (!user) {
      return { success: false, error: "Kullanıcı bulunamadı." };
    }

    const isCurrentlyFavorite = user.favoriteWords?.includes(wordId);
    let updatedIsFavorite: boolean;

    if (isCurrentlyFavorite) {
      // Favorilerden çıkar
      await UserModel.updateOne(
        { _id: userId },
        { $pull: { favoriteWords: wordId } }
      );
      updatedIsFavorite = false;
    } else {
      // Favorilere ekle
      await UserModel.updateOne(
        { _id: userId },
        { $addToSet: { favoriteWords: wordId } } // $addToSet, kelimenin zaten favorilerde olmamasını sağlar
      );
      updatedIsFavorite = true;
    }

    revalidatePath('/dashboard'); // Dashboard'daki favori durumunu yenile
    revalidatePath('/favorites'); // Favoriler sayfasını yenile

    return { success: true, isFavorite: updatedIsFavorite };

  } catch (error) {
    console.error("Favori kelime değiştirme hatası:", error);
    return { success: false, error: "İşlem sırasında bir hata oluştu." };
  }
}
