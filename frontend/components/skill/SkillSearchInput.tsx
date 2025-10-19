"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
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
import { cn } from "@/lib/utils";

// This will be replaced with actual data from the backend
const skills = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "golang", label: "Golang" },
  { value: "nodejs", label: "Node.js" },
  { value: "express", label: "Express" },
  { value: "mongodb", label: "MongoDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "GCP" },
  { value: "figma", label: "Figma" },
  { value: "photoshop", label: "Photoshop" },
  { value: "illustrator", label: "Illustrator" },
];

interface SkillSearchInputProps {
  onChange: (value: string) => void;
  defaultValue?: string;
}

export function SkillSearchInput({
  onChange,
  defaultValue,
}: SkillSearchInputProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue || "");

  React.useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-[200px] justify-between"
          role="combobox"
          variant="outline"
        >
          {value
            ? skills.find((skill) => skill.value === value)?.label
            : "Search skill..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search skill..." />
          <CommandEmpty>No skill found.</CommandEmpty>
          <CommandGroup>
            {skills.map((skill) => (
              <CommandItem
                key={skill.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
                value={skill.value}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === skill.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {skill.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
