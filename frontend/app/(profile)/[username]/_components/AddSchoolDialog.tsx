"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useCreateSchoolMutation } from "@/app/(profile)/[username]/_components/schoolMutations";
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
});

export default function AddSchoolDialog() {
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [open, setOpen] = useState(false);
  const createSchoolMutation = useCreateSchoolMutation();

  const form = useForm<z.infer<typeof addSchoolSchema>>({
    resolver: zodResolver(addSchoolSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      website: "",
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

  function onSubmit(values: z.infer<typeof addSchoolSchema>) {
    createSchoolMutation.mutate(values, {
      onSuccess: () => {
        toast.success("School created successfully");
        form.reset();
        setIsSlugEdited(false);
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create school");
      },
    });
  }

  useEffect(() => {
    if (open) {
      form.reset();
      setIsSlugEdited(false);
    }
  }, [open, form]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>Add School</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add School</DialogTitle>
          <DialogDescription>
            Add a new school to your institution. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
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
