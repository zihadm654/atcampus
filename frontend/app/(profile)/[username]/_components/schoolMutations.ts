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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["school-faculties"] });
      queryClient.invalidateQueries({ queryKey: ["user-schools"] });
      toast({ description: "Faculty created successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to create faculty"
      });
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