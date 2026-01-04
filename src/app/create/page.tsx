'use client';

import { useContext } from 'react';
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
import { VotingContext } from '@/context/VotingContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash, Upload } from 'lucide-react';
import Link from 'next/link';

const contestantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  faceImage: z.string().min(1, 'Image is required'),
});

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  numberOfContestants: z.coerce.number().min(2, 'Must have at least 2 contestants'),
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
        { name: '', faceImage: '' },
        { name: '', faceImage: '' },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'contestants',
  });

  const handleContestantCountChange = (count: number) => {
    if (count < 2) count = 2;
    form.setValue('numberOfContestants', count);
    const currentCount = fields.length;
    if (count > currentCount) {
      for (let i = currentCount; i < count; i++) {
        append({ name: '', faceImage: '' });
      }
    } else if (count < currentCount) {
      const newFields = fields.slice(0, count);
      replace(newFields);
    }
  };

  const onSubmit = (data: FormData) => {
    addVoting({ title: data.title, contestants: data.contestants });
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
                    <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Contestant {index + 1}</h4>
                        {fields.length > 2 && (
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
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
                              <FormControl><Input placeholder={`Contestant ${index + 1} Name`} {...field} /></FormControl>
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
                                            />
                                            <label htmlFor={`faceImage-${index}`} className="flex-1">
                                                <Button type="button" asChild>
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
                <Button type="submit">Create Voting</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
