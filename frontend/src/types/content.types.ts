export type ContentType = 'youtube' | 'twitter' | 'article' | 'thought' | 'document' | 'link';

export interface ITag {
  _id: string;
  title: string;
}

export interface IContentMetadata {
  thumbnail?: string;
  author?: string;
  description?: string;
}

export interface IContent {
  _id: string;
  title: string;
  type: ContentType;
  link?: string;
  notes?: string;
  tags?: ITag[];
  userId?: string;
  isPublic?: boolean;
  isPinned?: boolean;
  metadata?: IContentMetadata;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TagCount {
  title: string;
  count: number;
}

export interface PaginatedContent {
  items: IContent[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface GetContentParams {
  page?: number;
  limit?: number;
  type?: ContentType;
  tag?: string;
  search?: string;
}

export interface CreateContentInput {
  title: string;
  type: ContentType;
  link?: string;
  notes?: string;
  tags?: string[];
}

export type UpdateContentInput = Partial<CreateContentInput> & { isPinned?: boolean };