import type { IContent } from './content.types';

export interface ShareBrainResponse {
  hash: string;
  isPublic: boolean;
}

export interface PublicBrainData {
  username: string;
  content: IContent[];
}