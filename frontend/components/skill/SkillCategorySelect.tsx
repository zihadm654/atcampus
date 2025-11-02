"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SKILL_CATEGORIES } from "@/config/skills";

interface SkillCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export default function SkillCategorySelect({
  value,
  onChange,
}: SkillCategorySelectProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  useEffect(() => {
    if (value) {
      // Find the category that contains this skill
      for (const category of SKILL_CATEGORIES) {
        const sub = category.skills.find((s) => s.value === value);
        if (sub) {
          setSelectedCategory(category.id);
          setSelectedSkill(sub.value);
          break;
        }
      }
    }
  }, [value]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSkill("");
    onChange(""); // Reset if category changes
  };

  const handleSkillChange = (skillValue: string) => {
    setSelectedSkill(skillValue);
    onChange(skillValue);
  };

  const currentCategory = SKILL_CATEGORIES.find(
    (cat) => cat.id === selectedCategory
  );
  const currentSkills = currentCategory?.skills || [];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="category">Select Category: </label>
        <Select onValueChange={handleCategoryChange} value={selectedCategory}>
          <SelectTrigger id="category">
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
      </div>

      {selectedCategory && (
        <div>
          <label htmlFor="skill">Select Skill: </label>
          <Select onValueChange={handleSkillChange} value={selectedSkill}>
            <SelectTrigger id="skill">
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
    </div>
  );
}
