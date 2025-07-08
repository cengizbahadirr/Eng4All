import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */

// Mongoose bağlantı önbelleği için global tip tanımı
declare global {
  // eslint-disable-next-line no-var
  var __db_cache__: { // Global değişken adı değiştirildi
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined; // Başlangıçta undefined olabilir
}

// global.__db_cache__ başlatılıyor
if (!global.__db_cache__) {
  global.__db_cache__ = { conn: null, promise: null };
}

// cached değişkenini global önbelleğe referans olarak ayarla
// Bu noktada global.__db_cache__'in tanımlı olduğunu varsayıyoruz.
const cached = global.__db_cache__;

async function dbConnect() {
  // cached'in null/undefined olmadığını kontrol et (teorik olarak yukarıdaki blok bunu sağlamalı)
  // Ancak TypeScript'in emin olması için bir kontrol daha eklenebilir veya non-null assertion kullanılabilir.
  // Şimdilik mevcut mantıkla devam edelim, eğer hata devam ederse bu kısmı tekrar değerlendiririz.

  if (cached.conn) {
    console.log('MongoDB: Using existing connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Komutları arabelleğe almayı devre dışı bırak
    };

    console.log('MongoDB: Creating new connection');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('MongoDB: Connection successful');
      return mongooseInstance;
    }).catch(error => {
      console.error('MongoDB: Connection error:', error);
      cached.promise = null; // Hata durumunda promise'i sıfırla
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Hata durumunda promise'i sıfırla ki bir sonraki denemede yeniden bağlantı kurulsun
    if (cached) { // cached'in varlığını kontrol et
        cached.promise = null;
    }
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
