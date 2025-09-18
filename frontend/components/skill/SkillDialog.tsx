import { useEffect } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
import LoadingButton from "@/components/feed/LoadingButton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSkillMutation, useDeleteSkillMutation } from "./mutations";
import SkillCategorySelect from "./SkillCategorySelect";
import { SkillSearchInput } from "./SkillSearchInput";
import { Icons } from "@/components/shared/icons";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface SkillDialogProps {
  skill?: UserSkillData | null;
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean, success?: boolean) => void;
}

export default function SkillDialog({
  skill,
  open,
  onOpenChange,
  user,
}: SkillDialogProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<TUserSkillSchema>({
    resolver: zodResolver(userSkillSchema),
    defaultValues: {
      title: skill?.title || "",
      category: skill?.skill?.category || "",
      level: skill?.level || "BEGINNER",
      yearsOfExperience: skill?.yearsOfExperience || 0,
    },
  });

  const mutation = useSkillMutation();
  const deleteMutation = useDeleteSkillMutation();

  // Reset form when dialog opens/closes or skill changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: skill?.title || "",
        category: skill?.skill?.category || "",
        level: skill?.level || "BEGINNER",
        yearsOfExperience: skill?.yearsOfExperience || 0,
      });
    }
  }, [open, skill, form]);

  const handleClose = (success = false) => {
    form.reset();
    onOpenChange(false, success);
  };

  async function onSubmit(values: TUserSkillSchema) {
    try {
      await mutation.mutateAsync({
        id: skill?.id,
        values,
      });

      toast({
        title: skill ? "Skill updated" : "Skill added",
        description: skill
          ? `"${values.title}" has been updated successfully.`
          : `"${values.title}" has been added to your profile.`,
      });

      handleClose(true);
    } catch (error: any) {
      const message =
        error?.message || "Failed to save skill. Please try again.";

      // Handle specific validation errors
      if (message.includes("already have a skill")) {
        form.setError("title", {
          message: "You already have this skill in your profile",
        });
      } else if (message.includes("must be at least")) {
        const field = message.includes("Skill name")
          ? "title"
          : message.includes("Category")
            ? "category"
            : message.includes("Years")
              ? "yearsOfExperience"
              : "root";
        form.setError(field as any, { message });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    }
  }

  const handleDelete = async () => {
    if (!skill?.id) return;

    try {
      await deleteMutation.mutateAsync(skill.id);
      toast({
        title: "Skill deleted",
        description: `"${skill.title}" has been removed from your profile.`,
      });
      setShowDeleteDialog(false);
      handleClose(true);
    } catch (error: any) {
      const message =
        error?.message || "Failed to delete skill. Please try again.";

      // Handle specific delete errors
      if (message.includes("endorsement")) {
        toast({
          title: "Cannot delete skill",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }

      setShowDeleteDialog(false);
    }
  };

  const isSubmitting = mutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => !isSubmitting && handleClose()}
      >
        <DialogContent
          className="sm:max-w-[425px]"
          onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
          onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
          aria-describedby="skill-dialog-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center" id="skill-dialog-title">
              {skill ? (
                <>
                  <Icons.pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Edit Skill
                </>
              ) : (
                <>
                  <Icons.add className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add New Skill
                </>
              )}
            </DialogTitle>
            <DialogDescription id="skill-dialog-description">
              {skill
                ? "Update your skill details below."
                : "Add a new skill to showcase your expertise."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-semibold">
                        <Icons.skill className="mr-2 h-4 w-4" />
                        Skill Name
                        <span className="ml-1 text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <SkillSearchInput
                          onChange={field.onChange}
                          defaultValue={field.value}
                          // placeholder="e.g., React, Python, Design"
                          // disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-semibold">
                        <Icons.calendar className="mr-2 h-4 w-4" />
                        Category
                      </FormLabel>
                      <FormControl>
                        <SkillCategorySelect
                          onChange={field.onChange}
                          value={field.value}
                          // disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-600">
                        Choose a category that best describes your skill
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-semibold">
                          <Icons.event className="mr-2 h-4 w-4" />
                          Proficiency
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BEGINNER">
                              <span className="flex items-center">
                                <Icons.spinner className="mr-2 h-3 w-3 text-green-500" />
                                Beginner
                              </span>
                            </SelectItem>
                            <SelectItem value="INTERMEDIATE">
                              <span className="flex items-center">
                                <Icons.spinner className="mr-2 h-3 w-3 text-yellow-500" />
                                Intermediate
                              </span>
                            </SelectItem>
                            <SelectItem value="ADVANCED">
                              <span className="flex items-center">
                                <Icons.spinner className="mr-2 h-3 w-3 text-orange-500" />
                                Advanced
                              </span>
                            </SelectItem>
                            <SelectItem value="EXPERT">
                              <span className="flex items-center">
                                <Icons.spinner className="mr-2 h-3 w-3 text-red-500" />
                                Expert
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-semibold">
                          <Icons.calendar className="mr-2 h-4 w-4" />
                          Experience
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            disabled={isSubmitting}
                            placeholder="0 years"
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {form.formState.errors.root && (
                <Alert variant="destructive" className="border-red-200">
                  <Icons.warning className="h-4 w-4" />
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <DialogFooter className="gap-2 pt-4 border-t">
                {skill && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isSubmitting}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose()}
                  disabled={isSubmitting}
                  className="border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  loading={mutation.isPending}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  {skill ? "Update Skill" : "Add Skill"}
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{skill?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
