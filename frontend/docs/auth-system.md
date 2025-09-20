# Authentication System Documentation

## Overview

This document describes the comprehensive authentication system implemented in the ATCampus platform. The system is built on top of Better Auth with custom extensions for role-based access control, organization management, and user status workflows.

## User Roles

The system supports the following user roles:

1. **STUDENT** - Regular student users
2. **PROFESSOR** - Academic staff with course management capabilities
3. **INSTITUTION** - Educational institutions that can create organizations
4. **ORGANIZATION** - General organizations that can create organizations
5. **ADMIN** - System administrators with full access

## User Status

Users can have the following statuses:

1. **PENDING** - User registration is pending approval (for institutions/organizations)
2. **ACTIVE** - User is active and can access the system
3. **REJECTED** - User registration has been rejected
4. **SUSPENDED** - User access has been temporarily suspended

## Registration Workflow

### Student and Professor Registration
1. User signs up with email, password, and role
2. Email verification is sent
3. Upon verification, user is automatically activated
4. Students and professors have immediate access

### Institution and Organization Registration
1. User signs up with email, password, and role
2. Email verification is sent
3. Upon verification, user status remains PENDING
4. Admin must approve the user to set status to ACTIVE
5. Upon approval, an organization is automatically created for the user

## Organization Management

### Creating Organizations
- Only INSTITUTION and ORGANIZATION users can create organizations
- Organizations are automatically created for approved institution/organization users

### Inviting Members
- Organization owners and admins can invite members
- Invitations are sent via email with a 7-day expiration
- Users can accept invitations to join organizations

### Member Roles
- **owner** - Full control over the organization
- **admin** - Administrative privileges
- **member** - Standard member privileges

## Authentication Features

### Email/Password Authentication
- Secure password hashing with Argon2
- Minimum 8-character password requirement
- Email verification required for all users

### Social Authentication
- Google OAuth integration
- Account linking capabilities

### Two-Factor Authentication
- Optional TOTP-based 2FA
- Backup codes for recovery

### Session Management
- Session expiration after 7 days
- Maximum 3 concurrent sessions per user
- Session refresh after 24 hours

## API Security

### Role-Based Access Control
- Permissions defined per role
- Access control enforced at API level
- Admin-only endpoints for sensitive operations

### Rate Limiting
- Request rate limiting to prevent abuse
- IP-based throttling for authentication endpoints

## Implementation Details

### Auth Configuration
The authentication system is configured in `lib/auth.ts` with the following key components:

1. **Database Adapter** - Prisma adapter for MongoDB
2. **Email Verification** - Custom email templates with 24-hour expiration
3. **Password Management** - Argon2 hashing with minimum length requirements
4. **Hooks** - Pre and post-processing hooks for registration and login
5. **Plugins** - Organization, admin, multi-session, 2FA, and magic link plugins

### User Types
Extended user types are defined in `types/auth-types.ts` with proper TypeScript interfaces for:
- Role and status enums
- Type guards for role/status checking
- Permission utilities

### Server Actions
Key server actions are implemented in:
- `actions/sign-up-email.action.ts` - User registration
- `actions/update-user-role.action.ts` - Role/status management
- `actions/organizations.ts` - Organization and invitation management

### Utilities
Helper functions are available in:
- `lib/permissions.ts` - Role-based permission system
- `lib/organization-invitations.ts` - Invitation management
- `lib/user-registration.ts` - Post-registration workflows
- `lib/session.ts` - Session and permission utilities

## Security Considerations

1. **Password Security** - Argon2 hashing with secure parameters
2. **Session Security** - Secure cookies with appropriate flags
3. **Rate Limiting** - Protection against brute force attacks
4. **Email Verification** - Prevention of fake accounts
5. **Role Validation** - Server-side validation of user roles
6. **Admin Protection** - Special handling for admin accounts

## Extending the System

To add new roles:
1. Update the `UserRole` enum in the Prisma schema
2. Add role to the valid roles list in `lib/auth.ts`
3. Define permissions in `lib/permissions.ts`
4. Update UI components to handle the new role

To modify the approval workflow:
1. Update the status handling in the auth hooks
2. Modify the approval actions in `actions/update-user-role.action.ts`
3. Update UI to reflect new workflow steps