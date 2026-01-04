import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Keeping the array for potential future use, but also creating a keyed object
export const placeholderImagesArray: ImagePlaceholder[] = data.placeholderImages;

type MappedPlaceholderImages = {
    [key: string]: ImagePlaceholder;
}

export const placeholderImages: MappedPlaceholderImages = data.placeholderImages.reduce((acc, current) => {
    acc[current.id] = current;
    return acc;
}, {} as MappedPlaceholderImages);
