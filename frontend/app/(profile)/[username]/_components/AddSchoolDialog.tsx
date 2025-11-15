"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import { toast } from "sonner";
import * as z from "zod";
import { useCreateSchoolMutation } from "@/app/(profile)/[username]/_components/schoolMutations";
import CropImageDialog from "@/components/shared/CropImageDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coursesData } from "@/config/course";

export const addSchoolSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters long"),
  slug: z.string().min(3, "School slug must be at least 3 characters long"),
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

interface AddSchoolDialogProps {
  onAdded?: () => void;
}

export default function AddSchoolDialog({ onAdded }: AddSchoolDialogProps) {
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [open, setOpen] = useState(false);
  const createSchoolMutation = useCreateSchoolMutation();

  // State for image handling
  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [croppedCover, setCroppedCover] = useState<Blob | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (croppedAvatar) {
      const url = URL.createObjectURL(croppedAvatar);
      setAvatarPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [croppedAvatar]);

  useEffect(() => {
    if (croppedCover) {
      const url = URL.createObjectURL(croppedCover);
      setCoverPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [croppedCover]);

  const form = useForm<z.infer<typeof addSchoolSchema>>({
    resolver: zodResolver(addSchoolSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      website: "",
      logo: "",
      coverPhoto: "",
    },
  });

  const name = form.watch("name");

  useEffect(() => {
    if (!isSlugEdited && name) {
      const generatedSlug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", generatedSlug);
    } else if (!name) {
      form.setValue("slug", "");
    }
  }, [name, isSlugEdited, form]);

  async function onSubmit(values: z.infer<typeof addSchoolSchema>) {
    // Convert blobs to files if they exist
    const logoFile = croppedAvatar
      ? new File([croppedAvatar], "school-logo.webp", { type: "image/webp" })
      : values.logo;
    const coverFile = croppedCover
      ? new File([croppedCover], "school-cover.webp", { type: "image/webp" })
      : values.coverPhoto;

    createSchoolMutation.mutate(
      {
        ...values,
        logo: logoFile,
        coverPhoto: coverFile,
      },
      {
        onSuccess: () => {
          toast.success("School created successfully");
          form.reset();
          setIsSlugEdited(false);
          setOpen(false);
          // Reset image states
          setCroppedAvatar(null);
          setCroppedCover(null);
          setAvatarPreviewUrl("");
          setCoverPreviewUrl("");
          // Call the onAdded callback if provided
          if (onAdded) {
            onAdded();
          }
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create school");
        },
      }
    );
  }

  useEffect(() => {
    if (open) {
      form.reset();
      setIsSlugEdited(false);
      // Reset image states when dialog opens
      setCroppedAvatar(null);
      setCroppedCover(null);
      setAvatarPreviewUrl("");
      setCoverPreviewUrl("");
    }
  }, [open, form]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="default">Add School</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add School</DialogTitle>
          <DialogDescription>
            Add a new school to your institution. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
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
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a school" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {coursesData.schools.map((school) => (
                            <SelectItem key={school.name} value={school.name}>
                              {school.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setIsSlugEdited(true);
                      }}
                      placeholder="e.g. school-of-engineering"
                    />
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
                  <FormLabel>School Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. School description" {...field} />
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
            <DialogFooter>
              <Button
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={createSchoolMutation.isPending} type="submit">
                {createSchoolMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
