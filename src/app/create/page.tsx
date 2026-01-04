'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useVoting } from '@/context/VotingContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash } from 'lucide-react';
import Link from 'next/link';

const contestantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  contestants: z.array(contestantSchema).min(2),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateVotingPage() {
  const router = useRouter();
  const { addVoting } = useVoting();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      contestants: [
        { name: '' },
        { name: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contestants',
  });
  
  const addContestant = () => {
    append({ name: '' });
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
        const contestantsWithOptionalImages = data.contestants.map((c) => {
            return {
                ...c,
                faceImage: '',
                teamLogo: '',
            }
        });

        await addVoting({ title: data.title, contestants: contestantsWithOptionalImages });
        toast({
        title: 'Success!',
        description: `Voting "${data.title}" has been created.`,
        });
        router.push('/');
    } catch (error) {
        console.error("Failed to create voting", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create voting. Please try again."
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to History</Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Create a New Voting</CardTitle>
            <CardDescription>Fill out the details below to set up your new voting poll. Images for contestants are optional.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voting Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Team MVP for Q3" {...field} disabled={isSubmitting}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Contestants</h3>
                    <Button type="button" onClick={addContestant} disabled={isSubmitting}>Add Contestant</Button>
                </div>
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Contestant {index + 1}</h4>
                        {fields.length > 2 && (
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={isSubmitting}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                       <FormField
                          control={form.control}
                          name={`contestants.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl><Input placeholder={`Contestant ${index + 1} Name`} {...field} disabled={isSubmitting} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                  ))}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Voting'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
