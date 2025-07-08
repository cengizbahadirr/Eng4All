"use server"

import dbConnect from "@/lib/mongodb";
import UserModel, { IUser } from "@/models/User";
import { cookies } from 'next/headers'; 
import { jwtVerify } from 'jose';
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  newLevel?: string;
  avatarUrl?: string;
  updatedBadge?: { badgeId: string; isVisible: boolean };
}

async function getUserIdFromToken(): Promise<string | null> {
  // cookies() bir Promise döndürdüğü için await ile beklenmeli.
  const cookieStore = await cookies(); 
  const tokenCookie = cookieStore.get('token');
  
  const token = tokenCookie?.value;

  if (!token || !JWT_SECRET) {
    console.error("[Server Action] Token or JWT_SECRET missing in getUserIdFromToken.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload.userId as string) || (payload.sub as string) || (payload.id as string) || null;
    if (!userId) {
        console.error("[Server Action] User ID not found in token payload.");
        return null;
    }
    return userId;
  } catch (error) {
    console.error("[Server Action] Token verification failed:", error);
    return null;
  }
}

export async function updateUserCurrentLevel(newLevel: string): Promise<ActionResult> {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return { success: false, error: "Yetkisiz işlem veya kullanıcı ID alınamadı." };
    }

    await dbConnect();
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { currentLevel: newLevel },
      { new: true, runValidators: true }
    ).select('currentLevel');

    if (!updatedUser) {
      return { success: false, error: "Kullanıcı bulunamadı." };
    }
    
    revalidatePath('/profile');
    revalidatePath('/dashboard'); 

    return { success: true, message: "Seviye başarıyla güncellendi.", newLevel: updatedUser.currentLevel };
  } catch (error) {
    console.error("Seviye güncelleme hatası:", error);
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen bir sunucu hatası.";
    return { success: false, error: `Seviye güncellenirken bir hata oluştu: ${errorMessage}` };
  }
}

export async function updateUserProfilePicture(formData: FormData): Promise<ActionResult> {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return { success: false, error: "Yetkisiz işlem veya kullanıcı ID alınamadı." };
    }

    const file = formData.get("profilePicture") as File | null;
    if (!file) {
        return { success: false, error: "Dosya bulunamadı." };
    }

    const temporaryAvatarUrl = `/placeholder-user.jpg`; 
    console.log(`[Server Action] Profil resmi için geçici URL: ${temporaryAvatarUrl}. Gerçek yükleme implemente edilmeli.`);

    try {
        await dbConnect();
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { avatarUrl: temporaryAvatarUrl }, 
            { new: true }
        ).select('avatarUrl');

        if (!updatedUser) {
            return { success: false, error: "Kullanıcı bulunamadı." };
        }
        revalidatePath('/profile');
        return { success: true, avatarUrl: updatedUser.avatarUrl };

    } catch (error) {
        console.error("Profil resmi güncelleme hatası:", error);
        return { success: false, error: "Profil resmi güncellenirken bir hata oluştu." };
    }
}

export async function updateUserAvatar(newAvatarUrl: string): Promise<ActionResult> {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return { success: false, error: "Yetkisiz işlem veya kullanıcı ID alınamadı." };
  }

  if (!newAvatarUrl || typeof newAvatarUrl !== 'string') {
    return { success: false, error: "Geçersiz avatar URL'si." };
  }

  try {
    await dbConnect();
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { avatarUrl: newAvatarUrl },
      { new: true, runValidators: true }
    ).select('avatarUrl');

    if (!updatedUser) {
      return { success: false, error: "Kullanıcı bulunamadı." };
    }
    
    revalidatePath('/profile');
    revalidatePath('/dashboard'); 

    return { success: true, message: "Avatar başarıyla güncellendi.", avatarUrl: updatedUser.avatarUrl };
  } catch (error) {
    console.error("Avatar güncelleme hatası:", error);
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen bir sunucu hatası.";
    return { success: false, error: `Avatar güncellenirken bir hata oluştu: ${errorMessage}` };
  }
}


export async function updateUserBadgeVisibility(badgeId: string, isVisible: boolean): Promise<ActionResult> {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return { success: false, error: "Yetkisiz işlem veya kullanıcı ID alınamadı." };
  }

  if (!badgeId || typeof isVisible !== 'boolean') {
    return { success: false, error: "Geçersiz rozet bilgileri." };
  }
  
  try {
    await dbConnect();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, error: "Geçersiz kullanıcı ID formatı." };
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return { success: false, error: "Kullanıcı bulunamadı." };
    }

    const badgeIndex = user.badges?.findIndex(b => b.badgeId === badgeId);

    if (badgeIndex === undefined || badgeIndex === -1) {
      return { success: false, error: "Rozet bulunamadı." };
    }
    
    if (!user.badges) {
        user.badges = []; 
    }
    
    user.badges[badgeIndex].isVisible = isVisible;
    await user.save();
    
    revalidatePath('/profile');

    return { success: true, message: "Rozet görünürlüğü güncellendi.", updatedBadge: { badgeId, isVisible } };
  } catch (error) {
    console.error("Rozet görünürlüğü güncelleme hatası:", error);
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen bir sunucu hatası.";
    return { success: false, error: `Rozet görünürlüğü güncellenirken bir hata oluştu: ${errorMessage}` };
  }
}
