import type { IContent } from './content.types';

export interface ShareBrainResponse {
  hash: string | null;
  isPublic: boolean;
}

export interface PublishResponse {
  content: IContent;
  hash: string | null;
}

export interface PublicBrainData {
  username: string;
  content: IContent[];
}

export interface PublicContentData {
  username: string;
  content: IContent;
}
