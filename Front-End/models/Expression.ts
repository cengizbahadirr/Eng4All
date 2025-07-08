import mongoose, { Schema, Document, Model } from 'mongoose';

// Bir ifadenin yapısını tanımlayan arayüz
export interface IExpressionEntry {
  expression: string;
  type: 'phrase' | 'idiom' | 'proverb';
  turkish_meaning: string;
  example_sentence: string;
}

// Ana dokümanın yapısını tanımlayan arayüz
// Seviyeler dinamik anahtarlar olduğu için index signature kullanıyoruz.
// Document'tan gelen özelliklerle çakışmayı önlemek için Record kullanıyoruz.
export interface IExpressionDocument extends Document {
  [key: string]: any; // Bu, A1, A2 gibi dinamik anahtarlara izin verir.
}

// Alt doküman şeması (Bu değişmiyor)
const ExpressionEntrySchema = new Schema<IExpressionEntry>({
  expression: { type: String, required: true },
  type: { type: String, required: true, enum: ['phrase', 'idiom', 'proverb'] },
  turkish_meaning: { type: String, required: true },
  example_sentence: { type: String, required: true },
}, { _id: false });

// Ana şema
// strict: false, Mongoose'un şemada tanımlanmayan (A1, A2, B1 gibi) alanları
// okumasına ve işlemesine izin verir. Bu, bizim durumumuz için anahtar çözümdür.
const ExpressionSchema = new Schema<IExpressionDocument>({}, {
  strict: false,
  collection: 'expressions'
});

const ExpressionModel: Model<IExpressionDocument> = mongoose.models.Expression || mongoose.model<IExpressionDocument>('Expression', ExpressionSchema);

export default ExpressionModel;
