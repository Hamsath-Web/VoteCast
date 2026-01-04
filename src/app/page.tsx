'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { Plus, Vote, BarChart3, CheckCircle, Hourglass, Edit, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VotingContext } from '@/context/VotingContext';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { votings, deleteVoting } = useContext(VotingContext);
  const { toast } = useToast();

  const handleDelete = (votingId: string, votingTitle: string) => {
    deleteVoting(votingId);
    toast({
      title: 'Voting Deleted',
      description: `The voting "${votingTitle}" has been removed.`,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Voting History</h1>
        <Button asChild>
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" /> New Voting
          </Link>
        </Button>
      </div>

      {votings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {votings.map((voting) => (
            <Card key={voting.id} className="flex flex-col justify-between transition-transform transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{voting.title}</CardTitle>
                  <Badge variant={voting.status === 'closed' ? 'secondary' : 'default'} className="whitespace-nowrap">
                    {voting.status === 'closed' ? <CheckCircle className="mr-2 h-4 w-4" /> : <Hourglass className="mr-2 h-4 w-4" />}
                    {voting.status.charAt(0).toUpperCase() + voting.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>
                  {voting.contestants.length} contestants
                </CardDescription>
              </CardHeader>
              <CardContent>
                
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the "{voting.title}" voting and all of its data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(voting.id, voting.title)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" asChild>
                  <Link href={`/edit/${voting.id}`}>
                    <Edit />
                  </Link>
                </Button>
                <Button variant="outline" asChild disabled={voting.status === 'closed'}>
                  <Link href={`/voting/${voting.id}`}>
                    <Vote className="mr-2 h-4 w-4" /> Vote
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/results/${voting.id}`}>
                    <BarChart3 className="mr-2 h-4 w-4" /> Results
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">No Votings Found</h2>
          <p className="text-muted-foreground mt-2">Get started by creating a new voting.</p>
          <Button asChild className="mt-6">
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" /> Create First Voting
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
