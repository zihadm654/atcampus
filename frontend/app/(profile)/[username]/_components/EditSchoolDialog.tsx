"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import { toast } from "sonner";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSchoolMutation } from "./schoolMutations";
import type { School } from "./tabs/SchoolsTab";

const editSchoolSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters long"),
  description: z.string().optional(),
  website: z.string().optional(),
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

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
    ];
    if (!allowedTypes.includes(image.type)) {
      toast.error(
        "Invalid file type. Please select a valid image file (JPEG, PNG, GIF, WebP, HEIC)."
      );
      return;
    }

    // Validate file size (4MB limit)
    if (image.size > 4 * 1024 * 1024) {
      toast.error("File too large. Please select an image smaller than 4MB.");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Error processing avatar:", error);
      toast.error("Failed to process the selected image. Please try again.");
    }
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

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
    ];
    if (!allowedTypes.includes(image.type)) {
      toast.error(
        "Invalid file type. Please select a valid image file (JPEG, PNG, GIF, WebP, HEIC)."
      );
      return;
    }

    // Validate file size (4MB limit)
    if (image.size > 4 * 1024 * 1024) {
      toast.error("File too large. Please select an image smaller than 4MB.");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Error processing cover image:", error);
      toast.error("Failed to process the selected image. Please try again.");
    }
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

interface EditSchoolDialogProps {
  school: School;
}

export default function EditSchoolDialog({ school }: EditSchoolDialogProps) {
  const updateSchoolMutation = useUpdateSchoolMutation();
  const isPending = updateSchoolMutation.isPending;

  // State for image handling
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [croppedCover, setCroppedCover] = useState<Blob | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>(
    school.logo || ""
  );
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>(
    school.coverPhoto || ""
  );

  useEffect(() => {
    if (croppedAvatar) {
      const url = URL.createObjectURL(croppedAvatar);
      setAvatarPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (school.logo) {
      setAvatarPreviewUrl(school.logo);
    }
  }, [croppedAvatar, school.logo]);

  useEffect(() => {
    if (croppedCover) {
      const url = URL.createObjectURL(croppedCover);
      setCoverPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (school.coverPhoto) {
      setCoverPreviewUrl(school.coverPhoto);
    }
  }, [croppedCover, school.coverPhoto]);

  const form = useForm<z.infer<typeof editSchoolSchema>>({
    resolver: zodResolver(editSchoolSchema),
    defaultValues: {
      name: school.name,
      description: school.description || "",
      website: school.website || "",
      logo: school.logo || "",
      coverPhoto: school.coverPhoto || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof editSchoolSchema>) => {
    try {
      // Convert blobs to files if they exist
      const logoFile = croppedAvatar
        ? new File([croppedAvatar], "school-logo.webp", { type: "image/webp" })
        : values.logo;
      const coverFile = croppedCover
        ? new File([croppedCover], "school-cover.webp", { type: "image/webp" })
        : values.coverPhoto;

      await updateSchoolMutation.mutateAsync({
        id: school.id,
        ...values,
        logo: logoFile,
        coverPhoto: coverFile,
      });
      toast.success("School updated successfully");
      // Reset image states after successful update
      setCroppedAvatar(null);
      setCroppedCover(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update school";
      toast.error(errorMessage);
    }
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. School of Engineering" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. https://school.example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a brief description of the school"
                  {...field}
                  className="resize-none"
                  rows={4}
                />
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
          <Button disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
