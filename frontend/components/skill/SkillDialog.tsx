import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SkillLevel } from "@prisma/client";
import { useForm } from "react-hook-form";

import { UserData, UserSkillData } from "@/types/types";
import {
  TUserSkillSchema,
  userSkillSchema,
} from "@/lib/validations/validation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LoadingButton from "@/components/feed/LoadingButton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSkillMutation } from "./mutations";
import SkillCategorySelect from "./SkillCategorySelect";
import { SkillSearchInput } from "./SkillSearchInput";

interface SkillDialogProps {
  skill?: UserSkillData | null;
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SkillDialog({
  skill,
  open,
  onOpenChange,
  user,
}: SkillDialogProps) {
  const form = useForm<TUserSkillSchema>({
    resolver: zodResolver(userSkillSchema),
    defaultValues: {
      title: skill?.title || "",
      level: skill?.level || "BEGINNER",
      yearsOfExperience: skill?.yearsOfExperience || 0,
    },
  });

  const mutation = useSkillMutation();

  async function onSubmit(values: TUserSkillSchema) {
    mutation.mutate(
      { ...values },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{skill ? "Edit Skill" : "Add Skill"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <SkillSearchInput
                    onChange={field.onChange}
                    defaultValue={field.value}
                  />
                  <FormDescription>
                    Search for an existing skill or add a new one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <SkillCategorySelect
                    onChange={field.onChange}
                    value={field.value}
                  />
                  <FormDescription>
                    Select the category for your skill.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormField
                      name="level"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="level">
                            Choose Your level
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger id="level">
                                <SelectValue placeholder="Select your level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(SkillLevel).map((roleValue) => (
                                <SelectItem key={roleValue} value={roleValue}>
                                  {roleValue.charAt(0).toUpperCase() +
                                    roleValue.slice(1).toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select your level</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Years of Experience"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
