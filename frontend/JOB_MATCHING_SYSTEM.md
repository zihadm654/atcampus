# Job Matching System Implementation

## Overview
This document describes the implementation of a job matching system that calculates match percentages for students based on two criteria:
1. Skills - comparing job required skills with student's acquired skills
2. Courses - comparing job required courses with student's enrolled courses

## Implementation Details

### 1. Database Schema Changes
The `StudentJobMatch` model in `prisma/schema.prisma` has been updated with new fields:
- `totalRequiredCourses`: Number of courses required for the job
- `matchedCourses`: Number of courses the student has completed
- `skillMatchPercentage`: Percentage match for skills
- `courseMatchPercentage`: Percentage match for courses
- `matchPercentage`: Overall weighted match percentage
- `matchedCourseIds`: Array of course IDs that match
- `missingCourseIds`: Array of course IDs that are missing

### 2. API Endpoint
The `/api/job-matches` endpoint has been updated to calculate both skill and course matches:
- Fetches job details including required skills and courses
- Fetches student skills and enrolled courses
- Calculates individual match percentages for skills and courses
- Computes overall match percentage using a weighted average (70% skills, 30% courses)
- Stores the results in the database

### 3. Frontend Component
The `Job` component displays the match information:
- Shows overall match percentage
- Displays individual skill and course match percentages
- Uses color coding based on match quality (green for high matches, red for low matches)

## Running the Migration

To apply the schema changes to your database, run the following commands:

```bash
cd frontend
npx prisma migrate dev --name job_matching_system
npx prisma generate
```

## Usage

The job matching system automatically calculates matches when a student views a job posting. The results are cached in the database for performance.

## Customization

The weighting of skills vs courses can be adjusted in the `calculateAndStoreMatch` function in `/api/job-matches/route.ts` by modifying this line:

```typescript
const matchPercentage = (skillMatchPercentage * 0.7) + (courseMatchPercentage * 0.3);
```

Where 0.7 and 0.3 are the weights for skills and courses respectively.