# Skill-Based Matching Feature Implementation

## Overview
This document describes the implementation of the skill-based matching feature that allows students to view their skill matches with jobs and enables organizations to create job postings with required skills.

## Key Components

### 1. Data Models
- **Job**: Represents a job posting with associated skills through the JobSkill relationship
- **UserSkill**: Represents a skill that a user has acquired
- **JobSkill**: Junction table linking jobs to required skills
- **StudentJobMatch**: Stores calculated match percentages between students and jobs

### 2. API Endpoints
- `/api/jobs/[jobId]/skills` - Get skills required for a specific job
- `/api/job-matches` - Calculate and retrieve skill match for a student-job pair
- `/api/skills` - Get all available skills or specific skills by IDs

### 3. Server Actions
- `updateJobSkills` - Update the skills required for a job
- `getJobMatch` - Calculate and retrieve skill match for a student-job pair

### 4. Frontend Components
- **JobSkills**: Display required skills for a job (student view)
- **JobMatchScore**: Show match percentage for a student-job pair
- **MissingSkills**: Display skills a student needs to improve their match
- **OrganizationJobSkills**: Display required skills for a job (organization view)

### 5. Forms
- **CreateJobForm**: Job creation form with skill selection for organizations

## User Roles

### Organization
- Can create job postings with required skills
- Can view job details including required skills
- Cannot view skill match percentages (only students can)

### Student
- Can view job postings with required skills
- Can see their skill match percentage with jobs
- Can see which skills they're missing for better matches

## Implementation Details

### Skill Selection
Organizations can select skills from a predefined list when creating or updating job postings. The skills are stored in the JobSkill junction table.

### Match Calculation
The match percentage is calculated by comparing the student's acquired skills (UserSkill) with the job's required skills (JobSkill):

```
Match Percentage = (Number of matched skills / Total required skills) * 100
```

### Caching
Match results are cached in the StudentJobMatch table to avoid recalculating for the same student-job pair.

## Future Improvements
1. Add skill endorsements to increase match accuracy
2. Implement skill progression tracking
3. Add course recommendations based on missing skills
4. Include skill proficiency levels in matching algorithm