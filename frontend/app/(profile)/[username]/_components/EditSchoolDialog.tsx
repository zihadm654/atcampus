"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useUpdateSchoolMutation } from "@/app/(profile)/[username]/_components/schoolMutations";
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
import { Textarea } from "@/components/ui/textarea";
import type { School } from "./tabs/SchoolsTab";

const editSchoolSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters long"),
  description: z.string().optional(),
  website: z.string().optional(),
});

interface EditSchoolDialogProps {
  school: School;
}

export default function EditSchoolDialog({ school }: EditSchoolDialogProps) {
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
        ...values,
      },
      {
        onSuccess: () => {
          toast.success("School updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update school");
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. School of Engineering" {...field} />
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
                <Textarea
                  placeholder="Enter a brief description of the school"
                  {...field}
                  className="resize-none"
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
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={updateSchoolMutation.isPending} type="submit">
            {updateSchoolMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
