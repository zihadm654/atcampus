import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import LoadingButton from "@/components/feed/LoadingButton";
import { Icons } from "@/components/shared/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { SKILL_CATEGORIES } from "@/config/skills";
import {
  type TUserSkillSchema,
  userSkillSchema,
} from "@/lib/validations/validation";
import type { UserData, UserSkillData } from "@/types/types";
import { useDeleteSkillMutation, useSkillMutation } from "./mutations";
import { SkillSearchInput } from "./SkillSearchInput";

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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  const form = useForm<TUserSkillSchema>({
    resolver: zodResolver(userSkillSchema),
    defaultValues: {
      name: skill?.skill?.name || "",
      category: skill?.skill?.category || "",
      difficulty: skill?.skill?.difficulty || "BEGINNER",
      yearsOfExperience: skill?.skill?.yearsOfExperience || 0,
    },
  });

  const mutation = useSkillMutation();
  const deleteMutation = useDeleteSkillMutation();

  // Reset form when dialog opens/closes or skill changes
  useEffect(() => {
    if (open) {
      const skillName = skill?.skill?.name || "";
      const skillCategory = skill?.skill?.category || "";
      const skillLevel = skill?.skill?.difficulty || "BEGINNER";
      const yearsOfExperience = skill?.skill?.yearsOfExperience || 0;

      form.reset({
        name: skillName,
        category: skillCategory,
        difficulty: skillLevel,
        yearsOfExperience,
      });

      // Set initial category and skill state
      if (skillName && skillCategory) {
        // Find category by skill name
        for (const category of SKILL_CATEGORIES) {
          const foundSkill = category.skills.find((s) => s.label === skillName);
          if (foundSkill) {
            setSelectedCategory(category.id);
            setSelectedSkill(foundSkill.value);
            break;
          }
        }
      } else {
        setSelectedCategory("");
        setSelectedSkill("");
      }
    }
  }, [open, skill, form]);

  const handleClose = (success = false) => {
    form.reset();
    setSelectedCategory("");
    setSelectedSkill("");
    onOpenChange(false, success);
  };

  async function onSubmit(values: TUserSkillSchema) {
    try {
      // If no category is selected but we have a name, try to find a category
      let categoryValue = values.category;
      if (!categoryValue && values.name) {
        // Try to find category from predefined skills
        for (const category of SKILL_CATEGORIES) {
          const foundSkill = category.skills.find(
            (s) => s.label === values.name
          );
          if (foundSkill) {
            categoryValue = category.name;
            break;
          }
        }
      }

      // Map the form values to match the expected API structure
      const apiValues = {
        name: values.name,
        category: categoryValue || "",
        difficulty: values.difficulty,
        yearsOfExperience: values.yearsOfExperience,
      };

      await mutation.mutateAsync({
        id: skill?.id,
        values: apiValues,
      });

      toast({
        title: skill ? "Skill updated" : "Skill added",
        description: skill
          ? `"${values.name}" has been updated successfully.`
          : `"${values.name}" has been added to your profile.`,
      });

      handleClose(true);
    } catch (error: any) {
      const message =
        error?.message || "Failed to save skill. Please try again.";

      // Handle specific validation errors
      if (message.includes("already have a skill")) {
        form.setError("name", {
          message: "You already have this skill in your profile",
        });
      } else if (message.includes("must be at least")) {
        const field = message.includes("Skill name")
          ? "name"
          : message.includes("Category")
            ? "category"
            : message.includes("Years")
              ? "difficulty"
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
        description: `"${skill.skill?.name}" has been removed from your profile.`,
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

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSkill("");

    // Reset the name field when category changes
    form.setValue("name", "");
    form.clearErrors("name");
  };

  const handleSkillChange = (skillValue: string) => {
    setSelectedSkill(skillValue);

    // Find the skill label and update the form
    const category = SKILL_CATEGORIES.find(
      (cat) => cat.id === selectedCategory
    );
    if (category) {
      const skill = category.skills.find((s) => s.value === skillValue);
      if (skill) {
        form.setValue("name", skill.label);
        // Set category if not already set
        if (!form.getValues("category")) {
          form.setValue("category", category.name);
        }
        form.clearErrors("name");
      }
    }
  };

  const currentCategory = SKILL_CATEGORIES.find(
    (cat) => cat.id === selectedCategory
  );
  const currentSkills = currentCategory?.skills || [];

  // Check if any mutation is in progress
  const isSubmitting = mutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Dialog
        onOpenChange={(isOpen) => !isSubmitting && handleClose()}
        open={open}
      >
        <DialogContent
          aria-describedby="skill-dialog-description"
          className="sm:max-w-[425px]"
          onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
          onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center" id="skill-dialog-title">
              {skill ? (
                <>
                  <Icons.pencil aria-hidden="true" className="mr-2 h-4 w-4" />
                  Edit Skill
                </>
              ) : (
                <>
                  <Icons.add aria-hidden="true" className="mr-2 h-4 w-4" />
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
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="flex items-center font-semibold text-sm">
                    <Icons.calendar className="mr-2 h-4 w-4" />
                    Category
                  </label>
                  <Select
                    onValueChange={handleCategoryChange}
                    value={selectedCategory}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="-- Select a Category --" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-gray-600 text-sm">
                    Choose a category that best describes your skill
                  </p>
                </div>

                {/* Skill Selection */}
                {selectedCategory && (
                  <div>
                    <label className="flex items-center font-semibold text-sm">
                      <Icons.skill className="mr-2 h-4 w-4" />
                      Skill
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Select
                      onValueChange={handleSkillChange}
                      value={selectedSkill}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="-- Select a Skill --" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSkills.map((skill) => (
                          <SelectItem key={skill.value} value={skill.value}>
                            {skill.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Manual Skill Input (when no category selected or custom skill) */}
                {!selectedCategory && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-semibold">
                          <Icons.skill className="mr-2 h-4 w-4" />
                          Skill Name
                          <span className="ml-1 text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <SkillSearchInput
                            defaultValue={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              // Clear category error when user starts typing
                              if (form.formState.errors.category) {
                                form.clearErrors("category");
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-semibold">
                          <Icons.event className="mr-2 h-4 w-4" />
                          Proficiency
                        </FormLabel>
                        <Select
                          defaultValue={field.value}
                          disabled={isSubmitting}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BEGINNER">
                              <span className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                                Beginner
                              </span>
                            </SelectItem>
                            <SelectItem value="INTERMEDIATE">
                              <span className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
                                Intermediate
                              </span>
                            </SelectItem>
                            <SelectItem value="EXPERT">
                              <span className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
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
                            max="50"
                            min="0"
                            type="number"
                            {...field}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            disabled={isSubmitting}
                            onChange={(e) =>
                              field.onChange(
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="0 years"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {form.formState.errors.root && (
                <Alert className="border-red-200" variant="destructive">
                  <Icons.warning className="h-4 w-4" />
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <DialogFooter className="gap-2 border-t pt-4">
                {skill && (
                  <Button
                    className="border-red-200 text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    disabled={isSubmitting}
                    onClick={() => setShowDeleteDialog(true)}
                    type="button"
                    variant="outline"
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
                <div className="flex-1" />
                <Button
                  className="border-gray-200 transition-colors hover:border-gray-300"
                  disabled={isSubmitting}
                  onClick={() => handleClose()}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <LoadingButton
                  className="bg-blue-600 text-white transition-colors hover:bg-blue-700"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  type="submit"
                >
                  {skill ? "Update Skill" : "Add Skill"}
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{skill?.skill?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
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
