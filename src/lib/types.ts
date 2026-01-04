
export interface Contestant {
  id: string;
  name: string;
  faceImage: string;
  teamLogo: string;
  votes: number;
}

export interface Voting {
  id: string;
  title: string;
  contestants: Contestant[];
  status: 'open' | 'closed';
}
