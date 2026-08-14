import { Schema, model, Document } from 'mongoose';

export interface ITag extends Document {
  title: string;
}

const tagSchema = new Schema<ITag>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Tag = model<ITag>('Tag', tagSchema);