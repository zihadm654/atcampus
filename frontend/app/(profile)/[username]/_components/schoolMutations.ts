'use client';

import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSchool, updateSchool, deleteSchool, createFaculty, updateFaculty, deleteFaculty } from "./schoolActions";

// The rest of the file defines school and faculty mutations

export function useCreateSchoolMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
      toast({ description: "School created successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to create school"
      });
    },
  });
  return mutation;
}

export function useUpdateSchoolMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
      toast({ description: "School updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to update school"
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
      toast({ description: "School deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to delete school"
      });
    },
  });
  return mutation;
}

export function useCreateFacultyMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createFaculty,
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
              faculties: [...(school.faculties || []), { 
                id: `optimistic-${Date.now()}`, 
                name: newFaculty.name,
                schoolId: newFaculty.schoolId,
                description: newFaculty.description
              }]
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
                faculty.id.startsWith('optimistic-') && faculty.name === data.faculty.name 
                  ? data.faculty 
                  : faculty
              )
            };
          }
          return school;
        });
      });
      toast({ description: "Faculty created successfully" });
    },
    onError: (error: Error, variables, context) => {
      // Rollback to the previous value
      if (context?.previousSchools) {
        queryClient.setQueryData(["user-schools"], context.previousSchools);
      }
      toast({
        variant: "destructive",
        description: error.message || "Failed to create faculty"
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
  const mutation = useMutation({
    mutationFn: updateFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-faculties"] });
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
      toast({ description: "Faculty updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to update faculty"
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-faculties"] });
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
      toast({ description: "Faculty deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to delete faculty"
      });
    },
  });
  return mutation;
}