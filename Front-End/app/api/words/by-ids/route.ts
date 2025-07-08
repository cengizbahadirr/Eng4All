import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// MongoDB'deki doküman yapısına uygun arayüzler (diğer API rotalarındaki ile aynı)
interface WordValue {
  word: string;
  href?: string;
  type?: string;
  level?: string;
  us?: { mp3?: string; ogg?: string };
  uk?: { mp3?: string; ogg?: string };
  phonetics?: { us?: string; uk?: string };
  examples?: string[];
  type_tr?: string;
  examples_tr?: string[];
  category?: string;
  meaning?: string; 
  turkish_word?: string;
  turkish_definition?: string;
  isFavorite?: boolean; 
  [key: string]: any;
}

interface MongoWordDocument {
  _id: mongoose.Types.ObjectId | string;
  id: number; // JSON'daki kök seviye 'id' alanı
  value: WordValue;
}

// Frontend'in beklediği VocabularyWord formatı
interface VocabularyWordFrontend {
  id: number;
  word: string;
  type?: string;
  meaning?: string; // Detaylı Türkçe tanım (turkish_definition)
  turkish_word?: string; // Kısa Türkçe karşılık
  phonetic?: string;
  level?: string;
  category?: string;
  examples?: string[];
  isFavorite?: boolean; // Bu, kullanıcıya özel olmalı
  type_tr?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');

  if (!idsParam) {
    return NextResponse.json({ error: 'Kelime IDleri gerekli.' }, { status: 400 });
  }

  const idsArray: number[] = idsParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

  if (idsArray.length === 0) {
    return NextResponse.json([], { status: 200 }); // Boş ID listesi için boş sonuç
  }

  try {
    await dbConnect();
    const collectionName = 'words';
    const dbInstance = mongoose.connection.db;
    if (!dbInstance) {
      throw new Error("Veritabanı bağlantısı bulunamadı.");
    }

    // Verilen ID'lere sahip kelimeleri bul
    const results = await dbInstance.collection<MongoWordDocument>(collectionName)
      .find({ id: { $in: idsArray } }) // MongoDB'deki 'id' alanına göre arama
      .toArray();

    if (results.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const formattedWords: VocabularyWordFrontend[] = results.map(doc => ({
      id: doc.id,
      word: doc.value.word,
      type: doc.value.type,
      meaning: doc.value.turkish_definition || "Detaylı Türkçe açıklama bulunmuyor.",
      turkish_word: doc.value.turkish_word,
      phonetic: doc.value.phonetics?.us || doc.value.phonetics?.uk,
      level: doc.value.level,
      category: doc.value.category || "Genel",
      examples: doc.value.examples || [],
      isFavorite: true, // Bu sayfada listelenenler zaten favori olduğu için true
      type_tr: doc.value.type_tr
    }));

    // İstenen ID sırasına göre sonuçları sıralayabiliriz (isteğe bağlı)
    const orderedResults = idsArray.map(id => formattedWords.find(word => word.id === id)).filter(Boolean) as VocabularyWordFrontend[];

    return NextResponse.json(orderedResults, { status: 200 });

  } catch (error) {
    console.error('API Favori Kelimeleri Getirme Hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası oluştu.';
    return NextResponse.json({ error: 'Favori kelimeler getirilirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
