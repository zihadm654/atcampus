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
import { ALL_SKILLS } from "@/config/skills";
import { cn } from "@/lib/utils";

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

  // Filter skills based on current value for better search experience
  const filteredSkills = React.useMemo(() => {
    if (!value) return ALL_SKILLS;

    const normalizedQuery = value.toLowerCase().trim();
    return ALL_SKILLS.filter(
      (skill) =>
        skill.label.toLowerCase().includes(normalizedQuery) ||
        skill.value.toLowerCase().includes(normalizedQuery)
    );
  }, [value]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between"
          role="combobox"
          variant="outline"
        >
          {value
            ? ALL_SKILLS.find((skill) => skill.value === value)?.label || value
            : "Search skill..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            onValueChange={(inputValue) => {
              setValue(inputValue);
            }}
            placeholder="Search skill..."
          />
          <CommandEmpty>No skill found.</CommandEmpty>
          <CommandGroup>
            {filteredSkills.map((skill) => (
              <CommandItem
                key={skill.value}
                onSelect={(currentValue) => {
                  setValue(currentValue);
                  setOpen(false);
                  onChange(currentValue);
                }}
                value={skill.label}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === skill.value || value === skill.label
                      ? "opacity-100"
                      : "opacity-0"
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
