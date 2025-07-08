import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IRepetitionListItem {
  wordId: number;
  status: 'pending' | 'reviewed';
  addedAt: Date;
}

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  targetLevel?: string;
  currentLevel?: string; 
  points?: number;
  weeklyPoints?: number;
  successPercentage?: number; 
  badges?: Array<{ 
    badgeId: string;
    name: string;
    description?: string;
    iconUrl: string;
    earnedAt: Date;
    isVisible?: boolean;
  }>;
  streakCount?: number;
  lastLoginAt?: Date;
  preferredLanguage?: string;
  favoriteWords?: number[]; 
  repetitionList?: IRepetitionListItem[];
  createdAt?: Date;
  updatedAt?: Date;
  grammarScores?: IGrammarScore[]; 
  chatHistory?: IChatMessage[]; 
  exerciseHistory?: IExerciseAttempt[]; 
  dailyActivity?: IDailyActivity[]; 
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IGrammarAttemptDetails { 
  score: number;
  totalQuestions: number;
  date: Date;
}

export interface IGrammarScore { 
  topicId: string;
  attempts: number;
  bestScore?: number;
  lastAttempt?: IGrammarAttemptDetails;
  isCompleted?: boolean; 
}

export interface IChatMessage {
  id: string; 
  text: string;
  sender: "user" | "ai";
  corrected_text?: string;
  explanation_tr?: string;
  timestamp: Date;
}

export interface IUserAnswer { // Export eklendi
  questionId: string; 
  questionText: string; 
  userAnswer?: string; 
  correctAnswer: string; 
  isCorrect: boolean; 
  explanation?: string; 
  options?: string[]; 
  questionType?: 'fill-in-blanks' | 'multiple-choice' | 'matching';
}

export interface IExerciseAttempt { 
  exerciseId: string; 
  exerciseType: string; 
  category: string; 
  topic: string; 
  level: string; 
  date: Date; 
  score: number; 
  totalQuestions: number;
  correctCount: number; 
  incorrectCount: number; 
  unansweredCount: number; 
  answeredQuestions: IUserAnswer[]; 
  duration: number; 
}

export interface IDailyActivity { 
  date: Date; 
  durationInSeconds: number; 
}

const RepetitionListItemSchema = new Schema<IRepetitionListItem>({
    wordId: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
    addedAt: { type: Date, default: Date.now },
}, { _id: false });

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: [true, 'E-posta adresi gereklidir.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Lütfen geçerli bir e-posta adresi girin.'],
    },
    password: {
      type: String,
      required: [true, 'Şifre gereklidir.'],
      minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
      select: false, 
    },
    avatarUrl: { type: String, trim: true },
    targetLevel: { type: String, trim: true },
    currentLevel: { type: String, trim: true },
    points: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 },
    successPercentage: { type: Number, default: 0, min: 0, max: 100 },
    badges: [{
        badgeId: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        iconUrl: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
        isVisible: { type: Boolean, default: true },
    }],
    streakCount: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    preferredLanguage: { type: String, default: 'tr' },
    favoriteWords: { type: [Number], default: [], select: true },
    repetitionList: { type: [RepetitionListItemSchema], default: [] },
    grammarScores: {
      type: [
        new Schema<IGrammarScore>({
          topicId: { type: String, required: true },
          attempts: { type: Number, default: 0 },
          bestScore: { type: Number, default: 0 },
          lastAttempt: {
            score: { type: Number },
            totalQuestions: { type: Number },
            date: { type: Date },
          },
          isCompleted: { type: Boolean, default: false },
        }, { _id: false })
      ],
      default: [],
      select: true, 
    },
    chatHistory: { 
      type: [
        new Schema<IChatMessage>({
          id: { type: String, required: true },
          text: { type: String, required: true },
          sender: { type: String, enum: ["user", "ai"], required: true },
          corrected_text: { type: String },
          explanation_tr: { type: String },
          timestamp: { type: Date, default: Date.now },
        }, { _id: false })
      ],
      default: [],
      select: false, 
    },
    exerciseHistory: { 
      type: [
        new Schema<IExerciseAttempt>({
          exerciseId: { type: String, required: true }, 
          exerciseType: { type: String, required: true },
          category: { type: String, required: true },
          topic: { type: String, required: true },
          level: { type: String, required: true },
          date: { type: Date, default: Date.now },
          score: { type: Number, required: true },
          totalQuestions: { type: Number, required: true },
          correctCount: { type: Number, required: true }, 
          incorrectCount: { type: Number, required: true }, 
          unansweredCount: { type: Number, required: true }, 
          duration: { type: Number, required: true },
          answeredQuestions: {
            type: [
              new Schema<IUserAnswer>({
                questionId: { type: String, required: true },
                questionText: { type: String, required: true },
                userAnswer: { type: String },
                correctAnswer: { type: String, required: true },
                isCorrect: { type: Boolean, required: true },
                explanation: { type: String },
                options: { type: [String], default: [] },
                questionType: { type: String, enum: ['fill-in-blanks', 'multiple-choice', 'matching'], default: 'multiple-choice' },
              }, { _id: false })
            ],
            default: [],
          }
        }, { _id: false })
      ],
      default: [],
      select: false, 
    },
    dailyActivity: { 
      type: [
        new Schema<IDailyActivity>({
          date: { type: Date, required: true },
          durationInSeconds: { type: Number, required: true, default: 0 },
        }, { _id: false })
      ],
      default: [],
    },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    if (err instanceof Error) {
        return next(err);
    }
    return next(new Error('Bilinmeyen bir hata oluştu şifre hashlenirken.'));
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
