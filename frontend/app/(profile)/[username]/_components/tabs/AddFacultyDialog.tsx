"use client";

import React, { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { coursesData } from "@/config/course";

const addFacultySchema = z.object({
  name: z.string().min(1, "Faculty name is required"),
  slug: z.string().min(1, "Faculty slug is required"),
  description: z.string().optional(),
});

interface AddFacultyDialogProps {
  schoolId: string;
}

export default function AddFacultyDialog({ schoolId }: AddFacultyDialogProps) {
  const [open, setOpen] = useState(false);
  const createFacultyMutation = useCreateFacultyMutation();
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // Since we're working with static data and schoolId is a database ID,
  // we'll try to find a matching school by checking if any school name contains the schoolId
  // This is a workaround for the static data implementation
  const selectedSchool = coursesData.schools.find(school => school.name.includes(schoolId)) ||
    coursesData.schools.find(school => schoolId.includes(school.name)) ||
    coursesData.schools[0];

  const form = useForm<z.infer<typeof addFacultySchema>>({
    resolver: zodResolver(addFacultySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
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
    createFacultyMutation.mutate(
      {
        ...values,
        schoolId,
      },
      {
        onSuccess: () => {
          toast.success("Faculty created successfully");
          form.reset();
          setIsSlugEdited(false);
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create faculty");
        },
      }
    );
  }

  // Reset form and state when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        slug: "",
        description: "",
      });
      setIsSlugEdited(false);
    }
  }, [open, form]);

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Name</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                    <Input
                      placeholder="e.g. Faculty description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createFacultyMutation.isPending}
              >
                {createFacultyMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}