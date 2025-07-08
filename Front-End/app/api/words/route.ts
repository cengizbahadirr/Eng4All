import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// MongoDB'deki doküman yapısına uygun arayüzler (search rotasındaki ile aynı)
interface WordValue {
  word: string; // İngilizce kelime
  href?: string;
  type?: string;
  level?: string;
  us?: { mp3?: string; ogg?: string };
  uk?: { mp3?: string; ogg?: string };
  phonetics?: { us?: string; uk?: string };
  examples?: string[];
  type_tr?: string;
  examples_tr?: string[];
  category?: string; // Kategori alanı eklendi (JSON'da varsa)
  meaning?: string;  // Anlam alanı eklendi (JSON'da varsa)
  isFavorite?: boolean; // Favori durumu (eğer kullanıcıya özelse, bu farklı yönetilmeli)
  [key: string]: any;
}

interface MongoWordDocument { // Arayüz adı MongoDB dokümanını daha iyi yansıtması için değiştirildi
  _id: mongoose.Types.ObjectId | string;
  id: number; // JSON'daki kök seviye 'id' alanı
  value: WordValue;
}

// Frontend'in beklediği VocabularyWord formatı
interface VocabularyWordFrontend {
  id: number; // Orijinal JSON id'si
  word: string;
  type?: string;
  meaning?: string;
  phonetic?: string;
  level?: string;
  category?: string;
  examples?: string[];
  isFavorite?: boolean; // Bu, kullanıcıya özel olmalı ve ayrı yönetilmeli
                        // Şimdilik varsayılan olarak false dönebiliriz veya API'den bu bilgiyi almamalıyız.
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const levelFilter = searchParams.get('level');
  const categoryFilter = searchParams.get('category');
  const countParam = searchParams.get('count'); // İstenen kelime sayısı
  const excludeIdsParam = searchParams.get('excludeIds'); // Hariç tutulacak kelime ID'leri (öğrenilmişler)

  const count = countParam ? parseInt(countParam, 10) : 100; // Varsayılan 100
  let excludeIds: number[] = [];
  if (excludeIdsParam) {
    try {
      excludeIds = JSON.parse(excludeIdsParam);
    } catch (e) {
      console.error("Error parsing excludeIds:", e);
    }
  }

  try {
    await dbConnect();
    const collectionName = 'words';
    const dbInstance = mongoose.connection.db;
    if (!dbInstance) {
      throw new Error("Veritabanı bağlantısı bulunamadı.");
    }

    const matchStage: any = {};
    if (levelFilter && levelFilter !== "Tümü") {
      matchStage["value.level"] = levelFilter;
    }
    if (categoryFilter && categoryFilter !== "Tümü") {
      matchStage["value.category_tr"] = categoryFilter;
    }
    // Öğrenilmiş kelimeleri hariç tut
    if (excludeIds.length > 0) {
      matchStage["id"] = { $nin: excludeIds };
    }
    // Pratik için uygun kelimeleri seç (turkish_definition alanı olan ve boş olmayan)
    matchStage["value.turkish_definition"] = { $exists: true, $ne: "" };


    const pipeline = [
      { $match: matchStage },
      { $sample: { size: count } }
    ];

    const results = await dbInstance.collection<MongoWordDocument>(collectionName).aggregate(pipeline).toArray();

    if (results.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const formattedWords: VocabularyWordFrontend[] = results.map(doc => ({
      id: doc.id,
      word: doc.value.word,
      type: doc.value.type,
      meaning: doc.value.turkish_definition || "Detaylı Türkçe açıklama bulunmuyor.", // Uzun tanım
      turkish_word: doc.value.turkish_word, // Kısa Türkçe karşılık
      phonetic: doc.value.phonetics?.us || doc.value.phonetics?.uk,
      level: doc.value.level,
      category: doc.value.category_tr || "Genel", // Türkçe kategori adını kullan
      examples: doc.value.examples || [],
      isFavorite: doc.value.isFavorite || false,
      type_tr: doc.value.type_tr
    }));

    return NextResponse.json(formattedWords, { status: 200 });

  } catch (error) {
    console.error('API Kelime Getirme Hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası oluştu.';
    return NextResponse.json({ error: 'Kelimeler getirilirken sunucuda bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
