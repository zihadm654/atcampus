// Unified skill configuration dataset - Single source of truth for all skill-related data

export interface SkillOption {
  value: string;
  label: string;
  category: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  skills: SkillOption[];
}

// Hierarchical skill categories with skills
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "programming-tech",
    name: "Programming & Tech",
    description: "Software development, coding, and technical skills",
    skills: [
      {
        value: "javascript",
        label: "JavaScript",
        category: "programming-tech",
      },
      {
        value: "typescript",
        label: "TypeScript",
        category: "programming-tech",
      },
      { value: "python", label: "Python", category: "programming-tech" },
      { value: "java", label: "Java", category: "programming-tech" },
      { value: "csharp", label: "C#", category: "programming-tech" },
      { value: "golang", label: "Go", category: "programming-tech" },
      { value: "rust", label: "Rust", category: "programming-tech" },
      { value: "php", label: "PHP", category: "programming-tech" },
      { value: "ruby", label: "Ruby", category: "programming-tech" },
      { value: "swift", label: "Swift", category: "programming-tech" },
      { value: "kotlin", label: "Kotlin", category: "programming-tech" },
      { value: "react", label: "React", category: "programming-tech" },
      { value: "vue", label: "Vue.js", category: "programming-tech" },
      { value: "angular", label: "Angular", category: "programming-tech" },
      { value: "nextjs", label: "Next.js", category: "programming-tech" },
      { value: "nodejs", label: "Node.js", category: "programming-tech" },
      { value: "express", label: "Express", category: "programming-tech" },
      { value: "nestjs", label: "NestJS", category: "programming-tech" },
      { value: "django", label: "Django", category: "programming-tech" },
      { value: "flask", label: "Flask", category: "programming-tech" },
      { value: "spring", label: "Spring", category: "programming-tech" },
      { value: "laravel", label: "Laravel", category: "programming-tech" },
      {
        value: "ruby-on-rails",
        label: "Ruby on Rails",
        category: "programming-tech",
      },
      { value: "mongodb", label: "MongoDB", category: "programming-tech" },
      {
        value: "postgresql",
        label: "PostgreSQL",
        category: "programming-tech",
      },
      { value: "mysql", label: "MySQL", category: "programming-tech" },
      { value: "redis", label: "Redis", category: "programming-tech" },
      { value: "docker", label: "Docker", category: "programming-tech" },
      {
        value: "kubernetes",
        label: "Kubernetes",
        category: "programming-tech",
      },
      { value: "aws", label: "AWS", category: "programming-tech" },
      { value: "azure", label: "Azure", category: "programming-tech" },
      { value: "gcp", label: "Google Cloud", category: "programming-tech" },
      { value: "terraform", label: "Terraform", category: "programming-tech" },
      { value: "git", label: "Git", category: "programming-tech" },
      { value: "github", label: "GitHub", category: "programming-tech" },
      { value: "gitlab", label: "GitLab", category: "programming-tech" },
    ],
  },
  {
    id: "design-creative",
    name: "Design & Creative",
    description: "Visual design, creative arts, and multimedia skills",
    skills: [
      {
        value: "ui-ux-design",
        label: "UI/UX Design",
        category: "design-creative",
      },
      {
        value: "graphic-design",
        label: "Graphic Design",
        category: "design-creative",
      },
      {
        value: "illustration",
        label: "Illustration",
        category: "design-creative",
      },
      {
        value: "logo-design",
        label: "Logo Design",
        category: "design-creative",
      },
      { value: "web-design", label: "Web Design", category: "design-creative" },
      {
        value: "product-design",
        label: "Product Design",
        category: "design-creative",
      },
      { value: "branding", label: "Branding", category: "design-creative" },
      { value: "figma", label: "Figma", category: "design-creative" },
      {
        value: "adobe-creative-suite",
        label: "Adobe Creative Suite",
        category: "design-creative",
      },
      { value: "photoshop", label: "Photoshop", category: "design-creative" },
      {
        value: "illustrator",
        label: "Illustrator",
        category: "design-creative",
      },
      { value: "indesign", label: "InDesign", category: "design-creative" },
      {
        value: "after-effects",
        label: "After Effects",
        category: "design-creative",
      },
      {
        value: "premiere-pro",
        label: "Premiere Pro",
        category: "design-creative",
      },
      {
        value: "3d-modeling",
        label: "3D Modeling",
        category: "design-creative",
      },
      { value: "animation", label: "Animation", category: "design-creative" },
      {
        value: "motion-graphics",
        label: "Motion Graphics",
        category: "design-creative",
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing & Business",
    description: "Digital marketing, business strategy, and sales skills",
    skills: [
      {
        value: "digital-marketing",
        label: "Digital Marketing",
        category: "marketing",
      },
      {
        value: "social-media-marketing",
        label: "Social Media Marketing",
        category: "marketing",
      },
      { value: "seo", label: "SEO", category: "marketing" },
      { value: "sem", label: "SEM", category: "marketing" },
      {
        value: "content-marketing",
        label: "Content Marketing",
        category: "marketing",
      },
      {
        value: "email-marketing",
        label: "Email Marketing",
        category: "marketing",
      },
      { value: "copywriting", label: "Copywriting", category: "marketing" },
      {
        value: "brand-marketing",
        label: "Brand Marketing",
        category: "marketing",
      },
      {
        value: "market-research",
        label: "Market Research",
        category: "marketing",
      },
      {
        value: "google-analytics",
        label: "Google Analytics",
        category: "marketing",
      },
      { value: "facebook-ads", label: "Facebook Ads", category: "marketing" },
      { value: "google-ads", label: "Google Ads", category: "marketing" },
      { value: "linkedin-ads", label: "LinkedIn Ads", category: "marketing" },
      { value: "sales", label: "Sales", category: "marketing" },
      {
        value: "business-strategy",
        label: "Business Strategy",
        category: "marketing",
      },
      {
        value: "project-management",
        label: "Project Management",
        category: "marketing",
      },
      {
        value: "product-management",
        label: "Product Management",
        category: "marketing",
      },
      {
        value: "customer-service",
        label: "Customer Service",
        category: "marketing",
      },
    ],
  },
  {
    id: "writing",
    name: "Writing & Translation",
    description: "Content creation, writing, and translation skills",
    skills: [
      {
        value: "content-writing",
        label: "Content Writing",
        category: "writing",
      },
      {
        value: "technical-writing",
        label: "Technical Writing",
        category: "writing",
      },
      { value: "copywriting", label: "Copywriting", category: "writing" },
      { value: "blog-writing", label: "Blog Writing", category: "writing" },
      {
        value: "creative-writing",
        label: "Creative Writing",
        category: "writing",
      },
      {
        value: "academic-writing",
        label: "Academic Writing",
        category: "writing",
      },
      { value: "translation", label: "Translation", category: "writing" },
      { value: "proofreading", label: "Proofreading", category: "writing" },
      { value: "editing", label: "Editing", category: "writing" },
      { value: "ghostwriting", label: "Ghostwriting", category: "writing" },
    ],
  },
  {
    id: "data-science",
    name: "Data Science & Analytics",
    description: "Data analysis, machine learning, and business intelligence",
    skills: [
      {
        value: "data-analysis",
        label: "Data Analysis",
        category: "data-science",
      },
      {
        value: "data-science",
        label: "Data Science",
        category: "data-science",
      },
      {
        value: "machine-learning",
        label: "Machine Learning",
        category: "data-science",
      },
      {
        value: "deep-learning",
        label: "Deep Learning",
        category: "data-science",
      },
      {
        value: "python-data-science",
        label: "Python for Data Science",
        category: "data-science",
      },
      {
        value: "r-programming",
        label: "R Programming",
        category: "data-science",
      },
      { value: "sql", label: "SQL", category: "data-science" },
      { value: "tableau", label: "Tableau", category: "data-science" },
      { value: "power-bi", label: "Power BI", category: "data-science" },
      { value: "excel", label: "Excel", category: "data-science" },
      { value: "statistics", label: "Statistics", category: "data-science" },
      { value: "pandas", label: "Pandas", category: "data-science" },
      { value: "numpy", label: "NumPy", category: "data-science" },
      {
        value: "scikit-learn",
        label: "Scikit-learn",
        category: "data-science",
      },
      { value: "tensorflow", label: "TensorFlow", category: "data-science" },
      { value: "pytorch", label: "PyTorch", category: "data-science" },
    ],
  },
  {
    id: "business",
    name: "Business & Finance",
    description: "Business operations, finance, and entrepreneurship skills",
    skills: [
      {
        value: "financial-analysis",
        label: "Financial Analysis",
        category: "business",
      },
      { value: "accounting", label: "Accounting", category: "business" },
      {
        value: "investment-banking",
        label: "Investment Banking",
        category: "business",
      },
      {
        value: "corporate-finance",
        label: "Corporate Finance",
        category: "business",
      },
      {
        value: "business-analysis",
        label: "Business Analysis",
        category: "business",
      },
      {
        value: "business-strategy",
        label: "Business Strategy",
        category: "business",
      },
      {
        value: "entrepreneurship",
        label: "Entrepreneurship",
        category: "business",
      },
      { value: "consulting", label: "Consulting", category: "business" },
      {
        value: "operations-management",
        label: "Operations Management",
        category: "business",
      },
      {
        value: "supply-chain",
        label: "Supply Chain Management",
        category: "business",
      },
      { value: "hr-management", label: "HR Management", category: "business" },
    ],
  },
];

// Flat list of all skills for search functionality
export const ALL_SKILLS: SkillOption[] = SKILL_CATEGORIES.flatMap(
  (category) => category.skills
);

// Get skills by category
export const getSkillsByCategory = (categoryId: string): SkillOption[] => {
  const category = SKILL_CATEGORIES.find((cat) => cat.id === categoryId);
  return category ? category.skills : [];
};

// Search skills by query
export const searchSkills = (query: string): SkillOption[] => {
  if (!query) return ALL_SKILLS;

  const normalizedQuery = query.toLowerCase().trim();
  return ALL_SKILLS.filter(
    (skill) =>
      skill.label.toLowerCase().includes(normalizedQuery) ||
      skill.value.toLowerCase().includes(normalizedQuery)
  );
};

// Get category by skill value
export const getCategoryBySkill = (
  skillValue: string
): SkillCategory | undefined =>
  SKILL_CATEGORIES.find((category) =>
    category.skills.some((skill) => skill.value === skillValue)
  );
