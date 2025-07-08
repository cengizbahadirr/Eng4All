import mongoose, { Schema, Document, Model } from 'mongoose';

// Bir eş anlamlı girişinin yapısını tanımlayan arayüz
export interface ISynonymEntry {
  word: string;
  synonyms: string[];
}

// Ana dokümanın yapısını tanımlayan arayüz
// Seviyeler dinamik anahtarlar olduğu için index signature kullanıyoruz.
export interface ISynonymDocument extends Document {
  [level: string]: any; // Bu, A1, A2 gibi dinamik anahtarlara izin verir.
}

// Alt doküman şeması
const SynonymEntrySchema = new Schema<ISynonymEntry>({
  word: { type: String, required: true },
  synonyms: { type: [String], required: true },
}, { _id: false });

// Ana şema
// strict: false, Mongoose'un şemada tanımlanmayan (A1, A2, B1 gibi) alanları
// okumasına ve işlemesine izin verir.
const SynonymSchema = new Schema<ISynonymDocument>({}, {
  strict: false,
  collection: 'synonyms'
});

const SynonymModel: Model<ISynonymDocument> = mongoose.models.Synonym || mongoose.model<ISynonymDocument>('Synonym', SynonymSchema);

export default SynonymModel;
