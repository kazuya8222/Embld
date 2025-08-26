# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking (tsc --noEmit)
```

### Environment Setup
Copy `.env.local.example` to `.env.local` and configure:
- Supabase URL, anon key, and service role key
- Stripe keys for payment processing  
- OpenAI API key for AI features
- Resend API key for email notifications

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database/Auth**: Supabase
- **Styling**: Tailwind CSS with custom utilities
- **AI**: OpenAI GPT-4 for idea refinement and post generation
- **Payments**: Stripe
- **Email**: Resend

### Project Structure

**Core Application Flow**:
1. Landing page (`/`) - Public marketing page
2. Home (`/home`) - Protected, requires auth, shows ServiceBuilderHome
3. Auth flow (`/auth/login`, `/auth/register`)
4. Ideas system - Users submit app ideas, AI helps refine them
5. Owners system - Community features for app owners/developers
6. Admin panel (`/admin/*`) - Platform management

### Key Patterns

**Supabase Integration**:
- Client-side: `@/lib/supabase/client.ts` - Browser client using SSR
- Server-side: `@/lib/supabase/server.ts` - Server client with cookie handling
- Middleware: `@/middleware.ts` - Auth protection for routes

**Component Organization**:
- Page components in `app/` directory structure
- Shared components in `components/` organized by feature
- Server actions in `app/actions/` for data mutations
- API routes in `app/api/` for complex operations

**Authentication Flow**:
- AuthProvider wraps the app for client-side auth state
- Middleware protects routes requiring authentication
- Auth callback handles OAuth and magic link flows

**AI Integration**:
- Service builder AI assists with idea refinement
- Post generation AI helps create optimized project posts
- Multiple AI endpoints for different workflows (clarify requirements, evaluate ideas, generate services)

## Important Notes

- This is a Japanese marketplace platform ("EmBld") for app ideas where users submit ideas and receive 30% of revenue
- The platform includes AI assistance for refining ideas into viable service proposals
- Always maintain TypeScript strict mode compliance
- Use Server Components by default, Client Components only when needed ('use client')
- Follow existing patterns for Supabase queries and mutations
- Maintain consistent Japanese UI text where present