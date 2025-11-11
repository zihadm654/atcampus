"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import { toast } from "sonner";
import { z } from "zod";
import { useUpdateFacultyMutation } from "@/app/(profile)/[username]/_components/schoolMutations";
import CropImageDialog from "@/components/shared/CropImageDialog";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Faculty } from "./tabs/SchoolsTab";

const formSchema = z.object({
  name: z.string().min(3, "Faculty name must be at least 3 characters long"),
  description: z.string().optional(),
  logo: z.string().optional(),
  coverPhoto: z.string().optional(),
});

interface AvatarInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}

function AvatarInput({ src, onImageCropped }: AvatarInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) return;

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "WEBP",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file"
    );
  }

  return (
    <>
      <input
        accept="image/*"
        className="sr-only hidden"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        type="file"
      />
      <button
        aria-label="Change avatar"
        className="group relative block"
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        <Image
          alt="Avatar preview"
          className="size-20 flex-none rounded-full border-2 border-gray-200 object-cover shadow"
          height={150}
          key={typeof src === "string" ? src : src.src}
          src={src}
          width={150}
        />
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-30 text-white transition-colors duration-200 group-hover:bg-opacity-25">
          <Camera size={24} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          cropAspectRatio={1}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          onCropped={onImageCropped}
          src={URL.createObjectURL(imageToCrop)}
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
      "WEBP",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file"
    );
  }

  return (
    <>
      <input
        accept="image/*"
        className="sr-only hidden"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        type="file"
      />
      <button
        aria-label="Change cover image"
        className="group relative block w-full"
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        <Image
          alt="Cover preview"
          className="h-32 w-full rounded-lg border-2 border-gray-200 object-cover shadow"
          height={200}
          key={typeof src === "string" ? src : src.src}
          src={src}
          width={600}
        />
        <span className="absolute inset-0 m-auto flex items-center justify-center rounded-lg bg-black bg-opacity-30 text-white transition-colors duration-200 group-hover:bg-opacity-25">
          <Camera size={32} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          cropAspectRatio={3}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          onCropped={onImageCropped}
          src={URL.createObjectURL(imageToCrop)}
        />
      )}
    </>
  );
}

interface EditFacultyDialogProps {
  faculty: Faculty & {
    schoolId: string;
    description?: string;
    logo?: string;
    coverPhoto?: string;
  }; // Include schoolId in the faculty type
  onUpdated?: () => void;
  setOpen: (open: boolean) => void;
}

export default function EditFacultyDialog({
  faculty,
  onUpdated,
  setOpen,
}: EditFacultyDialogProps) {
  const updateFacultyMutation = useUpdateFacultyMutation();

  // State for image handling
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [croppedCover, setCroppedCover] = useState<Blob | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>(
    faculty.logo || ""
  );
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>(
    faculty.coverPhoto || ""
  );

  useEffect(() => {
    if (croppedAvatar) {
      const url = URL.createObjectURL(croppedAvatar);
      setAvatarPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (faculty.logo) {
      setAvatarPreviewUrl(faculty.logo);
    }
  }, [croppedAvatar, faculty.logo]);

  useEffect(() => {
    if (croppedCover) {
      const url = URL.createObjectURL(croppedCover);
      setCoverPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (faculty.coverPhoto) {
      setCoverPreviewUrl(faculty.coverPhoto);
    }
  }, [croppedCover, faculty.coverPhoto]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: faculty.name,
      description: faculty.description || "",
      logo: faculty.logo || "",
      coverPhoto: faculty.coverPhoto || "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert blobs to files if they exist
    const logoFile = croppedAvatar
      ? new File([croppedAvatar], "faculty-logo.webp", { type: "image/webp" })
      : values.logo;
    const coverFile = croppedCover
      ? new File([croppedCover], "faculty-cover.webp", { type: "image/webp" })
      : values.coverPhoto;

    updateFacultyMutation.mutate(
      {
        id: faculty.id,
        ...values,
        schoolId: faculty.schoolId, // Include schoolId in the mutation
        logo: logoFile,
        coverPhoto: coverFile,
      },
      {
        onSuccess: () => {
          toast.success("Faculty updated successfully");
          // Reset image states after successful update
          setCroppedAvatar(null);
          setCroppedCover(null);
          setOpen(false);
          // Call the onUpdated callback if provided
          if (onUpdated) {
            onUpdated();
          }
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update faculty");
        },
      }
    );
  };

  return (
    <Form {...form}>
      <div className="space-y-1.5">
        <Label>Logo</Label>
        <AvatarInput
          onImageCropped={setCroppedAvatar}
          src={avatarPreviewUrl || "/placeholder-avatar.png"}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Cover Photo</Label>
        <CoverImageInput
          onImageCropped={setCroppedCover}
          src={coverPreviewUrl || "/placeholder-cover.jpg"}
        />
      </div>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Computer Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Faculty description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={updateFacultyMutation.isPending} type="submit">
            {updateFacultyMutation.isPending ? "Updating..." : "Update Faculty"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
