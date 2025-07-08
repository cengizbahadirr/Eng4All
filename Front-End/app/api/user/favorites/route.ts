import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose'; // mongoose'u import et
import { ObjectId, Db, Filter, UpdateFilter, FindOptions } from 'mongodb'; // Gerekli tipleri mongodb paketinden import et
import dbConnect from '@/lib/mongodb';
// IUser Mongoose'a özgü olduğu için native driver ile doğrudan kullanmak tip sorunlarına yol açabilir.
// import { IUser } from '@/models/User'; 
import { jwtVerify } from "jose";

// Native driver ile kullanmak için basit bir interface
interface UserDBSchema {
  _id: ObjectId;
  email?: string;
  favoriteWords?: number[];
  // Diğer gerekli alanlar buraya eklenebilir
}

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET tanımlanmamış.");
    return null;
  }
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload && typeof payload.userId === 'string') {
      return payload.userId;
    }
    return null; 
  } catch (error) {
    console.error("API JWT doğrulama hatası:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  console.log("/api/user/favorites POST isteği alındı");
  const userId = await getUserIdFromToken(request);
  console.log("Token'dan alınan userId:", userId);

  if (!userId) { 
    console.error("Yetkisiz erişim: userId bulunamadı veya geçersiz.");
    return NextResponse.json({ error: 'Yetkisiz erişim. Oturum bulunamadı veya geçersiz.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("İstek gövdesi (body):", body);
    const { wordId, action }: { wordId: number; action: 'add' | 'remove' } = body;

    if (typeof wordId !== 'number' || !['add', 'remove'].includes(action)) {
      console.error("Geçersiz istek parametreleri:", { wordId, action });
      return NextResponse.json({ error: 'Geçersiz istek parametreleri: wordId sayı olmalı ve action "add" veya "remove" olmalı.' }, { status: 400 });
    }
    console.log("Parametreler geçerli:", { wordId, action });

    const mongooseConnection = await dbConnect();
    console.log("MongoDB bağlantısı (Mongoose üzerinden) başarılı.");
    
    if (!mongooseConnection || !mongooseConnection.connection || !mongooseConnection.connection.db) {
        console.error("MongoDB bağlantı nesnesi, connection özelliği veya db özelliği tanımsız.");
        return NextResponse.json({ error: "Veritabanı bağlantı hatası." }, { status: 500 });
    }
    const db: Db = mongooseConnection.connection.db; 
    const usersCollection = db.collection<UserDBSchema>('users'); // UserDBSchema tipi ile koleksiyonu al

    // userId'yi ObjectId'ye çevir
    let objectIdUserId: ObjectId; // Tipi mongodb.ObjectId olarak belirt
    try {
      objectIdUserId = new ObjectId(userId); // mongodb.ObjectId kullan
    } catch (e) {
      console.error("Geçersiz userId formatı, ObjectId'ye çevrilemedi:", userId, e);
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID formatı.' }, { status: 400 });
    }

    const filter: Filter<UserDBSchema> = { _id: objectIdUserId };

    // Kullanıcının varlığını ve mevcut favorilerini kontrol et
    const currentUserState = await usersCollection.findOne(filter, { projection: { favoriteWords: 1, email: 1 } } as FindOptions<UserDBSchema>);
    console.log("İşlem öncesi kullanıcı durumu (native driver):", currentUserState);
    if (!currentUserState) {
        console.error("Kullanıcı bulunamadı (native driver):", userId);
        return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    let updateQuery: UpdateFilter<UserDBSchema>;
    if (action === 'add') {
      console.log(`Kelime ${wordId} favorilere eklenecek (native driver + $addToSet).`);
      updateQuery = { $addToSet: { favoriteWords: wordId as any } }; // as any geçici çözüm olabilir, normalde number[] olmalı
    } else { // action === 'remove'
      console.log(`Kelime ${wordId} favorilerden çıkarılacak (native driver + $pull).`);
      updateQuery = { $pull: { favoriteWords: wordId as any } }; // as any geçici çözüm olabilir
    }
    
    const updateResult = await usersCollection.updateOne(filter, updateQuery);
    console.log("Native driver updateOne sonucu:", updateResult);

    if (!updateResult?.acknowledged) {
        console.error("Favori güncelleme işlemi MongoDB tarafından onaylanmadı (native driver).");
        return NextResponse.json({ error: 'Favori güncellenirken bir sorun oluştu.' }, { status: 500 });
    }
    if (updateResult.matchedCount === 0) {
        console.error("Eşleşen kullanıcı bulunamadı, güncelleme yapılamadı (native driver).");
        return NextResponse.json({ error: 'Kullanıcı bulunamadı, favori güncellenemedi.' }, { status: 404 });
    }

    // Güncellenmiş favori listesini almak için kullanıcıyı tekrar çek
    const updatedUserDoc = await usersCollection.findOne(filter, { projection: { favoriteWords: 1 } } as FindOptions<UserDBSchema>);
    console.log("Güncelleme sonrası taze çekilmiş kullanıcı favorileri (native driver):", updatedUserDoc?.favoriteWords);

    return NextResponse.json({ 
      success: true, 
      message: `Kelime başarıyla favorilerden ${action === 'add' ? 'eklendi' : 'çıkarıldı'}.`,
      favoriteWords: updatedUserDoc?.favoriteWords || [] 
    }, { status: 200 });

  } catch (error) {
    console.error('Favori güncelleme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ error: 'Favori güncellenirken bir hata oluştu.', details: errorMessage }, { status: 500 });
  }
}
