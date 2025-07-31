"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Member, Faculty } from "@prisma/client";
import { assignMemberToFaculty } from "./schoolActions";
import { useQueryClient } from "@tanstack/react-query";

interface AssignFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  faculties: Faculty[];
}

const formSchema = z.object({
  facultyId: z.string().min(1, { message: "Please select a faculty." }),
});

export default function AssignFacultyDialog({
  open,
  onOpenChange,
  member,
  faculties,
}: AssignFacultyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facultyId: member?.facultyId || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!member) return;

    try {
      setIsLoading(true);
      await assignMemberToFaculty(member.id, values.facultyId);

      // Invalidate relevant queries
      await queryClient.invalidateQueries({
        queryKey: ["professors", values.facultyId],
      });

      toast({
        title: "Success!",
        description: `Member has been assigned as professor to the faculty.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to assign member to faculty.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Member as Professor</DialogTitle>
          <DialogDescription>
            Assign {member?.userId} as a professor to a faculty.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="facultyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a faculty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Assigning..." : "Assign as Professor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
