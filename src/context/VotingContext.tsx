'use client';

import React, { createContext, useState, ReactNode } from 'react';
import type { Voting, Contestant } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface VotingContextType {
  votings: Voting[];
  addVoting: (voting: Omit<Voting, 'id' | 'status' | 'contestants'> & { contestants: Omit<Contestant, 'id' | 'votes'>[] }) => void;
  castVote: (votingId: string, contestantId: string) => void;
  completeVoting: (votingId: string) => void;
  getVotingById: (votingId: string) => Voting | undefined;
}

export const VotingContext = createContext<VotingContextType>({
  votings: [],
  addVoting: () => {},
  castVote: () => {},
  completeVoting: () => {},
  getVotingById: () => undefined,
});

export const VotingProvider = ({ children }: { children: ReactNode }) => {
  const [votings, setVotings] = useState<Voting[]>([
    {
      id: 'initial-voting-1',
      title: 'Best Developer Framework',
      status: 'open',
      contestants: [
        { id: 'contestant-1', name: 'React', votes: 15, faceImage: PlaceHolderImages[0].imageUrl, teamLogo: PlaceHolderImages[8].imageUrl },
        { id: 'contestant-2', name: 'Vue', votes: 12, faceImage: PlaceHolderImages[2].imageUrl, teamLogo: PlaceHolderImages[9].imageUrl },
        { id: 'contestant-3', name: 'Angular', votes: 8, faceImage: PlaceHolderImages[4].imageUrl, teamLogo: PlaceHolderImages[10].imageUrl },
      ],
    },
    {
      id: 'initial-voting-2',
      title: 'Favorite Sci-Fi Movie',
      status: 'closed',
      contestants: [
        { id: 'contestant-4', name: 'Blade Runner 2049', votes: 25, faceImage: PlaceHolderImages[0].imageUrl, teamLogo: PlaceHolderImages[8].imageUrl },
        { id: 'contestant-5', name: 'Dune: Part Two', votes: 30, faceImage: PlaceHolderImages[2].imageUrl, teamLogo: PlaceHolderImages[9].imageUrl },
      ],
    }
  ]);

  const addVoting = (votingData: Omit<Voting, 'id' | 'status' | 'contestants'> & { contestants: Omit<Contestant, 'id' | 'votes'>[] }) => {
    const newVoting: Voting = {
      ...votingData,
      id: `voting-${new Date().getTime()}`,
      status: 'open',
      contestants: votingData.contestants.map((c, index) => ({
        ...c,
        id: `contestant-${new Date().getTime()}-${index}`,
        votes: 0,
      })),
    };
    setVotings(prev => [...prev, newVoting]);
  };

  const castVote = (votingId: string, contestantId: string) => {
    setVotings(prev => 
      prev.map(voting => {
        if (voting.id === votingId && voting.status === 'open') {
          return {
            ...voting,
            contestants: voting.contestants.map(c => 
              c.id === contestantId ? { ...c, votes: c.votes + 1 } : c
            )
          };
        }
        return voting;
      })
    );
  };

  const completeVoting = (votingId: string) => {
    setVotings(prev =>
      prev.map(voting =>
        voting.id === votingId ? { ...voting, status: 'closed' } : voting
      )
    );
  };

  const getVotingById = (votingId: string) => {
    return votings.find(v => v.id === votingId);
  };

  return (
    <VotingContext.Provider value={{ votings, addVoting, castVote, completeVoting, getVotingById }}>
      {children}
    </VotingContext.Provider>
  );
};
