"use client";

import React, { useState } from "react";
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
import { School } from "./SchoolsTab";
import { Edit } from "lucide-react";
import { useUpdateSchoolMutation } from "@/app/(profile)/[username]/_components/schoolMutations";

const editSchoolSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters long"),
  description: z.string().optional(),
  website: z.string().optional(),
});

interface EditSchoolDialogProps {
  school: School;
}

export default function EditSchoolDialog({ school }: EditSchoolDialogProps) {
  const [open, setOpen] = useState(false);
  const updateSchoolMutation = useUpdateSchoolMutation();

  const form = useForm<z.infer<typeof editSchoolSchema>>({
    resolver: zodResolver(editSchoolSchema),
    defaultValues: {
      name: school.name,
      description: school.description || "",
      website: school.website || "",
    },
  });

  function onSubmit(values: z.infer<typeof editSchoolSchema>) {
    updateSchoolMutation.mutate(
      {
        id: school.id,
        ...values
      },
      {
        onSuccess: () => {
          toast.success("School updated successfully");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update school");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit School</DialogTitle>
          <DialogDescription>
            Make changes to your school here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. School description"
                      {...field}
                    />
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
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSchoolMutation.isPending}
              >
                {updateSchoolMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}