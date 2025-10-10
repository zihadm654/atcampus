"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Plus } from "lucide-react";
import { useCreateFacultyMutation } from "@/app/(profile)/[username]/_components/schoolMutations";

const addFacultySchema = z.object({
  name: z.string().min(3, "Faculty name must be at least 3 characters long"),
  slug: z.string().min(3, "Faculty slug must be at least 3 characters long"),
});

interface AddFacultyDialogProps {
  schoolId: string;
}

export default function AddFacultyDialog({ schoolId }: AddFacultyDialogProps) {
  const [open, setOpen] = useState(false);
  const createFacultyMutation = useCreateFacultyMutation();

  const form = useForm<z.infer<typeof addFacultySchema>>({
    resolver: zodResolver(addFacultySchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  function onSubmit(values: z.infer<typeof addFacultySchema>) {
    toast.promise(
      createFacultyMutation.mutateAsync({
        ...values,
        schoolId
      }),
      {
        loading: "Creating faculty...",
        success: "Faculty created successfully",
        error: "Failed to create faculty"
      }
    );

    // Close dialog on success
    if (!createFacultyMutation.isError) {
      form.reset();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Faculty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Faculty</DialogTitle>
          <DialogDescription>
            Add a new faculty to this school. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Computer Science"
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
                  <FormLabel>Faculty Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. computer-science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createFacultyMutation.isPending}>
                {createFacultyMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}