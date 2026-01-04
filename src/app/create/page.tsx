'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { VotingContext } from '@/context/VotingContext';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash } from 'lucide-react';
import Link from 'next/link';

const contestantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  faceImage1Id: z.string().min(1, 'Image is required'),
  faceImage2Id: z.string().min(1, 'Image is required'),
  teamLogoId: z.string().min(1, 'Logo is required'),
});

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  numberOfContestants: z.coerce.number().min(2, 'Must have at least 2 contestants'),
  contestants: z.array(contestantSchema).min(2),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateVotingPage() {
  const router = useRouter();
  const { addVoting } = useContext(VotingContext);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      numberOfContestants: 2,
      contestants: [
        { name: '', faceImage1Id: '', faceImage2Id: '', teamLogoId: '' },
        { name: '', faceImage1Id: '', faceImage2Id: '', teamLogoId: '' },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'contestants',
  });

  const faceImages = PlaceHolderImages.filter(img => img.imageHint.includes('face'));
  const teamLogos = PlaceHolderImages.filter(img => img.imageHint.includes('logo'));

  const numberOfContestants = form.watch('numberOfContestants');

  const handleContestantCountChange = (count: number) => {
    if (count < 2) count = 2;
    form.setValue('numberOfContestants', count);
    const currentCount = fields.length;
    if (count > currentCount) {
      for (let i = currentCount; i < count; i++) {
        append({ name: '', faceImage1Id: '', faceImage2Id: '', teamLogoId: '' });
      }
    } else if (count < currentCount) {
      const newFields = fields.slice(0, count);
      replace(newFields);
    }
  };

  const onSubmit = (data: FormData) => {
    const contestants = data.contestants.map(c => {
      const faceImage1 = PlaceHolderImages.find(img => img.id === c.faceImage1Id);
      const faceImage2 = PlaceHolderImages.find(img => img.id === c.faceImage2Id);
      const teamLogo = PlaceHolderImages.find(img => img.id === c.teamLogoId);
      if (!faceImage1 || !faceImage2 || !teamLogo) {
        throw new Error('Image not found');
      }
      return { name: c.name, faceImage1, faceImage2, teamLogo };
    });

    addVoting({ title: data.title, contestants });
    toast({
      title: 'Success!',
      description: `Voting "${data.title}" has been created.`,
    });
    router.push('/');
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
            <CardDescription>Fill out the details below to set up your new voting poll.</CardDescription>
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
                        <Input placeholder="e.g., Team MVP for Q3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfContestants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Contestants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2"
                          {...field}
                          onChange={(e) => handleContestantCountChange(parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <h3 className="text-lg font-medium">Contestant Details</h3>
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg relative">
                      <h4 className="font-semibold mb-4">Contestant {index + 1}</h4>
                       <FormField
                          control={form.control}
                          name={`contestants.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl><Input placeholder={`Contestant ${index + 1} Name`} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <Controller
                          control={form.control}
                          name={`contestants.${index}.faceImage1Id`}
                          render={({ field }) => (
                             <FormItem>
                              <FormLabel>Face Image 1</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select an image" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="null" disabled>Select an image</SelectItem>{faceImages.map(img => <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`contestants.${index}.faceImage2Id`}
                           render={({ field }) => (
                             <FormItem>
                              <FormLabel>Face Image 2</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select an image" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="null" disabled>Select an image</SelectItem>{faceImages.map(img => <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <Controller
                          control={form.control}
                          name={`contestants.${index}.teamLogoId`}
                           render={({ field }) => (
                             <FormItem>
                              <FormLabel>Team Logo</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a logo" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="null" disabled>Select a logo</SelectItem>{teamLogos.map(img => <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>)}</SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {fields.length > 2 && (
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="submit">Create Voting</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
