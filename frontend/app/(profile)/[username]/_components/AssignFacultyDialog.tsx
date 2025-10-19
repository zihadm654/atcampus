"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Faculty, Member } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { assignMemberToFaculty } from "./schoolActions";

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
        description: "Member has been assigned as professor to the faculty.",
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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Member as Professor</DialogTitle>
          <DialogDescription>
            Assign {member?.userId} as a professor to a faculty.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="facultyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
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
              <Button disabled={isLoading} type="submit">
                {isLoading ? "Assigning..." : "Assign as Professor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
