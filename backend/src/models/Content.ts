import { Schema, model, Document, Types } from 'mongoose';

export type ContentType = 'twitter' | 'youtube' | 'article' | 'link' | 'document' | 'thought';

export interface IContent extends Document {
  title: string;
  type: ContentType;
  link?: string;
  notes?: string;
  tags: Types.ObjectId[];
  userId: Types.ObjectId;
  isPinned: boolean;
  isPublic: boolean;
  metadata?: {
    thumbnail?: string;
    author?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['twitter', 'youtube', 'article', 'link', 'document', 'thought'],
      required: true,
      default: 'thought',
    },
    link: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Speeds up dashboard queries per user
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true, // Speeds up public-brain queries
    },
    metadata: {
      thumbnail: { type: String },
      author: { type: String },
      description: { type: String },
    },
  },
  { timestamps: true }
);

// Compound index for querying user items filtered by type/creation date
contentSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const Content = model<IContent>('Content', contentSchema);