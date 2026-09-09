export type ContentType = 'youtube' | 'twitter' | 'article' | 'thought' | 'document' | 'link';

export interface ITag {
  _id: string;
  title: string;
}

export interface IContent {
  _id: string;
  title: string;
  type: ContentType;
  link?: string;
  notes?: string;
  tags?: ITag[];
  userId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateContentInput {
  title: string;
  type: ContentType;
  link?: string;
  notes?: string;
  tags?: string[];
}