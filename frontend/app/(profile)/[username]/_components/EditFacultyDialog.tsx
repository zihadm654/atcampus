"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useUpdateFacultyMutation } from "@/app/(profile)/[username]/_components/schoolMutations";
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
import type { Faculty } from "./tabs/SchoolsTab";

const formSchema = z.object({
  name: z.string().min(3, "Faculty name must be at least 3 characters long"),
  description: z.string().optional(),
});

interface EditFacultyDialogProps {
  faculty: Faculty & { schoolId: string; description?: string }; // Include schoolId in the faculty type
}

export default function EditFacultyDialog({ faculty }: EditFacultyDialogProps) {
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
        schoolId: faculty.schoolId, // Include schoolId in the mutation
      },
      {
        onSuccess: () => {
          toast.success("Faculty updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update faculty");
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={updateFacultyMutation.isPending} type="submit">
            {updateFacultyMutation.isPending ? "Updating..." : "Update Faculty"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}