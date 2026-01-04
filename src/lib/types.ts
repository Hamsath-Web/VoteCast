
export interface Contestant {
  id: string;
  name: string;
  faceImage: string;
  votes: number;
}

export interface Voting {
  id: string;
  title: string;
  // contestants are now a subcollection, so we won't store them directly in the voting document.
  // We might keep this for local state management if needed, but Firestore structure is key.
  contestants?: Contestant[]; 
  status: 'open' | 'closed';
}
