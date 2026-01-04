
'use client';

import { useState, useContext, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { VotingContext } from '@/context/VotingContext';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Lock, BarChart3 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const { getVotingById, castVote, completeVoting } = useContext(VotingContext);
  const { toast } = useToast();

  const [selectedContestantId, setSelectedContestantId] = useState<string | null>(null);
  const [voting, setVoting] = useState(getVotingById(params.id as string));

  useEffect(() => {
    setVoting(getVotingById(params.id as string));
  }, [getVotingById, params.id]);


  if (!voting) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">Voting Not Found</h1>
        <p className="text-muted-foreground">The voting you are looking for does not exist.</p>
        <Button asChild className="mt-4"><Link href="/">Go Home</Link></Button>
      </div>
    );
  }

  const handleVote = () => {
    if (!selectedContestantId) {
      toast({
        variant: 'destructive',
        title: 'No contestant selected',
        description: 'Please select a contestant to vote for.',
      });
      return;
    }
    castVote(voting.id, selectedContestantId);
    toast({
      title: 'Vote Cast!',
      description: 'Your vote has been successfully recorded.',
    });
    setSelectedContestantId(null);
  };

  const handleCompleteVoting = () => {
    completeVoting(voting.id);
    toast({
      title: 'Voting Closed',
      description: `The voting "${voting.title}" is now final.`,
    });
    router.push(`/results/${voting.id}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to History</Link>
        </Button>
        <Button asChild>
          <Link href={`/results/${voting.id}`}>
            <BarChart3 className="mr-2 h-4 w-4" /> View Results
          </Link>
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">{voting.title}</h1>
        <p className="text-muted-foreground mt-2">Select your choice and cast your vote.</p>
      </div>
      
      {voting.status === 'closed' ? (
        <Card className="text-center p-8">
            <Lock className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-2xl font-bold">Voting Closed</h2>
            <p className="mt-2 text-muted-foreground">This poll has ended. No more votes can be cast.</p>
            <Button asChild className="mt-6">
                <Link href={`/results/${voting.id}`}>View Final Results</Link>
            </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voting.contestants.map((contestant) => (
              <Card
                key={contestant.id}
                onClick={() => setSelectedContestantId(contestant.id)}
                className={`cursor-pointer transition-all ${
                  selectedContestantId === contestant.id
                    ? 'ring-4 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:shadow-lg'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-center text-2xl">{contestant.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24">
                      <Image
                        src={contestant.faceImage}
                        alt={`${contestant.name} face`}
                        fill
                        className="rounded-full border-4 border-card object-cover"
                      />
                    </div>
                  </div>
                  <div className="relative h-20 w-20">
                    <Image
                      src={contestant.teamLogo}
                      alt={`${contestant.name} team logo`}
                      fill
                      className="rounded-md object-contain"
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                    <Button 
                        variant={selectedContestantId === contestant.id ? 'default' : 'outline'} 
                        className="w-full"
                    >
                        {selectedContestantId === contestant.id && <Check className="mr-2 h-4 w-4" />}
                        {selectedContestantId === contestant.id ? 'Selected' : 'Select'}
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" onClick={handleVote} disabled={!selectedContestantId}>
              Cast Your Vote
            </Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" variant="destructive">
                  <Lock className="mr-2 h-4 w-4" /> Finalize & Close Voting
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to close this voting?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Once closed, no more votes can be cast and the results will be final.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCompleteVoting}>Confirm & Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
