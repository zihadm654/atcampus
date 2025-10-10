"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition } from "react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useCreateSchoolMutation } from "@/app/(profile)/[username]/_components/schoolMutations";

export const addSchoolSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters long"),
  slug: z.string().min(3, "School slug must be at least 3 characters long"),
  description: z.string().optional(),
  website: z.string().optional(),
});

export default function AddSchoolDialog() {
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = React.useState(false);
  const createSchoolMutation = useCreateSchoolMutation();

  const form = useForm<z.infer<typeof addSchoolSchema>>({
    resolver: zodResolver(addSchoolSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const name = form.watch("name");

  useEffect(() => {
    if (!isSlugEdited) {
      const generatedSlug = name.trim().toLowerCase().replace(/\s+/g, "-");
      form.setValue("slug", generatedSlug);
    }
  }, [name, isSlugEdited, form]);

  function onSubmit(values: z.infer<typeof addSchoolSchema>) {
    toast.promise(
      createSchoolMutation.mutateAsync(values),
      {
        loading: "Creating school...",
        success: "School created successfully",
        error: "Failed to create school"
      }
    );

    // Close dialog on success
    if (!createSchoolMutation.isError) {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (open) {
      form.reset();
      setIsSlugEdited(false);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. School of Engineering"
                      {...field}
                    />
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
                  <FormLabel>School slug</FormLabel>
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
                    <Input placeholder="e.g. School website" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createSchoolMutation.isPending}>
                {createSchoolMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}