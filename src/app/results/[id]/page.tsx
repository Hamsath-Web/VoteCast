
'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, ArrowLeft, Trophy } from 'lucide-react';
import { useVoting } from '@/context/VotingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultsChart } from '@/components/ResultsChart';
import { Contestant } from '@/lib/types';

export default function ResultsPage() {
  const params = useParams();
  const { getVotingById, getContestants } = useVoting();
  const votingId = params.id as string;
  const voting = getVotingById(votingId);
  const { data: contestants, isLoading: contestantsLoading } = getContestants(votingId);

  const sortedContestants = useMemo(() => {
    if (!contestants) return [];
    return [...contestants].sort((a, b) => b.votes - a.votes);
  }, [contestants]);

  if (contestantsLoading || !voting) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">Loading results...</h1>
      </div>
    );
  }
  
  if (!contestants) {
     return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">Voting Not Found</h1>
        <p className="text-muted-foreground">The voting you are looking for does not exist.</p>
        <Button asChild className="mt-4"><Link href="/">Go Home</Link></Button>
      </div>
    );
  }

  const winner = sortedContestants[0];
  const totalVotes = sortedContestants.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="container mx-auto p-4 md:p-8">
       <Button variant="ghost" asChild className="mb-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to History</Link>
        </Button>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          {voting.status === 'closed' ? 'Final Results' : 'Live Results'}
        </h1>
        <p className="text-muted-foreground mt-2">Results for "{voting.title}"</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {winner && totalVotes > 0 ? (
            <Card className="bg-gradient-to-br from-accent/20 to-transparent border-accent shadow-lg">
              <CardHeader className="text-center">
                <Crown className="mx-auto h-12 w-12 text-accent" />
                <CardTitle className="text-3xl font-bold mt-2">WINNER</CardTitle>
                <CardDescription>With {winner.votes} out of {totalVotes} votes</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="relative h-36 w-36">
                  <Image
                    src={winner.faceImage}
                    alt={winner.name}
                    fill
                    className="rounded-full border-4 border-accent object-cover"
                  />
                </div>
                <h3 className="text-4xl font-bold text-accent-foreground">{winner.name}</h3>
              </CardContent>
            </Card>
          ) : (
            <Card>
                <CardHeader>
                    <CardTitle>No Votes Yet</CardTitle>
                    <CardDescription>Cast the first vote to see the results update.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">The winner will be displayed here once votes are cast.</p>
                </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vote Distribution</CardTitle>
              <CardDescription>Total votes cast: {totalVotes}</CardDescription>
            </CardHeader>
            <CardContent>
              {totalVotes > 0 ? (
                <ResultsChart contestants={sortedContestants as Contestant[]} />
              ) : (
                <div className="h-[350px] flex items-center justify-center">
                  <p className="text-muted-foreground">Chart will be displayed here once votes are recorded.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

       <div className="mt-8">
         <Card>
            <CardHeader>
              <CardTitle>Full Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                  {sortedContestants.map((c, index) => (
                    <li key={c.id} className="flex items-center justify-between p-4 rounded-md bg-secondary/50">
                        <div className="flex items-center gap-4">
                          <span className={`text-2xl font-bold w-8 text-center ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                              {index === 0 && <Trophy className="h-6 w-6 text-accent"/>}
                              {index === 1 && <Trophy className="h-6 w-6 text-slate-400"/>}
                              {index === 2 && <Trophy className="h-6 w-6 text-yellow-800"/>}
                              {index > 2 && (index + 1)}
                          </span>
                          <div className="relative h-12 w-12">
                            <Image src={c.faceImage} alt={c.name} fill className="rounded-full object-cover" />
                          </div>
                          <span className="font-semibold text-lg">{c.name}</span>
                        </div>
                        <span className="font-bold text-xl">{c.votes.toLocaleString()} votes</span>
                    </li>
                  ))}
                </ul>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
