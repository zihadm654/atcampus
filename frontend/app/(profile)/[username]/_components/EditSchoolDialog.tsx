"use client";

import { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";

import { UserData } from "@/types/types";
import { schoolSchema, TSchool } from "@/lib/validations/validation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import LoadingButton from "@/components/feed/LoadingButton";
import CropImageDialog from "@/components/shared/CropImageDialog";
import { Icons } from "@/components/shared/icons";

import { createFaculty, deleteFaculty, updateFaculty } from "./schoolActions"; // Import faculty actions
import {
  useCreateFacultyMutation,
  useCreateSchoolMutation,
  useDeleteFacultyMutation,
  useUpdateFacultyMutation,
  useUpdateSchoolMutation,
} from "./schoolMutations";

interface EditProfileDialogProps {
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
      "WEBP",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file",
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
        aria-label="Change avatar"
      >
        <Image
          src={src}
          alt="Avatar preview"
          width={150}
          height={150}
          className="size-20 flex-none rounded-full border-2 border-gray-200 object-cover shadow"
          key={typeof src === "string" ? src : src.src} // Use string URL as key
        />
        <span className="bg-opacity-30 group-hover:bg-opacity-25 absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black text-white transition-colors duration-200">
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
              fileInputRef.current.value = "";
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
      "WEBP",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file",
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block w-full"
        aria-label="Change cover image"
      >
        <Image
          src={src}
          alt="Cover preview"
          width={600}
          height={200}
          className="h-32 w-full rounded-lg border-2 border-gray-200 object-cover shadow"
          key={typeof src === "string" ? src : src.src} // Use string URL as key
        />
        <span className="bg-opacity-30 group-hover:bg-opacity-25 absolute inset-0 m-auto flex items-center justify-center rounded-lg bg-black text-white transition-colors duration-200">
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
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </>
  );
}

interface EditSchoolDialogProps {
  school?: any; // Adjust type as needed
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditSchoolDialog({
  school,
  open,
  onOpenChange,
}: EditSchoolDialogProps) {
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const form = useForm<TSchool>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      faculties: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faculties",
  });

  const createMutation = useCreateSchoolMutation();
  const updateMutation = useUpdateSchoolMutation();
  const updateFacultyMutation = useUpdateFacultyMutation();
  const createFacultyMutation = useCreateFacultyMutation();
  const deleteFacultyMutation = useDeleteFacultyMutation();

  useEffect(() => {
    if (school) {
      form.reset({
        id: school.id,
        name: school.name,
        slug:
          school.slug || school.name.trim().toLowerCase().replace(/\s+/g, "-"),
        description: school.description,
        faculties: school.faculties || [],
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        faculties: [],
      });
    }
    setIsSlugEdited(false); // Reset slug edited state on school change
  }, [school, form]);

  useEffect(() => {
    if (!isSlugEdited) {
      const generatedSlug =
        form.watch("name")?.trim().toLowerCase().replace(/\s+/g, "-") || "";
      form.setValue("slug", generatedSlug);
    }
  }, [form.watch("name"), isSlugEdited, form]);

  async function onSubmit(values: TSchool) {
    try {
      let savedSchool;
      if (values.id) {
        savedSchool = await updateMutation.mutateAsync({
          id: values.id,
          name: values.name,
          slug: values.slug,
          description: values.description,
        });
      } else {
        savedSchool = await createMutation.mutateAsync({
          name: values.name,
          slug: values.slug,
          description: values.description,
        });
      }

      const existingFacultyIds = new Set(
        school?.faculties?.map((f: { id: any }) => f.id),
      );
      const mutations: Promise<any>[] = [];

      for (const faculty of values.faculties) {
        if (faculty.id && existingFacultyIds.has(faculty.id)) {
          // Update existing faculty
          mutations.push(
            updateFacultyMutation.mutateAsync({
              id: faculty.id,
              name: faculty.name,
              schoolId: savedSchool.id,
              description: faculty.description,
            }),
          );
        } else {
          // Create new faculty
          mutations.push(
            createFacultyMutation.mutateAsync({
              name: faculty.name,
              schoolId: savedSchool.id,
              description: faculty.description,
            }),
          );
        }
      }

      // Delete removed faculties
      const removedFaculties =
        school?.faculties?.filter(
          (f: { id: any }) => !values.faculties.some((v) => v.id === f.id),
        ) || [];

      for (const f of removedFaculties) {
        mutations.push(deleteFacultyMutation.mutateAsync(f.id));
      }

      await Promise.all(mutations);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{school ? "Edit School" : "Add School"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input placeholder="School name" {...field} />
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
                      placeholder="School slug"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setIsSlugEdited(true);
                      }}
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="School description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Faculties</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", description: "" })}
                >
                  <Icons.add className="mr-2 size-4" />
                  Add Faculty
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`faculties.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Faculty name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`faculties.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Faculty description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Icons.trash className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => append({ name: "", description: "" })}
              >
                Add Faculty
              </Button>
            </div>
            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
// export default function EditProfileDialog({
//   user,
//   open,
//   onOpenChange,
// }: EditProfileDialogProps) {
//   const form = useForm<UpdateUserSchoolValues>({
//     resolver: zodResolver(updateUserSchoolSchema),
//     defaultValues: {
//       name: user.name,
//     },
//   });

//   const mutation = useUpdateSchoolMutation();

//   const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
//   const [croppedCover, setCroppedCover] = useState<Blob | null>(null);

//   const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>(
//     user.image || "",
//   );
//   const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>(
//     user.coverImage || "",
//   );

//   useEffect(() => {
//     if (croppedAvatar) {
//       const url = URL.createObjectURL(croppedAvatar);
//       setAvatarPreviewUrl(url);
//       return () => URL.revokeObjectURL(url);
//     } else if (user.image) {
//       setAvatarPreviewUrl(user.image);
//     }
//   }, [croppedAvatar, user.image]);

//   useEffect(() => {
//     if (croppedCover) {
//       const url = URL.createObjectURL(croppedCover);
//       setCoverPreviewUrl(url);
//       return () => URL.revokeObjectURL(url);
//     } else if (user.coverImage) {
//       setCoverPreviewUrl(user.coverImage);
//     }
//   }, [croppedCover, user.coverImage]);

//   async function onSubmit(values: UpdateUserSchoolValues) {
//     const newAvatarFile = croppedAvatar
//       ? new File([croppedAvatar], `avatar_${user.id}.webp`, {
//           type: "image/webp",
//         })
//       : undefined;
//     const newCoverFile = croppedCover
//       ? new File([croppedCover], `cover_${user.id}.webp`, {
//           type: "image/webp",
//         })
//       : undefined;

//     mutation.mutate(
//       {
//         values,
//         avatar: newAvatarFile,
//         coverImage: newCoverFile,
//       },
//       {
//         onSuccess: () => {
//           setCroppedAvatar(null);
//           setCroppedCover(null);
//           setAvatarPreviewUrl(user.image || "");
//           setCoverPreviewUrl(user.coverImage || "");
//           onOpenChange(false);
//         },
//       },
//     );
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Edit profile</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-1.5">
//           <Label>Avatar</Label>
//           <AvatarInput
//             src={avatarPreviewUrl}
//             onImageCropped={setCroppedAvatar}
//           />
//         </div>
//         <div className="space-y-1.5">
//           <Label>Cover Image</Label>
//           <CoverImageInput
//             src={coverPreviewUrl}
//             onImageCropped={setCroppedCover}
//           />
//         </div>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>School Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="School name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       placeholder="School description"
//                       className="resize-none"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <h4 className="text-sm font-medium">Faculties</h4>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={() => append({ name: "", description: "" })}
//                 >
//                   <Icons.add className="mr-2 size-4" />
//                   Add Faculty
//                 </Button>
//               </div>
//               {fields.map((field, index) => (
//                 <div key={field.id} className="flex gap-4">
//                   <FormField
//                     control={form.control}
//                     name={`faculties.${index}.name`}
//                     render={({ field }) => (
//                       <FormItem className="flex-1">
//                         <FormControl>
//                           <Input placeholder="Faculty name" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name={`faculties.${index}.description`}
//                     render={({ field }) => (
//                       <FormItem className="flex-1">
//                         <FormControl>
//                           <Input placeholder="Faculty description" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => remove(index)}
//                   >
//                     <Icons.trash className="size-4 text-destructive" />
//                   </Button>
//                 </div>
//               ))}
//             </div>

//             <DialogFooter>
//               <LoadingButton type="submit" loading={mutation.isPending}>
//                 Save
//               </LoadingButton>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }
