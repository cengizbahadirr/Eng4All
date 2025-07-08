import mongoose, { Schema, Document, Model } from 'mongoose';

// Arayüzler, veritabanı dokümanınızın yapısını yansıtmalı
interface IPronunciation {
  mp3?: string;
  ogg?: string;
}

interface IPhonetics {
  us?: string;
  uk?: string;
}

interface IWordValue {
  word: string;
  href?: string;
  type?: string;
  level?: string;
  us?: IPronunciation;
  uk?: IPronunciation;
  phonetics?: IPhonetics;
  examples?: string[];
  turkish_word?: string;
  turkish_definition?: string;
  examples_turkish?: string[];
  turkish_type?: string;
  category_tr?: string;
}

export interface IWord extends Document {
  id: number; // Orijinal JSON'daki id
  value: IWordValue;
}

const PronunciationSchema = new Schema<IPronunciation>({
  mp3: String,
  ogg: String,
}, { _id: false });

const PhoneticsSchema = new Schema<IPhonetics>({
  us: String,
  uk: String,
}, { _id: false });

const WordValueSchema = new Schema<IWordValue>({
  word: { type: String, required: true, index: true },
  href: String,
  type: String,
  level: { type: String, index: true },
  us: PronunciationSchema,
  uk: PronunciationSchema,
  phonetics: PhoneticsSchema,
  examples: [String],
  turkish_word: String,
  turkish_definition: String,
  examples_turkish: [String],
  turkish_type: String,
  category_tr: { type: String, index: true },
}, { _id: false });

const WordSchema: Schema<IWord> = new Schema({
  id: { type: Number, required: true, unique: true },
  value: { type: WordValueSchema, required: true },
}, {
  collection: 'words' // Koleksiyon adını belirtiyoruz
});

const WordModel: Model<IWord> = mongoose.models.Word || mongoose.model<IWord>('Word', WordSchema);

export default WordModel;
