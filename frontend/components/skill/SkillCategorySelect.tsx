"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Hierarchical skill categories inspired by Fiverr structure
type Subcategory = { value: string; label: string };
type Category = { label: string; subcategories: Subcategory[] };

const skillCategories: Category[] = [
  {
    label: "Graphics & Design",
    subcategories: [
      { value: "logo-design", label: "Logo Design" },
      { value: "illustration", label: "Illustration" },
      { value: "web-design", label: "Web Design" },
      { value: "product-packaging", label: "Product Packaging" },
    ],
  },
  {
    label: "Digital Marketing",
    subcategories: [
      { value: "social-media-marketing", label: "Social Media Marketing" },
      { value: "seo", label: "SEO" },
      { value: "content-marketing", label: "Content Marketing" },
      { value: "email-marketing", label: "Email Marketing" },
    ],
  },
  {
    label: "Writing & Translation",
    subcategories: [
      { value: "articles-blog-posts", label: "Articles & Blog Posts" },
      { value: "copywriting", label: "Copywriting" },
      { value: "translation", label: "Translation" },
      { value: "proofreading-editing", label: "Proofreading & Editing" },
    ],
  },
  {
    label: "Video & Animation",
    subcategories: [
      { value: "animated-explainers", label: "Animated Explainers" },
      { value: "logo-animation", label: "Logo Animation" },
      { value: "video-editing", label: "Video Editing" },
      { value: "visual-effects", label: "Visual Effects" },
    ],
  },
  {
    label: "Music & Audio",
    subcategories: [
      { value: "voice-over", label: "Voice Over" },
      { value: "music-production", label: "Music Production" },
      { value: "sound-design", label: "Sound Design" },
      { value: "songwriting", label: "Songwriting" },
    ],
  },
  {
    label: "Programming & Tech",
    subcategories: [
      { value: "web-programming", label: "Web Programming" },
      { value: "mobile-apps", label: "Mobile Apps" },
      { value: "wordpress", label: "WordPress" },
      { value: "data-analysis", label: "Data Analysis" },
    ],
  },
  {
    label: "Business",
    subcategories: [
      { value: "virtual-assistant", label: "Virtual Assistant" },
      { value: "market-research", label: "Market Research" },
      { value: "business-plans", label: "Business Plans" },
      { value: "project-management", label: "Project Management" },
    ],
  },
  {
    label: "Lifestyle",
    subcategories: [
      { value: "online-tutoring", label: "Online Tutoring" },
      { value: "gaming", label: "Gaming" },
      { value: "astrology-tarot", label: "Astrology & Tarot" },
      { value: "fitness-lessons", label: "Fitness Lessons" },
    ],
  },
];

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
      for (const category of skillCategories) {
        const sub = category.subcategories.find((s) => s.value === value);
        if (sub) {
          setSelectedCategory(category.label);
          setSelectedSkill(sub.value);
          break;
        }
      }
    }
  }, [value]);

  const handleCategoryChange = (categoryLabel: string) => {
    setSelectedCategory(categoryLabel);
    setSelectedSkill("");
    onChange(""); // Reset if category changes
  };

  const handleSkillChange = (skillValue: string) => {
    setSelectedSkill(skillValue);
    onChange(skillValue);
  };

  const currentSubcategories =
    skillCategories.find((cat) => cat.label === selectedCategory)
      ?.subcategories || [];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="category">Select Category: </label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="-- Select a Category --" />
          </SelectTrigger>
          <SelectContent>
            {skillCategories.map((category) => (
              <SelectItem key={category.label} value={category.label}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory && (
        <div>
          <label htmlFor="skill">Select Skill: </label>
          <Select value={selectedSkill} onValueChange={handleSkillChange}>
            <SelectTrigger id="skill">
              <SelectValue placeholder="-- Select a Skill --" />
            </SelectTrigger>
            <SelectContent>
              {currentSubcategories.map((sub) => (
                <SelectItem key={sub.value} value={sub.value}>
                  {sub.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
