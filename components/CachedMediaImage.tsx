import { Image, type ImageProps } from 'expo-image';

type Props = ImageProps & {
  recyclingKey?: string;
};

/**
 * Remote and local images with disk + memory caching to avoid repeated Supabase downloads.
 */
export function CachedMediaImage({ cachePolicy = 'memory-disk', transition = 0, ...props }: Props) {
  return <Image cachePolicy={cachePolicy} transition={transition} {...props} />;
}
