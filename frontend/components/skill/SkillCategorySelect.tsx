"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Common skill categories
const skillCategories = [
  { value: "programming", label: "Programming" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "business", label: "Business" },
  { value: "communication", label: "Communication" },
  { value: "leadership", label: "Leadership" },
  { value: "research", label: "Research" },
  { value: "teaching", label: "Teaching" },
  { value: "writing", label: "Writing" },
  { value: "languages", label: "Languages" },
  { value: "data_analysis", label: "Data Analysis" },
  { value: "project_management", label: "Project Management" },
  { value: "engineering", label: "Engineering" },
  { value: "science", label: "Science" },
  { value: "mathematics", label: "Mathematics" },
  { value: "arts", label: "Arts" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
];

interface SkillCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export default function SkillCategorySelect({
  value,
  onChange,
}: SkillCategorySelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? skillCategories.find((category) => category.value === value)?.label
            : "Select category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {skillCategories.map((category) => (
              <CommandItem
                key={category.value}
                value={category.value}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === category.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {category.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}