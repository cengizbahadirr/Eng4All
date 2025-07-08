import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose, { mongo } from 'mongoose';

// MongoDB'deki doküman yapısına uygun güncellenmiş arayüzler
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
  // JSON'daki 'value' nesnesinin içindeki diğer tüm alanlar
  [key: string]: any;
}

interface WordDocument {
  _id: mongoose.Types.ObjectId | string;
  id: number; // JSON'daki kök seviye 'id' alanı
  value: WordValue;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term || term.trim() === "") {
    return NextResponse.json({ error: 'Arama terimi gerekli' }, { status: 400 });
  }

  try {
    await dbConnect(); // Mongoose bağlantısını kur

    // 'words' koleksiyonunda arama yapacağımızı varsayalım.
    // Koleksiyon adınız farklıysa (örn: 'kelimeler', 'dictionary') burayı güncelleyin.
    const collectionName = 'words'; // GERÇEK KOLEKSİYON ADINIZLA DEĞİŞTİRİN

    // Hem Türkçe hem de İngilizce alanlarda arama yapalım.
    // Alan adlarınız farklıysa (örn: 'turkce_kelime', 'ingilizce_kelime') burayı güncelleyin.
    const searchTerm = term.trim();
    // Regex'i kelime sınırlarıyla (\b) kullanarak daha kesin eşleşmeler yapmaya çalışalım.
    // Bu, "car" aramasının "care" veya "scarf" gibi kelimeleri getirmesini engellemeye yardımcı olur.
    // JavaScript string'lerinde \b özel bir karakter olduğu için \\b şeklinde kaçış yapmamız gerekir.
    const exactWordRegex = `\\b${searchTerm}\\b`;

    const query = {
      $or: [
        { "value.word": { $regex: exactWordRegex, $options: 'i' } },
        // Türkçe örneklerde arama yaparken de kelime sınırlarını kullanabiliriz.
        // Bu, aranan Türkçe kelimenin tam olarak eşleşmesini sağlar.
        { "value.examples_tr": { $regex: exactWordRegex, $options: 'i' } }
        // Eğer JSON'da doğrudan bir Türkçe kelime alanı olsaydı (örn: "value.turkish_equivalent"),
        // onu da buraya eklerdik: { "value.turkish_equivalent": { $regex: exactWordRegex, $options: 'i' } }
      ]
    };

    const dbInstance = mongoose.connection.db;
    if (!dbInstance) {
      throw new Error("Veritabanı bağlantısı bulunamadı. mongoose.connection.db tanımsız.");
    }
    const results = await dbInstance.collection<WordDocument>(collectionName).find(query).limit(10).toArray();

    if (results.length === 0) {
      return NextResponse.json({ message: `"${term}" kelimesi bulunamadı.` }, { status: 404 });
    }

    // Frontend'in beklediği SearchResult formatına dönüştürme (gerekirse)
    // Frontend'in beklediği SearchResult formatına dönüştürme
    // JSON yapımızda 'value.word' İngilizce kelime. Türkçe karşılığı için doğrudan bir alan yok.
    // 'value.type_tr' kelimenin Türkçe türü.
    // 'value.examples_tr' Türkçe örnekler.
    // Bu durumda 'translation' alanını nasıl dolduracağımız önemli.
    // Şimdilik, eğer aranan terim İngilizce ise, Türkçe türünü çeviri gibi gösterebiliriz
    // veya örneklerden birini. Bu ideal değil.
    const formattedResults = results.map(doc => {
      const val = doc.value;
      let wordToDisplay = val.word; // Genellikle İngilizce kelime
      let translationToDisplay = val.type_tr || "Çeviri bulunamadı"; // Geçici çözüm
      // Çeviri için daha iyi bir mantık:
      // Eğer JSON'da 'value.turkish_equivalent' gibi bir alan varsa onu kullan.
      // Yoksa, 'value.type_tr' (kelimenin Türkçe türü) veya 'value.examples_tr'dan bir parça al.
      // Şimdilik 'value.type_tr'yi kullanmaya devam edelim, ancak bu ideal değil.
      // Gerçek bir çeviri alanı (value.turkish_translation gibi) en iyisi olurdu.
      let actualTranslation = val.type_tr || "Çeviri bilgisi yok";
      if (val.word.toLowerCase() === term.trim().toLowerCase()) { // Eğer aranan kelime İngilizce kelime ise
        // Türkçe çeviriyi bulmaya çalış
        // Örnek: Eğer value.translations_tr: ["anlam1", "anlam2"] gibi bir alan varsa:
        // actualTranslation = val.translations_tr ? val.translations_tr.join(', ') : actualTranslation;
      } else { // Aranan kelime Türkçe bir örnekte bulunduysa
        // İngilizce kelimeyi ve onun "çevirisini" (yani İngilizce türünü) göster
        actualTranslation = val.type || "İngilizce türü belirtilmemiş";
      }


      return {
        _id: doc._id,
        id: doc.id,
        value: val, // Frontend'in tüm detaylara erişebilmesi için orijinal 'value' nesnesini gönder
        // Frontend'in doğrudan kullanacağı temel alanlar:
        word: val.word, // Her zaman İngilizce kelimeyi gösterelim
        translation: actualTranslation,
        // Örnekleri ayrı ayrı gönderelim, frontend'de daha iyi formatlanabilir
        examples_en: val.examples || [],
        examples_tr: val.examples_tr || [],
        // Eş anlamlılar (varsa)
        // synonyms_en: val.synonyms_en || [],
        // synonyms_tr: val.synonyms_tr || [],
        level: val.level,
        type: val.type, // İngilizce tür
        type_tr: val.type_tr // Türkçe tür
      };
    });

    return NextResponse.json(formattedResults, { status: 200 });

  } catch (error) {
    console.error('API Arama Hatası:', error);
    // Geliştirme ortamında daha detaylı hata mesajı döndürebilirsiniz.
    // Production'da genel bir mesaj daha uygun olabilir.
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası oluştu.';
    return NextResponse.json({ error: 'Arama sırasında sunucuda bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
