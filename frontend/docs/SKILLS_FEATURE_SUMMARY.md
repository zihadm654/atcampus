# Skills Feature Implementation Summary

This document summarizes the implementation of the feature that establishes relationships between users, courses, jobs, and skills.

## Models Added

### 1. CourseSkill (Junction Model)
Represents the many-to-many relationship between Courses and UserSkills, indicating which skills can be gained by completing a course.

Fields:
- id: String (Primary key)
- courseId: String (Foreign key to Course)
- skillId: String (Foreign key to UserSkill)
- createdAt: DateTime
- updatedAt: DateTime

### 2. JobSkill (Junction Model)
Represents the many-to-many relationship between Jobs and UserSkills, indicating which skills are required for a job position.

Fields:
- id: String (Primary key)
- jobId: String (Foreign key to Job)
- skillId: String (Foreign key to UserSkill)
- createdAt: DateTime
- updatedAt: DateTime

### 3. StudentJobMatch (Matching Mechanism)
Tracks the compatibility between students and jobs based on skill matching.

Fields:
- id: String (Primary key)
- studentId: String (Foreign key to User)
- jobId: String (Foreign key to Job)
- totalRequiredSkills: Int (Total number of skills required for the job)
- matchedSkills: Int (Number of skills the student possesses)
- matchPercentage: Float (Percentage of skills matched)
- matchedSkillIds: String[] (IDs of matched skills)
- missingSkillIds: String[] (IDs of missing skills)
- createdAt: DateTime
- updatedAt: DateTime

## Model Modifications

### Course Model
Added relationship:
- courseSkills: CourseSkill[]

### UserSkill Model
Added relationships:
- courseSkills: CourseSkill[]
- jobSkills: JobSkill[]

### Job Model
Added relationships:
- jobSkills: JobSkill[]
- studentJobMatches: StudentJobMatch[]

### User Model
Added relationship:
- studentJobMatches: StudentJobMatch[]

## Implementation Details

1. **Student Skills**: Students acquire skills through the existing `userSkills` relationship in the User model.

2. **Course Competencies**: Courses define which skills students can gain through the CourseSkill junction model.

3. **Job Requirements**: Jobs specify required skills through the JobSkill junction model.

4. **Matching Mechanism**: The StudentJobMatch model tracks compatibility between students and jobs, calculating match percentages based on skill overlap.

This implementation enables:
- Tracking of skills acquired by students
- Defining competencies taught by courses
- Specifying skill requirements for job positions
- Calculating compatibility between students and jobs based on skills