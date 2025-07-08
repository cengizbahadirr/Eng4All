import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFeedback extends Document {
  userId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt?: Date;
}

const FeedbackSchema: Schema<IFeedback> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Puanlama gereklidir.'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Yorum 1000 karakterden uzun olamaz.'],
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

const FeedbackModel: Model<IFeedback> = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default FeedbackModel;
