"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import {
  createFaculty,
  createSchool,
  deleteFaculty,
  deleteSchool,
  updateFaculty,
  updateSchool,
} from "./schoolActions";

// The rest of the file defines school and faculty mutations

export function useCreateSchoolMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add upload thing hooks for school images with progress tracking
  const { startUpload: startSchoolLogoUpload, isUploading: isLogoUploading } =
    useUploadThing("schoolLogo");
  const { startUpload: startSchoolCoverUpload, isUploading: isCoverUploading } =
    useUploadThing("schoolCoverImage");

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      // Extract image files if they exist (handle both File and Blob)
      const logoFile =
        values.logo instanceof File || values.logo instanceof Blob
          ? values.logo
          : null;
      const coverPhotoFile =
        values.coverPhoto instanceof File || values.coverPhoto instanceof Blob
          ? values.coverPhoto
          : null;

      // Remove file objects from values to avoid serialization issues
      const { logo, coverPhoto, ...restValues } = values;

      // Create school first
      const school = await createSchool(restValues);

      // Upload images if they exist
      const [logoUploadResult, coverUploadResult] = await Promise.all([
        logoFile ? startSchoolLogoUpload([logoFile]) : Promise.resolve(null),
        coverPhotoFile
          ? startSchoolCoverUpload([coverPhotoFile])
          : Promise.resolve(null),
      ]);

      // Get uploaded URLs - fix: use correct property names from uploadthing
      const logoUrl = logoUploadResult?.[0]?.serverData?.schoolLogoUrl;
      const coverPhotoUrl =
        coverUploadResult?.[0]?.serverData?.schoolCoverImageUrl;

      // Update school with image URLs if they were uploaded
      if (logoUrl || coverPhotoUrl) {
        const updatedValues: any = { id: school.id };
        if (logoUrl) updatedValues.logo = logoUrl;
        if (coverPhotoUrl) updatedValues.coverPhoto = coverPhotoUrl;
        return await updateSchool(updatedValues);
      }

      return school;
    },
    onMutate: async (newSchool) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user-schools"] });

      // Snapshot the previous value
      const previousSchools = queryClient.getQueryData(["user-schools"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["user-schools"], (old: any) => {
        if (!old) return [newSchool];
        return [
          ...old,
          {
            ...newSchool,
            id: `optimistic-${Date.now()}`,
            faculties: [],
          },
        ];
      });

      // Return a context object with the snapshotted value
      return { previousSchools };
    },
    onSuccess: (data) => {
      // Update with the actual data from the server
      queryClient.setQueryData(["user-schools"], (old: any) => {
        if (!old) return old;
        return old.map((school: any) =>
          school.id.startsWith("optimistic-") && school.name === data.name
            ? data
            : school
        );
      });
      toast({ description: "School created successfully" });
    },
    onError: (error: Error, _variables, context) => {
      // Rollback to the previous value
      if (context?.previousSchools) {
        queryClient.setQueryData(["user-schools"], context.previousSchools);
      }
      toast({
        variant: "destructive",
        description: error.message || "Failed to create school",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
    },
  });
  return mutation;
}

export function useUpdateSchoolMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add upload thing hooks for school images with progress tracking
  const { startUpload: startSchoolLogoUpload, isUploading: isLogoUploading } =
    useUploadThing("schoolLogo");
  const { startUpload: startSchoolCoverUpload, isUploading: isCoverUploading } =
    useUploadThing("schoolCoverImage");

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      // Extract image files if they exist (handle both File and Blob)
      const logoFile =
        values.logo instanceof File || values.logo instanceof Blob
          ? values.logo
          : null;
      const coverPhotoFile =
        values.coverPhoto instanceof File || values.coverPhoto instanceof Blob
          ? values.coverPhoto
          : null;

      // Remove file objects from values to avoid serialization issues
      const { logo, coverPhoto, ...restValues } = values;

      // Upload images if they exist
      const [logoUploadResult, coverUploadResult] = await Promise.all([
        logoFile ? startSchoolLogoUpload([logoFile]) : Promise.resolve(null),
        coverPhotoFile
          ? startSchoolCoverUpload([coverPhotoFile])
          : Promise.resolve(null),
      ]);

      // Get uploaded URLs - fix: use correct property names from uploadthing
      const logoUrl = logoUploadResult?.[0]?.serverData?.schoolLogoUrl;
      const coverPhotoUrl =
        coverUploadResult?.[0]?.serverData?.schoolCoverImageUrl;

      // Prepare update values with image URLs if they were uploaded
      const updateValues: any = { id: restValues.id, ...restValues };
      if (logoUrl) updateValues.logo = logoUrl;
      if (coverPhotoUrl) updateValues.coverPhoto = coverPhotoUrl;

      return await updateSchool(updateValues);
    },
    onMutate: async (updatedSchool) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user-schools"] });

      // Snapshot the previous value
      const previousSchools = queryClient.getQueryData(["user-schools"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["user-schools"], (old: any) => {
        if (!old) return old;
        return old.map((school: any) =>
          school.id === updatedSchool.id
            ? { ...school, ...updatedSchool }
            : school
        );
      });

      // Return a context object with the snapshotted value
      return { previousSchools };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
      toast({ description: "School updated successfully" });
    },
    onError: (error: Error, _variables, context) => {
      // Rollback to the previous value
      if (context?.previousSchools) {
        queryClient.setQueryData(["user-schools"], context.previousSchools);
      }
      toast({
        variant: "destructive",
        description: error.message || "Failed to update school",
      });
    },
  });
  return mutation;
}

export function useDeleteSchoolMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteSchool,
    onMutate: async (schoolId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user-schools"] });

      // Snapshot the previous value
      const previousSchools = queryClient.getQueryData(["user-schools"]);

      // Optimistically remove the school
      queryClient.setQueryData(["user-schools"], (old: any) => {
        if (!old) return old;
        return old.filter((school: any) => school.id !== schoolId);
      });

      // Return a context object with the snapshotted value
      return { previousSchools };
    },
    onSuccess: () => {
      toast({ description: "School deleted successfully" });
    },
    onError: (error: Error, _variables, context) => {
      // Rollback to the previous value
      if (context?.previousSchools) {
        queryClient.setQueryData(["user-schools"], context.previousSchools);
      }
      toast({
        variant: "destructive",
        description: error.message || "Failed to delete school",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
    },
  });
  return mutation;
}

export function useCreateFacultyMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add upload thing hooks for faculty images
  const { startUpload: startFacultyLogoUpload } = useUploadThing("avatar");
  const { startUpload: startFacultyCoverUpload } = useUploadThing("coverImage");

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      // Extract image files if they exist (handle both File and Blob)
      const logoFile =
        values.logo instanceof File || values.logo instanceof Blob
          ? values.logo
          : null;
      const coverPhotoFile =
        values.coverPhoto instanceof File || values.coverPhoto instanceof Blob
          ? values.coverPhoto
          : null;

      // Remove file objects from values to avoid serialization issues
      const { logo, coverPhoto, ...restValues } = values;

      // Create faculty first
      const result = await createFaculty(restValues);
      const faculty = result.faculty;

      // Upload images if they exist
      const [logoUploadResult, coverUploadResult] = await Promise.all([
        logoFile ? startFacultyLogoUpload([logoFile]) : Promise.resolve(null),
        coverPhotoFile
          ? startFacultyCoverUpload([coverPhotoFile])
          : Promise.resolve(null),
      ]);

      // Get uploaded URLs - fix: use correct property names from uploadthing
      const logoUrl = logoUploadResult?.[0]?.serverData?.avatarUrl;
      const coverPhotoUrl = coverUploadResult?.[0]?.serverData?.coverImageUrl;

      // Update faculty with image URLs if they were uploaded
      if (logoUrl || coverPhotoUrl) {
        const updatedValues: any = { id: faculty.id };
        if (logoUrl) updatedValues.logo = logoUrl;
        if (coverPhotoUrl) updatedValues.coverPhoto = coverPhotoUrl;
        const updatedFaculty = await updateFaculty(updatedValues);
        return { success: true, faculty: updatedFaculty };
      }

      return result;
    },
    onMutate: async (newFaculty) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user-schools"] });

      // Snapshot the previous value
      const previousSchools = queryClient.getQueryData(["user-schools"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["user-schools"], (old: any) => {
        if (!old) return old;
        return old.map((school: any) => {
          if (school.id === newFaculty.schoolId) {
            return {
              ...school,
              faculties: [
                ...(school.faculties || []),
                {
                  id: `optimistic-${Date.now()}`,
                  name: newFaculty.name,
                  schoolId: newFaculty.schoolId,
                  description: newFaculty.description,
                },
              ],
            };
          }
          return school;
        });
      });

      // Return a context object with the snapshotted value
      return { previousSchools };
    },
    onSuccess: (data) => {
      // Update with the actual data from the server
      queryClient.setQueryData(["user-schools"], (old: any) => {
        if (!old) return old;
        return old.map((school: any) => {
          if (school.id === data.faculty.schoolId) {
            // Replace the optimistic faculty with the actual one
            return {
              ...school,
              faculties: school.faculties.map((faculty: any) =>
                faculty.id.startsWith("optimistic-") &&
                faculty.name === data.faculty.name
                  ? data.faculty
                  : faculty
              ),
            };
          }
          return school;
        });
      });
      toast({ description: "Faculty created successfully" });
    },
    onError: (error: Error, _variables, context) => {
      // Rollback to the previous value
      if (context?.previousSchools) {
        queryClient.setQueryData(["user-schools"], context.previousSchools);
      }
      toast({
        variant: "destructive",
        description: error.message || "Failed to create faculty",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
    },
  });
  return mutation;
}

export function useUpdateFacultyMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add upload thing hooks for faculty images
  const { startUpload: startFacultyLogoUpload } = useUploadThing("avatar");
  const { startUpload: startFacultyCoverUpload } = useUploadThing("coverImage");

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      // Extract image files if they exist (handle both File and Blob)
      const logoFile =
        values.logo instanceof File || values.logo instanceof Blob
          ? values.logo
          : null;
      const coverPhotoFile =
        values.coverPhoto instanceof File || values.coverPhoto instanceof Blob
          ? values.coverPhoto
          : null;

      // Remove file objects from values to avoid serialization issues
      const { logo, coverPhoto, ...restValues } = values;

      // Upload images if they exist
      const [logoUploadResult, coverUploadResult] = await Promise.all([
        logoFile ? startFacultyLogoUpload([logoFile]) : Promise.resolve(null),
        coverPhotoFile
          ? startFacultyCoverUpload([coverPhotoFile])
          : Promise.resolve(null),
      ]);

      // Get uploaded URLs - fix: use coverImageUrl instead of coverPhotoUrl
      const logoUrl = logoUploadResult?.[0]?.serverData?.avatarUrl;
      const coverPhotoUrl = coverUploadResult?.[0]?.serverData?.coverImageUrl;

      // Prepare update values with image URLs if they were uploaded
      const updateValues: any = { id: restValues.id, ...restValues };
      if (logoUrl) updateValues.logo = logoUrl;
      if (coverPhotoUrl) updateValues.coverPhoto = coverPhotoUrl;

      return await updateFaculty(updateValues);
    },
    onMutate: async (updatedFaculty) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user-schools"] });

      // Snapshot the previous value
      const previousSchools = queryClient.getQueryData(["user-schools"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["user-schools"], (old: any) => {
        if (!old) return old;
        return old.map((school: any) => {
          if (school.id === updatedFaculty.schoolId) {
            return {
              ...school,
              faculties: school.faculties.map((faculty: any) =>
                faculty.id === updatedFaculty.id
                  ? { ...faculty, ...updatedFaculty }
                  : faculty
              ),
            };
          }
          return school;
        });
      });

      // Return a context object with the snapshotted value
      return { previousSchools };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["school-faculties"] });
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
      toast({ description: "Faculty updated successfully" });
    },
    onError: (error: Error, _variables, context) => {
      // Rollback to the previous value
      if (context?.previousSchools) {
        queryClient.setQueryData(["user-schools"], context.previousSchools);
      }
      toast({
        variant: "destructive",
        description: error.message || "Failed to update faculty",
      });
    },
  });
  return mutation;
}

export function useDeleteFacultyMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteFaculty,
    onMutate: async (facultyId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user-schools"] });

      // Snapshot the previous value
      const previousSchools = queryClient.getQueryData(["user-schools"]);

      // Optimistically remove the faculty
      queryClient.setQueryData(["user-schools"], (old: any) => {
        if (!old) return old;
        return old.map((school: any) => ({
          ...school,
          faculties: school.faculties.filter(
            (faculty: any) => faculty.id !== facultyId
          ),
        }));
      });

      // Return a context object with the snapshotted value
      return { previousSchools };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-faculties"] });
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
      toast({ description: "Faculty deleted successfully" });
    },
    onError: (error: Error, _variables, context) => {
      // Rollback to the previous value
      if (context?.previousSchools) {
        queryClient.setQueryData(["user-schools"], context.previousSchools);
      }
      toast({
        variant: "destructive",
        description: error.message || "Failed to delete faculty",
      });
    },
  });
  return mutation;
}
