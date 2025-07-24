# AtCampus Project Guide

## Project Overview

AtCampus is a professional networking and educational platform that combines elements of LinkedIn with academic-focused features. It's designed to connect students, professors, institutions, and organizations.

## Tech Stack

### Frontend

- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript
- **UI Components**:
  - Radix UI for accessible components
  - TailwindCSS for styling
  - Custom UI components in `/components/ui`
- **State Management**:
  - React Query (Tanstack Query) for server state
  - React Context for local state
- **Form Handling**:
  - React Hook Form
  - Zod for validation

### Backend

- **Database**: MongoDB with Prisma ORM
- **Authentication**: Better-Auth auth with session-based system
- **Email**: React Email with Nodemailer
- **File Upload**: UploadThing
- **Real-time Features**: Stream Chat

## Project Structure

```
/
├── actions/            # Server actions for Next.js
├── app/               # Next.js App Router pages
│   ├── (auth)/       # Authentication routes
│   ├── (marketing)/  # Public marketing pages
│   ├── (protected)/  # Protected app routes
│   └── api/          # API routes
├── components/        # React components
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   └── shared/       # Shared components
├── lib/              # Core utilities and configurations
├── prisma/           # Database schema and migrations
└── types/            # TypeScript type definitions
```

## Key Features

### Authentication System

- Email-based authentication
- Two-factor authentication support
- Session management
- Role-based access control (STUDENT, PROFESSOR, INSTITUTION, ORGANIZATION)

### Professional Networking

- User profiles with professional info
- Connection system
- Skills and endorsements
- Experience and education tracking
- Profile views tracking

### Content Management

- Posts with rich text editing
- Research papers sharing
- Job postings and applications
- Media attachments (images/videos)
- Comments and likes
- Bookmarking system

### Job Platform

- Job posting and management
- Application tracking
- Company profiles
- Skill requirements
- Location-based search

### Research Collaboration

- Research paper sharing
- Save and bookmark research
- Comments and discussions
- File attachments

## Database Schema Highlights

### User Management

- Comprehensive user profiles
- Professional information tracking
- Educational history
- Skill management
- Connection tracking

### Content Types

- Posts
- Research papers
- Jobs
- Company profiles
- Comments
- Media attachments

### Social Features

- Follows
- Likes
- Bookmarks
- Notifications
- Blocking system

### Analytics

- Profile views
- Job views
- Connection statistics
- Engagement metrics

## Development Guidelines

### API Structure

- Use server actions for form submissions
- API routes follow REST conventions
- Protected routes require authentication
- Proper error handling with custom exceptions

### Database Operations

- Always use Prisma Client for database operations
- Implement proper relations and cascading deletes
- Use transactions for complex operations
- Follow soft delete pattern for relevant models

### Security Considerations

- Input validation with Zod
- Role-based access control
- Session management
- Rate limiting on API routes
- Secure file uploads

### UI/UX Guidelines

- Follow accessible design patterns
- Use Radix UI for complex interactions
- Implement responsive design
- Follow consistent styling with TailwindCSS
- Use loading states and optimistic updates

## Common Tasks

### Adding New Features

1. Update Prisma schema if needed
2. Create new components in appropriate directories
3. Add server actions if required
4. Update API routes
5. Add proper types
6. Implement UI components
7. Add tests if necessary

### Database Changes

1. Modify `schema.prisma`
2. Run `prisma generate`
3. Update affected components and API routes
4. Test relations and cascading effects

### Authentication Updates

1. Modify auth actions in `/actions`
2. Update session handling if needed
3. Test with different user roles
4. Verify security implications

## Best Practices

1. **Type Safety**

   - Use TypeScript strictly
   - Define interfaces and types in `/types`
   - Use Zod for runtime validation

2. **Performance**

   - Implement proper caching
   - Use React Query for data fetching
   - Optimize images and media
   - Implement pagination

3. **Security**

   - Validate all inputs
   - Implement proper access control
   - Handle sensitive data carefully
   - Use secure sessions

4. **Code Organization**

   - Follow component hierarchy
   - Keep components focused and reusable
   - Use proper naming conventions
   - Document complex logic

5. **State Management**
   - Use React Query for server state
   - Keep local state minimal
   - Implement proper loading states
   - Handle errors gracefully
