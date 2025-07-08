import mongoose, { Document, Schema, Model } from 'mongoose';

interface IVideoEntry {
  url: string;
  title: string;
}

// VideoEntry için bir alt şema
const VideoEntrySchema = new Schema<IVideoEntry>({
  url: { type: String, required: true },
  title: { type: String, required: true },
}, { _id: false }); // Alt dokümanlar için _id oluşturma

// Ana VideoLinks dokümanı için arayüz
export interface IVideoLinks extends Document {
  kelime?: IVideoEntry[];
  gramer?: IVideoEntry[];
  konusma?: IVideoEntry[];
  isIngilizcesi?: IVideoEntry[]; // 'iş İngilizcesi' için camelCase
  // Gelecekte eklenebilecek diğer kategoriler
  [key: string]: IVideoEntry[] | any; // Diğer dinamik kategoriler için
}

// Ana VideoLinks şeması
const VideoLinksSchema = new Schema<IVideoLinks>({
  kelime: [VideoEntrySchema],
  gramer: [VideoEntrySchema],
  konusma: [VideoEntrySchema],
  isIngilizcesi: [VideoEntrySchema],
}, {
  timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  collection: 'videoLinks', // Koleksiyon adını belirtiyoruz
  strict: false, // Şemada tanımlanmayan alanların da kaydedilmesine izin verir (dinamik kategoriler için)
});

// Modelin zaten derlenip derlenmediğini kontrol et
const VideoLinksModel: Model<IVideoLinks> = mongoose.models.VideoLinks || mongoose.model<IVideoLinks>('VideoLinks', VideoLinksSchema);

export default VideoLinksModel;
