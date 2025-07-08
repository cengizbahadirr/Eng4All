import { createClient, RedisClientType } from 'redis';

// Geliştirme ortamında, HMR (Hot Module Replacement) kaynaklı yeniden yüklemelerde
// istemciyi korumak için global bir değişken kullanırız.
declare global {
  var redisClient: RedisClientType | undefined;
}

let client: RedisClientType;

const url = process.env.REDIS_URL;
if (!url) {
  throw new Error("REDIS_URL ortam değişkeni tanımlanmamış.");
}

if (process.env.NODE_ENV === 'production') {
  // Production ortamında her zaman yeni bir istemci oluşturmak güvenlidir.
  client = createClient({ url });
} else {
  // Geliştirme ortamında, istemcinin global alanda olup olmadığını kontrol et.
  if (!global.redisClient) {
    console.log("Geliştirme ortamı için yeni Redis istemcisi oluşturuluyor...");
    global.redisClient = createClient({ url });
  }
  client = global.redisClient;
}

// Hata ve bağlantı durumlarını izlemek için olay dinleyicileri ekleyelim.
client.removeAllListeners(); // Önceki dinleyicileri temizle (HMR için önemli)
client.on('error', (err) => console.error('Redis Client Hatası:', err));
client.on('connect', () => console.log('Redis istemcisi bağlandı.'));
client.on('reconnecting', () => console.log('Redis istemcisi yeniden bağlanıyor...'));
client.on('end', () => console.log('Redis bağlantısı kapandı.'));

// İstemcinin kullanılmadan önce bağlı olduğundan emin olalım.
// Burada await kullanmıyoruz çünkü modülün hemen export edilmesi gerekiyor.
// İstemci, bağlantı kurulana kadar komutları kuyruğa alacaktır.
if (!client.isOpen) {
  console.log("Mevcut bağlantı yok, client.connect() çağrılıyor...");
  client.connect().catch(console.error);
}

export default client;
