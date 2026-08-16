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
  description?: string;
  tags?: string[];
  userId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateContentInput {
  title: string;
  type: ContentType;
  link?: string;
  description?: string;
  tags?: string[];
}