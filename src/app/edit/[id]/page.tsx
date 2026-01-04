'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { ArrowLeft, Trash, Upload } from 'lucide-react';
import Link from 'next/link';

const contestantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  faceImage: z.string().min(1, 'Image is required'),
  votes: z.number().optional(),
});

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  contestants: z.array(contestantSchema).min(2),
});

type FormData = z.infer<typeof formSchema>;

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function EditVotingPage() {
  const router = useRouter();
  const params = useParams();
  const votingId = params.id as string;
  const { getVotingById, updateVoting, getContestants } = useVoting();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const voting = getVotingById(votingId);
  const { data: contestants, isLoading: contestantsLoading } = getContestants(votingId);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      contestants: [],
    },
  });

  useEffect(() => {
    if (voting) {
      form.setValue('title', voting.title);
    }
    if (contestants) {
      form.setValue('contestants', contestants);
    }
  }, [voting, contestants, form]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contestants',
  });

  const addContestant = () => {
    append({ name: '', faceImage: '', votes: 0 });
  };
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await updateVoting(votingId, data);
      toast({
        title: 'Success!',
        description: `Voting "${data.title}" has been updated.`,
      });
      router.push('/');
    } catch (error) {
      console.error("Failed to update voting", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update voting. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
    if (!voting || contestantsLoading) {
        return <div className="container mx-auto p-4 md:p-8 text-center">Loading...</div>;
    }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to History</Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Edit Voting</CardTitle>
            <CardDescription>Update the details of your voting poll.</CardDescription>
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
                    <h3 className="text-lg font-medium">Contestant Details</h3>
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
                        <FormField
                            control={form.control}
                            name={`contestants.${index}.faceImage`}
                            render={({ field: { onChange, value, ...rest } }) => (
                                <FormItem>
                                    <FormLabel>Face Image</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-4">
                                            {value && <img src={value} alt={`Contestant ${index+1}`} className="h-20 w-20 rounded-md object-cover" />}
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id={`faceImage-${index}`}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const dataUrl = await fileToDataUrl(file);
                                                        onChange(dataUrl);
                                                    }
                                                }}
                                                {...rest}
                                                disabled={isSubmitting}
                                            />
                                            <label htmlFor={`faceImage-${index}`} className="flex-1">
                                                <Button type="button" asChild disabled={isSubmitting}>
                                                    <span className="cursor-pointer w-full">
                                                        <Upload className="mr-2 h-4 w-4"/>
                                                        {value ? 'Change Image' : 'Upload Image'}
                                                    </span>
                                                </Button>
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                  ))}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Voting'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
