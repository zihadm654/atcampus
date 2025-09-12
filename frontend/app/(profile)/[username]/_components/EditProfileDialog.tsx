import { useEffect, useRef, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Resizer from 'react-image-file-resizer';

import { UserData } from '@/types/types';
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from '@/lib/validations/validation';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LoadingButton from '@/components/feed/LoadingButton';
import CropImageDialog from '@/components/shared/CropImageDialog';

import { useUpdateProfileMutation } from './mutations';

interface EditProfileDialogProps {
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name: user.name,
      bio: user.bio || '',
      currentSemester: user.currentSemester || 0,
    },
  });

  const mutation = useUpdateProfileMutation();

  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [croppedCover, setCroppedCover] = useState<Blob | null>(null);

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>(
    user.image || ''
  );
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>(
    user.coverImage || ''
  );

  useEffect(() => {
    if (croppedAvatar) {
      const url = URL.createObjectURL(croppedAvatar);
      setAvatarPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (user.image) {
      setAvatarPreviewUrl(user.image);
    }
  }, [croppedAvatar, user.image]);

  useEffect(() => {
    if (croppedCover) {
      const url = URL.createObjectURL(croppedCover);
      setCoverPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (user.coverImage) {
      setCoverPreviewUrl(user.coverImage);
    }
  }, [croppedCover, user.coverImage]);

  async function onSubmit(values: UpdateUserProfileValues) {
    const newAvatarFile = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.webp`, {
        type: 'image/webp',
      })
      : undefined;
    const newCoverFile = croppedCover
      ? new File([croppedCover], `cover_${user.id}.webp`, {
        type: 'image/webp',
      })
      : undefined;

    mutation.mutate(
      {
        values,
        avatar: newAvatarFile,
        coverImage: newCoverFile,
      },
      {
        onSuccess: () => {
          setCroppedAvatar(null);
          setCroppedCover(null);
          setAvatarPreviewUrl(user.image || '');
          setCoverPreviewUrl(user.coverImage || '');
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-full max-w-md overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div className='space-y-1.5'>
          <Label>Avatar</Label>
          <AvatarInput
            src={avatarPreviewUrl}
            onImageCropped={setCroppedAvatar}
          />
        </div>
        <div className='space-y-1.5'>
          <Label>Cover Image</Label>
          <CoverImageInput
            src={coverPreviewUrl}
            onImageCropped={setCroppedCover}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder='Your display name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='bio'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Tell us a little bit about yourself'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name='institution'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <FormControl>
                    <Input placeholder='institution name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='instituteId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institute Id</FormLabel>
                  <FormControl>
                    <Input placeholder='institution id' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name='currentSemester'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Seamester</FormLabel>
                  <FormControl>
                    <Input
                      min={0}
                      max={100}
                      type='number'
                      placeholder='current seamester'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton type='submit' loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface AvatarInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}

export function AvatarInput({ src, onImageCropped }: AvatarInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) return;

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      'WEBP',
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      'file'
    );
  }

  return (
    <>
      <input
        type='file'
        accept='image/*'
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className='sr-only hidden'
      />
      <button
        type='button'
        onClick={() => fileInputRef.current?.click()}
        className='group relative block'
        aria-label='Change avatar'
      >
        <Image
          src={src}
          alt='Avatar preview'
          width={150}
          height={150}
          className='size-20 flex-none rounded-full border-2 border-gray-200 object-cover shadow'
          key={typeof src === 'string' ? src : src.src} // Use string URL as key
        />
        <span className='bg-opacity-30 group-hover:bg-opacity-25 absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black text-white transition-colors duration-200'>
          <Camera size={24} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1}
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        />
      )}
    </>
  );
}

// CoverImageInput is similar to AvatarInput but with a 3:1 aspect ratio and larger preview
function CoverImageInput({
  src,
  onImageCropped,
}: {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}) {
  const [imageToCrop, setImageToCrop] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) return;
    Resizer.imageFileResizer(
      image,
      1800,
      600,
      'WEBP',
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      'file'
    );
  }

  return (
    <>
      <input
        type='file'
        accept='image/*'
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className='sr-only hidden'
      />
      <button
        type='button'
        onClick={() => fileInputRef.current?.click()}
        className='group relative block w-full'
        aria-label='Change cover image'
      >
        <Image
          src={src}
          alt='Cover preview'
          width={600}
          height={200}
          className='h-32 w-full rounded-lg border-2 border-gray-200 object-cover shadow'
          key={typeof src === 'string' ? src : src.src} // Use string URL as key
        />
        <span className='bg-opacity-30 group-hover:bg-opacity-25 absolute inset-0 m-auto flex items-center justify-center rounded-lg bg-black text-white transition-colors duration-200'>
          <Camera size={32} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={3}
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        />
      )}
    </>
  );
}
