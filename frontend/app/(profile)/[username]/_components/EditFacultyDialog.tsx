"use client";
import React from 'react';

import { zodResolver } from "@hookform/resolvers/zod";
import { Faculty, School } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent,
  DialogDescription, DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl,
  FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateFacultyMutation } from "./schoolMutations";

const facultySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Faculty name is required" }),
  description: z.string().optional(),
  schoolId: z.string().min(1, { message: "School ID is required" }),
});

type TFaculty = z.infer<typeof facultySchema>;

interface EditFacultyDialogProps {
  faculty: (Faculty & { school: School | null }) | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditFacultyDialog({
  faculty,
  open,
  onOpenChange,
}: EditFacultyDialogProps) {
  const { toast } = useToast();
  const updateFacultyMutation = useUpdateFacultyMutation();

  const form = useForm<TFaculty>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      id: faculty?.id || "",
      name: faculty?.name || "",
      description: faculty?.description || "",
      schoolId: faculty?.schoolId || "",
    },
  });

  async function onSubmit(values: TFaculty) {
    try {
      if (faculty) {
        await updateFacultyMutation.mutateAsync({
          id: faculty.id,
          name: values.name,
          description: values.description,
          schoolId: values.schoolId,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update faculty.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Faculty</DialogTitle>
          <DialogDescription>
            Make changes to your faculty here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save changes</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}