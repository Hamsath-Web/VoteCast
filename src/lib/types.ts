import type { ImagePlaceholder } from './placeholder-images';

export interface Contestant {
  id: string;
  name: string;
  faceImage1: ImagePlaceholder;
  faceImage2: ImagePlaceholder;
  teamLogo: ImagePlaceholder;
  votes: number;
}

export interface Voting {
  id: string;
  title: string;
  contestants: Contestant[];
  status: 'open' | 'closed';
}
