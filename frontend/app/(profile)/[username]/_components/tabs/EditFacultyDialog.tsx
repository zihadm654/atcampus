"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Faculty } from "./SchoolsTab";
import { Edit } from 'lucide-react';
import { useUpdateFacultyMutation } from "@/app/(profile)/[username]/_components/schoolMutations";

const formSchema = z.object({
  name: z.string().min(3, "Faculty name must be at least 3 characters long"),
  description: z.string().optional(),
});

interface EditFacultyDialogProps {
  faculty: Faculty & { schoolId: string; description?: string }; // Include schoolId in the faculty type
}

export default function EditFacultyDialog({ faculty }: EditFacultyDialogProps) {
  const [open, setOpen] = useState(false);
  const updateFacultyMutation = useUpdateFacultyMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: faculty.name,
      description: faculty.description || "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateFacultyMutation.mutate(
      {
        id: faculty.id,
        ...values,
        schoolId: faculty.schoolId // Include schoolId in the mutation
      },
      {
        onSuccess: () => {
          toast.success("Faculty updated successfully");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update faculty");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Faculty</DialogTitle>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateFacultyMutation.isPending}
              >
                {updateFacultyMutation.isPending ? "Updating..." : "Update Faculty"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}