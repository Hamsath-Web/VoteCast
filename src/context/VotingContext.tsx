'use client';

import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  useUser,
  initiateAnonymousSignIn,
  useAuth,
} from '@/firebase';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import type { Voting, Contestant } from '@/lib/types';

interface VotingContextType {
  votings: Voting[];
  loading: boolean;
  addVoting: (votingData: {
    title: string;
    contestants: { name: string; faceImage: string, teamLogo: string }[];
  }) => Promise<void>;
  getContestants: (
    votingId: string
  ) => { data: Contestant[] | null; isLoading: boolean };
  castVote: (votingId: string, contestant: Contestant) => void;
  completeVoting: (votingId: string) => void;
  getVotingById: (votingId: string) => Voting | undefined;
  deleteVoting: (votingId: string) => Promise<void>;
  updateVoting: (
    votingId: string,
    updatedData: {
      title: string;
      contestants: (Partial<Contestant> & { name: string; faceImage: string, teamLogo: string })[];
    }
  ) => Promise<void>;
}

export const VotingContext = createContext<VotingContextType | undefined>(
  undefined
);

export const VotingProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const votingsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'votings') : null),
    [firestore]
  );
  const { data: votingsData, isLoading: votingsLoading } =
    useCollection<Voting>(votingsQuery);

  const getContestants = (votingId: string) => {
    const contestantsQuery = useMemoFirebase(
      () =>
        firestore
          ? collection(firestore, 'votings', votingId, 'contestants')
          : null,
      [firestore, votingId]
    );
    const { data, isLoading } = useCollection<Contestant>(contestantsQuery);
    return { data, isLoading };
  };

  const addVoting = async (votingData: {
    title: string;
    contestants: { name: string; faceImage: string, teamLogo: string }[];
  }) => {
    if (!user || !firestore)
      throw new Error('User must be authenticated to create a voting.');

    const newVotingRef = doc(collection(firestore, 'votings'));

    const votingPayload = {
        id: newVotingRef.id,
        title: votingData.title,
        status: 'open',
        ownerId: user.uid,
        createdAt: serverTimestamp(),
    }

    addDocumentNonBlocking(collection(firestore, 'votings'), votingPayload);


    const batch = writeBatch(firestore);
    votingData.contestants.forEach((contestant) => {
      const contestantRef = doc(
        collection(firestore, 'votings', newVotingRef.id, 'contestants')
      );
      batch.set(contestantRef, { ...contestant, votes: 0 });
    });

    await batch.commit();
  };

  const castVote = (votingId: string, contestant: Contestant) => {
     if (!user || !firestore) return;
    
    const voteRef = doc(collection(firestore, 'votings', votingId, 'votes'));
    addDocumentNonBlocking(voteRef.parent, {
        contestantId: contestant.id,
        voterId: user.uid,
        votingId: votingId,
        voteDateTime: serverTimestamp(),
    });

    const contestantRef = doc(
      firestore,
      'votings',
      votingId,
      'contestants',
      contestant.id
    );
    updateDocumentNonBlocking(contestantRef, { votes: increment(1) });
  };

  const completeVoting = (votingId: string) => {
    if(!firestore) return;
    const votingRef = doc(firestore, 'votings', votingId);
    updateDocumentNonBlocking(votingRef, { status: 'closed' });
  };

  const getVotingById = (votingId: string) => {
    return votingsData?.find((v) => v.id === votingId);
  };

  const deleteVoting = async (votingId: string) => {
    if(!firestore) return;
    // Note: This doesn't delete subcollections. For a production app,
    // a Cloud Function would be needed to recursively delete contestants and votes.
    const votingRef = doc(firestore, 'votings', votingId);
    await deleteDoc(votingRef);
  };

  const updateVoting = async (
    votingId: string,
    updatedData: {
      title: string;
      contestants: (Partial<Contestant> & { name: string; faceImage: string, teamLogo: string })[];
    }
  ) => {
    if(!firestore) return;
    const votingRef = doc(firestore, 'votings', votingId);
    await updateDoc(votingRef, { title: updatedData.title });

    const batch = writeBatch(firestore);
    const contestantsColRef = collection(
      firestore,
      'votings',
      votingId,
      'contestants'
    );

    updatedData.contestants.forEach((c) => {
      if (c.id) {
        // Existing contestant
        const contestantRef = doc(contestantsColRef, c.id);
        batch.update(contestantRef, { name: c.name, faceImage: c.faceImage, teamLogo: c.teamLogo });
      } else {
        // New contestant
        const newContestantRef = doc(contestantsColRef);
        batch.set(newContestantRef, {
          name: c.name,
          faceImage: c.faceImage,
          teamLogo: c.teamLogo,
          votes: 0,
        });
      }
    });

    // This doesn't handle deleted contestants from the UI.
    // A more robust solution would involve comparing arrays.
    await batch.commit();
  };

  const contextValue = {
    votings: votingsData || [],
    loading: votingsLoading || isUserLoading,
    addVoting,
    getContestants,
    castVote,
    completeVoting,
    getVotingById,
    deleteVoting,
    updateVoting,
  };

  return (
    <VotingContext.Provider value={contextValue}>
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};
