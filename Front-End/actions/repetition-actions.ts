"use server";

import mongoose from 'mongoose';
import dbConnect from "@/lib/mongodb";
import UserModel from "@/models/User";
import WordModel from "@/models/Word";
import { getUserIdFromToken } from "@/actions/auth-actions";
import { revalidatePath } from "next/cache";
import { Db } from 'mongodb';

// Otomatik liste oluşturma
export async function generateRepetitionList() {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, error: "Kullanıcı oturumu bulunamadı." };

  try {
    await dbConnect();
    const user = await UserModel.findById(userId).select('exerciseHistory repetitionList');
    if (!user) return { success: false, error: "Kullanıcı bulunamadı." };

    if (!user.exerciseHistory || user.exerciseHistory.length === 0) {
      return { success: false, error: "Otomatik liste oluşturmak için yeterli veri bulunmamaktadır." };
    }

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const incorrectWords = new Set<number>();
    user.exerciseHistory.forEach(attempt => {
      if (new Date(attempt.date) > oneMonthAgo) {
        attempt.answeredQuestions.forEach(answer => {
          if (!answer.isCorrect && answer.questionId.match(/^\d+$/)) {
            incorrectWords.add(Number(answer.questionId));
          }
        });
      }
    });
    
    const existingWordIds = new Set(user.repetitionList?.map(item => item.wordId));
    const newWordsToAdd = Array.from(incorrectWords).filter(id => !existingWordIds.has(id));

    if (newWordsToAdd.length === 0) {
      return { success: true, message: "Tekrar listeniz zaten güncel veya tekrar edilecek yeni kelime bulunamadı." };
    }

    const newRepetitionItems = newWordsToAdd.map(wordId => ({
      wordId,
      status: 'pending' as const,
      addedAt: new Date(),
    }));

    const result = await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { repetitionList: { $each: newRepetitionItems } } }
    );

    if (result.modifiedCount === 0) {
        console.warn("generateRepetitionList: Kullanıcı bulundu ancak liste güncellenmedi.");
    }

    revalidatePath('/review');
    return { success: true, message: `${newWordsToAdd.length} yeni kelime tekrar listenize eklendi.` };

  } catch (error) {
    console.error("Otomatik tekrar listesi oluşturma hatası:", error);
    return { success: false, error: "Liste oluşturulurken bir hata oluştu." };
  }
}

// Kelimeyi listeye manuel ekleme
export async function addWordToRepetitionList(wordId: number) {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, error: "Kullanıcı oturumu bulunamadı." };

  try {
    await dbConnect();
    const user = await UserModel.findById(userId).select('repetitionList');
    if (!user) return { success: false, error: "Kullanıcı bulunamadı." };

    if (user.repetitionList?.some(item => item.wordId === wordId)) {
      return { success: false, error: "Bu kelime zaten tekrar listenizde mevcut." };
    }

    const newItem = { wordId, status: 'pending' as const, addedAt: new Date() };
    const result = await UserModel.updateOne({ _id: userId }, { $push: { repetitionList: newItem } });

    if (result.modifiedCount === 0) {
        return { success: false, error: "Kelime listeye eklenemedi." };
    }

    revalidatePath('/review');
    return { success: true, message: "Kelime tekrar listesine eklendi." };

  } catch (error) {
    console.error("Kelimeyi tekrar listesine ekleme hatası:", error);
    return { success: false, error: "İşlem sırasında bir hata oluştu." };
  }
}

// Kelimeyi "tekrar edildi" olarak işaretleme
export async function markWordAsReviewed(wordId: number) {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, error: "Kullanıcı oturumu bulunamadı." };

  try {
    await dbConnect();
    const result = await UserModel.updateOne(
      { _id: userId, "repetitionList.wordId": wordId },
      { $set: { "repetitionList.$.status": "reviewed" } }
    );

    if (result.modifiedCount === 0) {
      return { success: false, error: "Kelime listede bulunamadı veya zaten güncel." };
    }

    revalidatePath('/review');
    return { success: true, message: "Kelime tekrar edildi olarak işaretlendi." };

  } catch (error) {
    console.error("Kelimeyi tekrar edildi olarak işaretleme hatası:", error);
    return { success: false, error: "İşlem sırasında bir hata oluştu." };
  }
}

// Tekrar listesini kelime detaylarıyla birlikte getirme (Native Driver ile)
export async function getRepetitionList() {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, error: "Kullanıcı oturumu bulunamadı.", list: [] };

  try {
    const mongooseInstance = await dbConnect();
    const db: Db | undefined = mongooseInstance.connection.db;
    if (!db) {
        throw new Error("Veritabanı bağlantısı kurulamadı.");
    }

    const user = await db.collection('users').findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { projection: { repetitionList: 1 } }
    );
    
    if (!user || !user.repetitionList || user.repetitionList.length === 0) {
      return { success: true, list: [] };
    }

    const wordIds = user.repetitionList.map((item: any) => item.wordId);
    if (wordIds.length === 0) {
        return { success: true, list: [] };
    }
    
    const words = await db.collection('words').find({ id: { $in: wordIds } }).toArray();
    
    const wordMap = new Map(words.map((word: any) => [word.id, word]));

    const populatedList = user.repetitionList.map((item: any) => ({
      ...item,
      wordDetails: wordMap.get(item.wordId) || null,
    }));

    const plainResults = JSON.parse(JSON.stringify(populatedList));
    return { success: true, list: plainResults };

  } catch (error) {
    console.error("Tekrar listesi getirme hatası:", error);
    return { success: false, error: "Liste getirilirken bir hata oluştu.", list: [] };
  }
}
