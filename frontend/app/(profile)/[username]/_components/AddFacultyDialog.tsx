"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import { toast } from "sonner";
import * as z from "zod";
import { useCreateFacultyMutation } from "@/app/(profile)/[username]/_components/schoolMutations";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coursesData } from "@/config/course";

const addFacultySchema = z.object({
  name: z.string().min(1, "Faculty name is required"),
  slug: z.string().min(1, "Faculty slug is required"),
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

interface AddFacultyDialogProps {
  schoolId: string;
  schoolName: string;
  onAdded?: () => void;
  setOpen: (open: boolean) => void;
}

export default function AddFacultyDialog({
  schoolId,
  schoolName,
  onAdded,
  setOpen,
}: AddFacultyDialogProps) {
  const createFacultyMutation = useCreateFacultyMutation();
  const [isSlugEdited, setIsSlugEdited] = useState(false);

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

  // Since we're working with static data and schoolId is a database ID,
  // we'll try to find a matching school by checking if any school name contains the schoolId
  // This is a workaround for the static data implementation
  const selectedSchool =
    coursesData.schools.find((school) => school.name.includes(schoolName)) ||
    coursesData.schools.find((school) => schoolName.includes(school.name)) ||
    coursesData.schools[0];

  const form = useForm<z.infer<typeof addFacultySchema>>({
    resolver: zodResolver(addFacultySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logo: "",
      coverPhoto: "",
    },
  });
  const name = form.watch("name");

  useEffect(() => {
    if (!isSlugEdited && name) {
      const baseSlug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", baseSlug);
    } else if (!name) {
      form.setValue("slug", "");
    }
  }, [name, isSlugEdited, form]);

  function onSubmit(values: z.infer<typeof addFacultySchema>) {
    // Convert blobs to files if they exist
    const logoFile = croppedAvatar
      ? new File([croppedAvatar], "faculty-logo.webp", { type: "image/webp" })
      : values.logo;
    const coverFile = croppedCover
      ? new File([croppedCover], "faculty-cover.webp", { type: "image/webp" })
      : values.coverPhoto;

    createFacultyMutation.mutate(
      {
        ...values,
        schoolId,
        logo: logoFile,
        coverPhoto: coverFile,
      },
      {
        onSuccess: () => {
          toast.success("Faculty created successfully");
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
          toast.error(error.message || "Failed to create faculty");
        },
      }
    );
  }

  // Reset form and state when dialog opens
  useEffect(() => {
    form.reset({
      name: "",
      slug: "",
      description: "",
      logo: "",
      coverPhoto: "",
    });
    setIsSlugEdited(false);
    // Reset image states when dialog opens
    setCroppedAvatar(null);
    setCroppedCover(null);
    setAvatarPreviewUrl("");
    setCoverPreviewUrl("");
  }, []);

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
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/* Show faculties from the selected school */}
                      {selectedSchool.faculties.map((faculty) => (
                        <SelectItem key={faculty.name} value={faculty.name}>
                          {faculty.name}
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
              <FormLabel>Faculty Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setIsSlugEdited(true);
                  }}
                  placeholder="e.g. department-of-computer-science"
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
          <Button disabled={createFacultyMutation.isPending} type="submit">
            {createFacultyMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
