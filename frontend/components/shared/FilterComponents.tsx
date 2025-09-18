"use client";

import { useState, useTransition } from "react";
import { Search, Filter, X, RotateCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Base types for filters
export interface BaseFilterState {
  searchQuery: string;
}

// Props for the search input component
interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  isPending?: boolean;
}

// Props for filter badges
interface FilterBadgeProps {
  label: string;
  value: string;
  onRemove: () => void;
}

// Props for the filter section
interface FilterSectionProps {
  title: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
  type?: "single" | "multiple";
}

// Props for the main filter container
interface FilterContainerProps<T extends BaseFilterState> {
  filters: T;
  onFiltersChange: (filters: T) => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

// Search Input Component
export function FilterSearchInput({
  placeholder = "Search...",
  value,
  onChange,
  isPending = false,
}: SearchInputProps) {
  const [isPendingTransition, startTransition] = useTransition();

  const handleSearch = (newValue: string) => {
    startTransition(() => {
      onChange(newValue);
    });
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
        disabled={isPending || isPendingTransition}
      />
    </div>
  );
}

// Filter Badge Component
export function ActiveFilterBadge({
  label,
  value,
  onRemove,
}: FilterBadgeProps) {
  return (
    <Badge variant="secondary" className="text-xs">
      {label}: {value}
      <X
        className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
        onClick={onRemove}
      />
    </Badge>
  );
}

// Filter Section Component
export function FilterSection({
  title,
  options,
  selected,
  onToggle,
  type = "multiple",
}: FilterSectionProps) {
  const handleToggle = (value: string) => {
    if (type === "single") {
      onToggle(selected.includes(value) ? "" : value);
    } else {
      onToggle(value);
    }
  };

  return (
    <div className="space-y-2 p-1">
      <label className="text-xs font-medium text-muted-foreground">
        {title}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Badge
            key={option.value}
            variant={selected.includes(option.value) ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => handleToggle(option.value)}
          >
            {option.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Filter Container Component
export function FilterContainer<T extends BaseFilterState>({
  filters,
  onFiltersChange,
  children,
  className = "",
  title = "Filters",
}: FilterContainerProps<T>) {
  const [isPending, startTransition] = useTransition();
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== "" && value !== null && value !== undefined;
  });

  const clearFilters = () => {
    startTransition(() => {
      const clearedFilters = Object.keys(filters).reduce((acc, key) => {
        const defaultValue = Array.isArray(filters[key as keyof T]) ? [] : "";
        acc[key as keyof T] = defaultValue as T[keyof T];
        return acc;
      }, {} as T);

      onFiltersChange(clearedFilters);
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, value) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return count + (value ? 1 : 0);
    }, 0);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{title}</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
            disabled={isPending}
          >
            {isPending ? (
              <RotateCw className="h-3 w-3 animate-spin" />
            ) : (
              "Clear all"
            )}
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <Card className="border shadow-sm">
        <CardContent className="p-0 space-y-1">{children}</CardContent>
      </Card>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <>
          <Separator className="my-2" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0))
                return null;

              const label = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());

              return Array.isArray(value) ? (
                value.map((v, index) => (
                  <ActiveFilterBadge
                    key={`${key}-${v}-${index}`}
                    label={label}
                    value={String(v)}
                    onRemove={() =>
                      onFiltersChange({
                        ...filters,
                        [key]: value.filter((item) => item !== v),
                      })
                    }
                  />
                ))
              ) : (
                <ActiveFilterBadge
                  key={key}
                  label={label}
                  value={String(value)}
                  onRemove={() =>
                    onFiltersChange({
                      ...filters,
                      [key]: "",
                    })
                  }
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Hook for optimistic filter updates
export function useOptimisticFilters<T extends BaseFilterState>(
  initialState: T,
  onChange: (filters: T) => void
) {
  const [isPending, startTransition] = useTransition();

  const updateFilters = (updater: (prev: T) => T) => {
    startTransition(() => {
      onChange(updater(initialState));
    });
  };

  return {
    isPending,
    updateFilters,
    startTransition,
  };
}

// Loading skeleton for filters
export function FilterLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
      <div className="space-y-2">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-12 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
