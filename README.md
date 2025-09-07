# SkillMatch - Intelligent Job Matching Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57.0-green.svg)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.6-cyan.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

SkillMatch is a modern, full-stack job matching platform that connects talented job seekers with employers through intelligent skill-based matching. Built with React, Supabase, and modern web technologies, it provides a seamless experience for both job seekers and employers.

### Key Features

- Intelligent Job Matching: Advanced skill-based job recommendations
- Dual User Roles: Separate experiences for job seekers and employers
- OAuth Authentication: Google, GitHub, and LinkedIn integration
- Progressive Web App: Mobile-optimized with offline capabilities
- Application Tracking: Complete application lifecycle management
- Company Profiles: Detailed company information and branding
- Analytics Dashboard: Insights for employers and job seekers
- Real-time Messaging: Direct communication between parties
- Auto-save: Persistent form data and draft management

## Technical Architecture

### Frontend Stack
- React 18.2.0 - Modern React with hooks and concurrent features
- Vite 5.0.0 - Lightning-fast build tool and dev server
- TailwindCSS 3.4.6 - Utility-first CSS framework
- React Router 6.0.2 - Client-side routing with protected routes
- Framer Motion 10.16.4 - Smooth animations and transitions
- Lucide React - Beautiful, customizable icons

### Backend & Database
- Supabase - PostgreSQL database with real-time subscriptions
- Row Level Security (RLS) - Fine-grained access control
- Edge Functions - Serverless functions for complex operations
- Real-time Subscriptions - Live updates for messaging and notifications

### Authentication & Security
- Supabase Auth - Secure authentication with JWT tokens
- OAuth Providers: Google, GitHub, LinkedIn
- Role-based Access Control - Job seeker and employer permissions
- Email Verification - Secure account activation
- Account Deletion Protection - Prevents reuse of deleted emails

### Performance & Optimization
- Code Splitting - Lazy loading for optimal bundle sizes
- Image Optimization - WebP format with fallbacks
- PWA Features - Service worker for offline functionality
- Vercel Analytics - Performance monitoring and insights
- Error Boundaries - Graceful error handling

## Project Structure

```
skillmatch/
├── public/                     # Static assets
│   ├── assets/images/         # Image assets
│   ├── favicon-new.svg        # App favicon
│   └── _redirects            # Netlify redirects
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   ├── messaging/       # Chat and messaging
│   │   └── modals/          # Modal dialogs
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Authentication state
│   ├── hooks/               # Custom React hooks
│   │   ├── useJobs.js       # Job management
│   │   ├── useApplications.js # Application tracking
│   │   └── useFormValidation.js # Form utilities
│   ├── lib/                 # Core utilities
│   │   ├── supabase.js      # Database client & helpers
│   │   └── database.js      # Database operations
│   ├── pages/               # Route components
│   │   ├── Landing.jsx      # Homepage
│   │   ├── job-seeker-dashboard/ # Job seeker interface
│   │   ├── employer-dashboard/   # Employer interface
│   │   ├── auth/            # Authentication flows
│   │   └── profile/         # User profile management
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Root component
│   ├── Routes.jsx           # Route configuration
│   └── index.jsx            # Application entry point
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge functions
├── docs/                    # Documentation
│   ├── OAUTH_SETUP_GUIDE.md
│   ├── PWA_SETUP_GUIDE.md
│   └── DEPLOYMENT.md
└── package.json             # Dependencies and scripts
```

## Database Schema

### Core Tables

#### user_profiles
- Purpose: Extended user information beyond auth
- Key Fields: id, full_name, role, skills, work_experience, education
- Features: JSONB fields for flexible data, profile completion tracking

#### companies
- Purpose: Company profiles and branding
- Key Fields: id, name, logo_url, industry, size, description
- Features: SEO-friendly slugs, social media links

#### jobs
- Purpose: Job postings with rich metadata
- Key Fields: id, title, description, skills_required, salary_range
- Features: Full-text search, location filtering, remote work support

#### applications
- Purpose: Job application tracking
- Key Fields: id, user_id, job_id, status, cover_letter
- Features: Status workflow, file attachments, timestamps

#### saved_jobs
- Purpose: User job bookmarking
- Key Fields: user_id, job_id, created_at
- Features: Quick access to interesting positions

### Advanced Features

#### Row Level Security (RLS)
```sql
-- Users can only access their own profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Employers can view applications for their jobs
CREATE POLICY "Employers view applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.created_by = auth.uid()
    )
  );
```

#### Full-Text Search
```sql
-- Enable search across job titles and descriptions
CREATE INDEX jobs_search_idx ON jobs 
USING gin(to_tsvector('english', title || ' ' || description));
```

## Authentication Flow

### OAuth Integration
1. Provider Selection: Google, GitHub, or LinkedIn
2. Role Assignment: Query parameter determines user type
3. Profile Creation: Automatic profile generation with OAuth data
4. Race Condition Handling: Graceful duplicate profile prevention

### Session Management
- JWT Tokens: Secure, stateless authentication
- Refresh Tokens: Automatic session renewal
- Role-based Routing: Dynamic navigation based on user type
- Protected Routes: Authentication guards for sensitive pages

## UI/UX Design System

### Design Principles
- Mobile-First: Responsive design for all screen sizes
- Accessibility: WCAG 2.1 AA compliance
- Performance: Optimized for Core Web Vitals
- Consistency: Unified design language across features

### Component Architecture
```jsx
// Example: Reusable Button component with variants
<Button 
  variant="primary" 
  size="lg" 
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Apply Now
</Button>
```

### Theme System
- CSS Custom Properties: Dynamic theming support
- TailwindCSS Utilities: Consistent spacing and colors
- Dark Mode Ready: Prepared for theme switching
- Brand Colors: Professional blue and green palette

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- Supabase Account for database and authentication

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/skillmatch.git
cd skillmatch
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
```bash
cp .env.example .env
```

4. Configure environment variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Database Setup
```bash
# Run Supabase migrations
npx supabase db push

# Seed sample data (optional)
npx supabase db seed
```

6. Start development server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

### OAuth Configuration

Follow the detailed setup guides:
- [OAuth Setup Guide](OAUTH_SETUP_GUIDE.md)
- [PWA Setup Guide](PWA_SETUP_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)

## Progressive Web App Features

### Service Worker
- Offline Functionality: Core features work without internet
- Background Sync: Queue actions when offline
- Push Notifications: Job alerts and messages
- Update Notifications: Prompt for app updates

### Installation
- Add to Home Screen: Native app-like experience
- Splash Screen: Custom loading screen
- App Icons: Multiple sizes for different devices
- Manifest: Complete PWA configuration

## Development Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run test         # Run test suite
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage report

# Deployment
npm run build:vercel  # Vercel-optimized build
npm run build:netlify # Netlify-optimized build

# Database
npm run test:supabase # Test database connection
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build command
npm run build:netlify

# Publish directory
dist
```

### Environment Variables
Ensure these are set in your deployment platform:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Performance Metrics

### Core Web Vitals
- LCP: < 2.5s (Largest Contentful Paint)
- FID: < 100ms (First Input Delay)
- CLS: < 0.1 (Cumulative Layout Shift)

### Bundle Analysis
- Main Bundle: ~150KB gzipped
- Code Splitting: Route-based chunks
- Tree Shaking: Unused code elimination
- Image Optimization: WebP with fallbacks

## API Endpoints

### Authentication
```javascript
// Sign up with email/password
POST /auth/signup
{
  "email": "user@example.com",
  "password": "securepassword",
  "userData": { "role": "job_seeker" }
}

// OAuth sign in
POST /auth/oauth
{
  "provider": "google",
  "redirectTo": "/auth/callback?role=job-seeker"
}
```

### Jobs
```javascript
// Get jobs with filters
GET /api/jobs?location=remote&skills=react,node.js

// Create job posting
POST /api/jobs
{
  "title": "Senior Developer",
  "description": "...",
  "skills_required": ["React", "Node.js"],
  "salary_min": 80000,
  "salary_max": 120000
}
```

### Applications
```javascript
// Submit application
POST /api/applications
{
  "job_id": "uuid",
  "cover_letter": "...",
  "resume_url": "https://..."
}

// Update application status
PATCH /api/applications/:id
{
  "status": "interview_scheduled"
}
```

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

### Code Standards
- ESLint: Enforced code quality rules
- Prettier: Consistent code formatting
- Husky: Pre-commit hooks for quality checks
- Conventional Commits: Structured commit messages

### Testing
- Unit Tests: Component and utility testing
- Integration Tests: API and database testing
- E2E Tests: Full user journey testing
- Accessibility Tests: Screen reader compatibility

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Documentation
- [OAuth Setup Guide](OAUTH_SETUP_GUIDE.md)
- [PWA Setup Guide](PWA_SETUP_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Security Fixes Guide](SECURITY_FIXES_GUIDE.md)

### Getting Help
- GitHub Issues: Bug reports and feature requests
- Discussions: Community support and ideas
- Email: support@skillmatch.com

### Known Issues
- OAuth callback race conditions (fixed in v0.1.0)
- Profile creation duplicate key errors (resolved)
- PWA installation on iOS Safari (browser limitation)

---

Built with by the SkillMatch Team

Connecting talent with opportunity through intelligent matching
