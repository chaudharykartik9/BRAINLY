import { Schema, model, Document, Types } from 'mongoose';

export interface IBrainLink extends Document {
  hash: string;          // Unique random slug (e.g., 'a8f9b2d3')
  userId: Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
}

const brainLinkSchema = new Schema<IBrainLink>(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // 1 shareable hash link per user
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const BrainLink = model<IBrainLink>('BrainLink', brainLinkSchema);