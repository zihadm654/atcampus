# Skills Feature Usage Examples

This document provides examples of how to use the implemented skills feature.

## 1. Creating a Course with Associated Skills

```typescript
// Create a new course
const course = await prisma.course.create({
  data: {
    code: "CS101",
    title: "Introduction to Computer Science",
    description: "Fundamental concepts of computer science",
    facultyId: "faculty-id-here",
    schoolId: "school-id-here",
    instructorId: "instructor-id-here",
    objectives: "Learn programming basics",
    credits: 3,
  }
});

// Create skills that students can gain from this course
const programmingSkill = await prisma.skill.create({
  data: {
    name: "Programming",
    category: "Technical"
  }
});

const problemSolvingSkill = await prisma.skill.create({
  data: {
    name: "Problem Solving",
    category: "Cognitive"
  }
});

// Link skills to the course
await prisma.courseSkill.createMany({
  data: [
    {
      courseId: course.id,
      skillId: programmingSkill.id
    },
    {
      courseId: course.id,
      skillId: problemSolvingSkill.id
    }
  ]
});
```

## 2. Creating a Job with Required Skills

```typescript
// Create a new job
const job = await prisma.job.create({
  data: {
    userId: "employer-id-here",
    title: "Junior Software Developer",
    description: "Entry-level software development position",
    salary: 60000,
    location: "New York, NY",
    type: "FULL_TIME",
    experienceLevel: "ENTRY_LEVEL",
    endDate: new Date("2024-12-31")
  }
});

// Link required skills to the job
await prisma.jobSkill.createMany({
  data: [
    {
      jobId: job.id,
      skillId: programmingSkill.id
    },
    {
      jobId: job.id,
      skillId: problemSolvingSkill.id
    }
  ]
});
```

## 3. Student Acquiring Skills

```typescript
// Student acquires skills (e.g., by completing courses)
const student = await prisma.user.findUnique({
  where: { id: "student-id-here" }
});

// Create user skills for the student
await prisma.userSkill.createMany({
  data: [
    {
      userId: student.id,
      skillId: programmingSkill.id,
      title: "Programming",
      level: "INTERMEDIATE",
      yearsOfExperience: 2
    },
    {
      userId: student.id,
      skillId: problemSolvingSkill.id,
      title: "Problem Solving",
      level: "BEGINNER",
      yearsOfExperience: 1
    }
  ]
});
```

## 4. Calculating Student-Job Match

```typescript
// Calculate match between student and job
async function calculateStudentJobMatch(studentId: string, jobId: string) {
  // Get required skills for the job
  const jobSkills = await prisma.jobSkill.findMany({
    where: { jobId },
    include: { skill: true }
  });

  // Get student's skills
  const studentSkills = await prisma.userSkill.findMany({
    where: { userId: studentId },
    include: { skill: true }
  });

  // Calculate match
  const requiredSkills = jobSkills.length;
  const matchedSkills = studentSkills.filter(studentSkill => 
    jobSkills.some(jobSkill => jobSkill.skillId === studentSkill.skillId)
  ).length;

  const matchPercentage = requiredSkills > 0 ? (matchedSkills / requiredSkills) * 100 : 0;

  // Create or update the match record
  const match = await prisma.studentJobMatch.upsert({
    where: {
      studentId_jobId: {
        studentId,
        jobId
      }
    },
    update: {
      totalRequiredSkills: requiredSkills,
      matchedSkills,
      matchPercentage
    },
    create: {
      studentId,
      jobId,
      totalRequiredSkills: requiredSkills,
      matchedSkills,
      matchPercentage
    }
  });

  return match;
}

// Usage
const match = await calculateStudentJobMatch("student-id-here", "job-id-here");
console.log(`Match percentage: ${match.matchPercentage}%`);
```

## 5. Finding Jobs That Match a Student's Skills

```typescript
// Find jobs that match a student's skills above a certain threshold
async function findMatchingJobs(studentId: string, minMatchPercentage: number = 50) {
  // Get student's skills
  const studentSkills = await prisma.userSkill.findMany({
    where: { userId: studentId }
  });

  const studentSkillIds = studentSkills.map(skill => skill.skillId);

  // Find jobs that require any of the student's skills
  const jobSkills = await prisma.jobSkill.findMany({
    where: {
      skillId: {
        in: studentSkillIds
      }
    },
    include: {
      job: {
        include: {
          studentJobMatches: {
            where: { studentId }
          }
        }
      }
    }
  });

  // Filter jobs with match percentage above threshold
  const matchingJobs = jobSkills
    .map(js => js.job)
    .filter(job => {
      const match = job.studentJobMatches[0];
      return match && match.matchPercentage >= minMatchPercentage;
    });

  return matchingJobs;
}

// Usage
const matchingJobs = await findMatchingJobs("student-id-here", 70);
console.log(`Found ${matchingJobs.length} jobs with 70%+ match`);
```

## 6. Finding Students That Match a Job's Requirements

```typescript
// Find students that match a job's requirements
async function findMatchingStudents(jobId: string, minMatchPercentage: number = 50) {
  // Get job's required skills
  const jobSkills = await prisma.jobSkill.findMany({
    where: { jobId }
  });

  const requiredSkillIds = jobSkills.map(skill => skill.skillId);

  // Find users who have any of the required skills
  const userSkills = await prisma.userSkill.findMany({
    where: {
      skillId: {
        in: requiredSkillIds
      }
    },
    include: {
      user: {
        include: {
          studentJobMatches: {
            where: { jobId }
          }
        }
      }
    }
  });

  // Filter users with match percentage above threshold
  const matchingStudents = userSkills
    .map(us => us.user)
    .filter((user, index, self) => 
      // Remove duplicates
      index === self.findIndex(u => u.id === user.id)
    )
    .filter(user => {
      const match = user.studentJobMatches[0];
      return match && match.matchPercentage >= minMatchPercentage;
    });

  return matchingStudents;
}

// Usage
const matchingStudents = await findMatchingStudents("job-id-here", 80);
console.log(`Found ${matchingStudents.length} students with 80%+ match`);
```

These examples demonstrate how to use the implemented skills feature to:
1. Associate skills with courses
2. Specify required skills for jobs
3. Track skills acquired by students
4. Calculate match percentages between students and jobs
5. Find matching jobs for students
6. Find matching students for jobs