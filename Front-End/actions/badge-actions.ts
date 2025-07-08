"use server";

import dbConnect from "@/lib/mongodb";
import UserModel, { IUser } from "@/models/User";
import { badgeDefinitions, BadgeDefinition, BadgeCriteria } from "@/lib/badges";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { revalidatePath } from "next/cache";
import mongoose from "mongoose"; // mongoose importu eklendi

const JWT_SECRET = process.env.JWT_SECRET;

interface AwardBadgeResult {
  success: boolean;
  awardedBadge?: BadgeDefinition;
  error?: string;
  message?: string;
}

async function getUserIdFromToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');
  const token = tokenCookie?.value;

  if (!token || !JWT_SECRET) {
    console.error("[Badge Action] Token or JWT_SECRET missing.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    // payload.sub JWT standartlarında subject'i (genellikle kullanıcı ID'si) ifade eder.
    // payload.userId ise bizim özel olarak eklediğimiz bir alan olabilir.
    const userId = (payload.userId as string) || (payload.sub as string) || (payload.id as string) || null;
    if (!userId) {
        console.error("[Badge Action] User ID not found in token payload.");
        return null;
    }
    return userId;
  } catch (error) {
    console.error("[Badge Action] Token verification failed:", error);
    return null;
  }
}

export async function checkAndAwardBadges(userId: string): Promise<AwardBadgeResult[]> {
  if (!userId) {
    return [{ success: false, error: "Kullanıcı ID'si sağlanmadı." }];
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return [{ success: false, error: "Geçersiz Kullanıcı ID formatı." }];
  }

  try {
    await dbConnect();
    const user = await UserModel.findById(userId).select('+points +currentLevel +streakCount +exerciseHistory +grammarScores +badges');
    if (!user) {
      return [{ success: false, error: "Kullanıcı bulunamadı." }];
    }

    const awardedResults: AwardBadgeResult[] = [];
    const userExistingBadgeIds = user.badges?.map(b => b.badgeId) || [];
    let newBadgesToAdd: IUser['badges'] = []; // Tip IUser['badges'] olarak düzeltildi

    for (const badgeDef of badgeDefinitions) {
      if (userExistingBadgeIds.includes(badgeDef.badgeId)) {
        continue; 
      }

      let criteriaMet = true; 
      for (const criterion of badgeDef.criteria) {
        let currentCriterionMet = false;
        switch (criterion.type) {
          case 'points':
            if (user.points && user.points >= (criterion.value as number)) {
              currentCriterionMet = true;
            }
            break;
          case 'streak':
            if (user.streakCount && user.streakCount >= (criterion.value as number)) {
              currentCriterionMet = true;
            }
            break;
          case 'level_achieved':
            if (user.currentLevel === criterion.value) {
              currentCriterionMet = true;
            }
            break;
          case 'quiz_completed':
            const completedQuizzes = user.exerciseHistory?.filter(
              att => att.exerciseType.includes('quiz') || att.exerciseType === 'multiple-choice' || att.exerciseType === 'fill-in-blanks' || att.exerciseType === 'matching'
            ).length || 0;
            if (completedQuizzes >= (criterion.count as number)) {
              currentCriterionMet = true;
            }
            break;
          case 'words_learned':
            if (user.points && user.points >= (criterion.count as number)) { // value yerine count kullanıldı (BadgeDefinition'a göre)
              currentCriterionMet = true;
            }
            break;
          default:
            currentCriterionMet = false; 
        }
        if (!currentCriterionMet) {
          criteriaMet = false;
          break; 
        }
      }

      if (criteriaMet) {
        const newBadgeEntry = {
          badgeId: badgeDef.badgeId,
          name: badgeDef.name,
          description: badgeDef.description,
          iconUrl: badgeDef.iconUrl,
          earnedAt: new Date(),
          isVisible: true,
        };
        newBadgesToAdd.push(newBadgeEntry); // Doğrudan user.badges'e pushlamak yerine biriktir
        awardedResults.push({ success: true, awardedBadge: badgeDef, message: `${badgeDef.name} rozeti kazanıldı!` });
      }
    }

    if (newBadgesToAdd.length > 0) {
      // Sadece badges alanını güncellemek için $push ve $each kullan
      await UserModel.updateOne(
        { _id: userId },
        { $push: { badges: { $each: newBadgesToAdd } } }
      );
      revalidatePath('/profile'); 
      revalidatePath('/dashboard'); 
    }
    
    return awardedResults.length > 0 ? awardedResults : [{ success: true, message: "Yeni kazanılan rozet yok." }];

  } catch (error) {
    console.error("Rozet kontrol ve verme hatası:", error);
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen bir sunucu hatası.";
    return [{ success: false, error: `Rozetler işlenirken bir hata oluştu: ${errorMessage}` }];
  }
}

export async function triggerBadgeCheck(): Promise<AwardBadgeResult[]> {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return [{ success: false, error: "Rozet kontrolü için kullanıcı oturumu bulunamadı." }];
    }
    return checkAndAwardBadges(userId);
}
