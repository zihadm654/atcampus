"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

// API functions (to be implemented)
async function fetchAcademicStructure(organizationId: string) {
  const response = await fetch(
    `/api/organizations/${organizationId}/structure`
  );
  if (!response.ok) throw new Error("Failed to fetch academic structure");
  return response.json();
}

async function fetchSchoolDetails(schoolId: string) {
  const response = await fetch(`/api/schools/${schoolId}/details`);
  if (!response.ok) throw new Error("Failed to fetch school details");
  return response.json();
}

async function fetchFacultyDetails(facultyId: string) {
  const response = await fetch(`/api/faculties/${facultyId}/details`);
  if (!response.ok) throw new Error("Failed to fetch faculty details");
  return response.json();
}

async function fetchUserActivity(
  userId: string,
  type: "jobs" | "research" | "courses"
) {
  const response = await fetch(`/api/users/${userId}/activity/${type}`);
  if (!response.ok) throw new Error(`Failed to fetch user ${type}`);
  return response.json();
}

// Progressive loading hook for academic structure
export function useAcademicStructure(organizationId: string, enabled = true) {
  return useQuery({
    queryKey: ["academic-structure", organizationId],
    queryFn: () => fetchAcademicStructure(organizationId),
    enabled: enabled && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Lazy loading hook for school details
export function useSchoolDetails(schoolId: string, enabled = false) {
  return useQuery({
    queryKey: ["school-details", schoolId],
    queryFn: () => fetchSchoolDetails(schoolId),
    enabled: enabled && !!schoolId,
    staleTime: 5 * 60 * 1000,
    // cacheTime: 10 * 60 * 1000,
  });
}

// Lazy loading hook for faculty details
export function useFacultyDetails(facultyId: string, enabled = false) {
  return useQuery({
    queryKey: ["faculty-details", facultyId],
    queryFn: () => fetchFacultyDetails(facultyId),
    enabled: enabled && !!facultyId,
    staleTime: 5 * 60 * 1000,
    // cacheTime: 10 * 60 * 1000,
  });
}

// Progressive loading for user activity data
export function useUserActivity(
  userId: string,
  type: "jobs" | "research" | "courses",
  enabled = true
) {
  return useQuery({
    queryKey: ["user-activity", userId, type],
    queryFn: () => fetchUserActivity(userId, type),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    // cacheTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Batched data loading hook for profile tabs
export function useProfileTabData(userId: string, activeTab: string) {
  const queryClient = useQueryClient();

  // Preload next likely tab data
  const preloadTabData = useCallback(
    (tab: string) => {
      switch (tab) {
        case "courses":
          queryClient.prefetchQuery({
            queryKey: ["user-activity", userId, "courses"],
            queryFn: () => fetchUserActivity(userId, "courses"),
            staleTime: 2 * 60 * 1000,
          });
          break;
        case "jobs":
          queryClient.prefetchQuery({
            queryKey: ["user-activity", userId, "jobs"],
            queryFn: () => fetchUserActivity(userId, "jobs"),
            staleTime: 2 * 60 * 1000,
          });
          break;
        case "research":
          queryClient.prefetchQuery({
            queryKey: ["user-activity", userId, "research"],
            queryFn: () => fetchUserActivity(userId, "research"),
            staleTime: 2 * 60 * 1000,
          });
          break;
        default:
      }
    },
    [userId, queryClient]
  );

  // Load current tab data
  const currentTabData = useQuery({
    queryKey: ["user-activity", userId, activeTab],
    queryFn: () => fetchUserActivity(userId, activeTab as any),
    enabled: !!userId && ["courses", "jobs", "research"].includes(activeTab),
    staleTime: 2 * 60 * 1000,
  });

  return { currentTabData, preloadTabData };
}

// Optimistic updates for academic structure mutations
export function useAcademicMutations() {
  const queryClient = useQueryClient();

  const updateSchool = useMutation({
    mutationFn: async ({ schoolId, data }: { schoolId: string; data: any }) => {
      const response = await fetch(`/api/schools/${schoolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update school");
      return response.json();
    },
    onMutate: async ({ schoolId, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: ["school-details", schoolId],
      });
      const previousData = queryClient.getQueryData([
        "school-details",
        schoolId,
      ]);

      queryClient.setQueryData(["school-details", schoolId], (old: any) => ({
        ...old,
        ...data,
      }));

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["school-details", variables.schoolId],
          context.previousData
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({
        queryKey: ["school-details", variables.schoolId],
      });
      queryClient.invalidateQueries({ queryKey: ["academic-structure"] });
    },
  });

  const deleteSchool = useMutation({
    mutationFn: async (schoolId: string) => {
      const response = await fetch(`/api/schools/${schoolId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete school");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["academic-structure"] });
    },
  });

  const updateFaculty = useMutation({
    mutationFn: async ({
      facultyId,
      data,
    }: {
      facultyId: string;
      data: any;
    }) => {
      const response = await fetch(`/api/faculties/${facultyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update faculty");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-structure"] });
      queryClient.invalidateQueries({ queryKey: ["faculty-details"] });
    },
  });

  const deleteFaculty = useMutation({
    mutationFn: async (facultyId: string) => {
      const response = await fetch(`/api/faculties/${facultyId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete faculty");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-structure"] });
    },
  });

  return {
    updateSchool,
    deleteSchool,
    updateFaculty,
    deleteFaculty,
  };
}

// Performance monitoring hook
export function useProfilePerformance() {
  const queryClient = useQueryClient();

  const getQueryStats = useCallback(() => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();

    return {
      totalQueries: queries.length,
      staleQueries: queries.filter((q) => q.isStale()).length,
      loadingQueries: queries.filter((q) => q.state.fetchStatus).length,
      errorQueries: queries.filter((q) => q.state.error).length,
      cacheSize: queries.reduce(
        (size, q) => size + JSON.stringify(q.state.data || "").length,
        0
      ),
    };
  }, [queryClient]);

  const clearStaleQueries = useCallback(() => {
    queryClient.removeQueries({
      predicate: (query) => query.isStale(),
    });
  }, [queryClient]);

  return {
    getQueryStats,
    clearStaleQueries,
  };
}
