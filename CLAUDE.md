# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Run
```bash
pnpm dev          # Start development server (http://localhost:3000)
pnpm build        # Build for production (includes Prisma generation)
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database Operations
```bash
pnpm prisma migrate dev --name <name>  # Create and apply new migration (development)
pnpm prisma migrate deploy             # Apply migrations in production
pnpm prisma generate                   # Generate Prisma client
pnpm prisma db push                    # Push schema changes without migration (development only)
pnpm prisma migrate status             # Check migration status
```

## Architecture Overview

This is a **full-stack temporary email service** built with Next.js 15.3.4, React 19, Prisma, PostgreSQL, and Stripe. The application provides temporary email addresses with real-time message delivery across multiple pricing tiers.

### Key Stack Components
- **Next.js 15.3.4** with App Router and TypeScript 5.8.3
- **React 19.1.0** with latest features and performance improvements
- **Prisma ORM** with PostgreSQL database and Prisma Accelerate
- **Clerk** for authentication and user management
- **Stripe** for subscription payments and billing
- **Upstash Redis** for caching and performance
- **Radix UI + Tailwind CSS** for component library
- **Server-Sent Events** for real-time message updates
- **LogRocket** for session replay and error tracking
- **Google AdSense** for ad monetization

### Database Schema
The application uses 8 main models:
- **User**: Plan management, referrals, spending tracking
- **TempEmail**: Temporary email addresses with expiration
- **Message**: Email messages with attachments and metadata
- **Payment**: Stripe payment records and history
- **ApiUsage**: Per-user API endpoint tracking
- **UserAnalytics/SystemAnalytics**: Behavior and platform metrics
- **ProviderHealth**: Email provider status monitoring

## Business Logic

### Multi-Tier Pricing Model
- **FREE**: 10-minute emails with ads, 5 message limit, no custom domains
- **QUICK ($0.99)**: 1-hour validity
- **EXTENDED ($2.99)**: 24-hour validity, no ads
- **PRO ($9.99)**: 1-week validity, API access
- **ENTERPRISE ($29.99)**: Custom features, team management

### Revenue Protection Features
- **Custom Domains**: Blocked for FREE users (`route.ts:49`)
- **Message Forwarding**: Premium feature only
- **Message History**: Limited to 5 for FREE users
- **Ad Integration**: AdSense on FREE tier, removed for premium

### Email Providers
Four email providers with automatic failover: MAILTM, ONESECMAIL, GUERRILLAMAIL, TEMPMAIL
- **Health Monitoring**: Real-time provider status tracking
- **Automatic Failover**: Switches to healthy providers on errors
- **Performance Tracking**: Response time and error rate monitoring

### Real-Time Features
- Server-Sent Events at `/api/email/stream` for live inbox updates
- Real-time message polling every 3 seconds
- Live analytics dashboard for admin users

## API Structure

### Core Endpoints
- `POST /api/email/generate` - Create temporary email
- `GET /api/email/messages` - Fetch messages for email
- `GET /api/email/stream` - SSE for real-time inbox
- `POST /api/payments/create-checkout` - Stripe checkout
- `POST /api/payments/webhook` - Stripe webhook handler
- `POST /api/webhooks/clerk` - Clerk user events

## Recent Updates & Integrations

### Next.js 15 & React 19 Upgrade ✅ **COMPLETE**
- **Next.js**: Upgraded from 14.2.16 to 15.3.4
- **React**: Upgraded from 18.0.0 to 19.1.0  
- **TypeScript**: Updated to 5.8.3 with React 19 type definitions
- **Package Updates**: All dependencies updated for compatibility
- **Configuration**: Updated `next.config.mjs` for Next.js 15 requirements
- **LogRocket**: Temporarily disabled React plugin pending React 19 support
- **Performance**: Improved build times and runtime performance

### Code Quality Improvements ✅ **COMPLETE**
- **Email Generation API**: Refactored to reduce complexity from 15 to 10 cyclomatic complexity
- **Email Inbox Component**: Extracted helper components to reduce method size from 135 to manageable chunks
- **TypeScript Fixes**: Fixed `auth()` promise handling for Clerk Next.js 15 compatibility
- **Code Organization**: Separated concerns with dedicated helper functions and components
- **Maintainability**: Improved readability and reduced cognitive load for future development

### Email Provider System ✅ **COMPLETE**
- **All 4 Providers**: MailTM, OneSecMail, GuerrillaMail, TempMail fully implemented
- **Enhanced MailTM**: Token persistence with environment credentials support
- **Enhanced GuerrillaMail**: Full message content retrieval instead of excerpts
- **TempMail.lol Integration**: Full v2 API integration with proper authentication
  - API Key: `tempmail.20250630.y0h50vibpyr5wr7jsamkr6djcxcwxx7af9x8av7d2ad2j4zm`
  - Token persistence in database for reliable message access
  - Proper subscription tier handling (1 hour free, 10 hours with API key)
- **Automatic Failover**: Robust provider health monitoring and switching
- **Performance**: Optimized message fetching and caching

### LogRocket Integration ✅
- **Setup**: React integration with TypeScript support
- **Location**: `components/logrocket-provider.tsx`
- **Features**: Automatic user identification with Clerk data
- **App ID**: `9luh3k/temp-mail`

### Google AdSense Configuration ✅
- **Publisher ID**: `ca-pub-5405279544575502`
- **Meta Tag**: Added to layout.tsx for proper verification
- **Components**: ad-banner.tsx with dynamic ad slots
- **Revenue Model**: Integrated with FREE tier limitations

### Redis Configuration ✅
- **Updated**: Consistent UPSTASH_REDIS_URL configuration
- **Optimized**: Proper caching for providers, messages, and analytics
- **Performance**: Enhanced cache TTL settings for optimal performance

### Database Migration ✅
- **Status**: Initial migration `20250630113909_init` successfully applied
- **Models**: All 8 models created (Users, TempEmails, Messages, Payments, etc.)
- **Indexes**: Performance indexes for email queries and analytics
- **Relationships**: Foreign keys and cascading deletes properly configured

## Important Implementation Notes

### Authentication Flow
Uses Clerk for user management. New users are automatically created in the database via Clerk webhooks.

**Webhook Configuration:**
- **Development Endpoint**: `https://play.svix.com/in/e_Z1TvTlH9L1mRNt9RiiPQIvxs4wW/`
- **Local Endpoint**: `http://localhost:3000/api/webhooks/clerk`
- **Signing Secret**: `whsec_trs4v6A6dBLb+IMEW6jPlHCoxLK8ADca`
- **Events Handled**: `user.created`, `user.updated`, `user.deleted`

**Clerk Development URLs:**
- Sign in: `https://glad-glider-83.accounts.dev/sign-in`
- Sign up: `https://glad-glider-83.accounts.dev/sign-up`
- User profile: `https://glad-glider-83.accounts.dev/user`

### Payment Processing
Stripe integration with webhook validation. All payment events are stored in the Payment model for analytics.

### Database Configuration
**Prisma Accelerate Setup:**
- Uses `DATABASE_URL` with Prisma Accelerate connection pooling
- Uses `DIRECT_URL` for migrations and schema introspection
- Migration `20250630113909_init` successfully applied with all 8 models

**Database Migrations:**
- Use `pnpm prisma migrate dev` for development schema changes
- Use `pnpm prisma migrate deploy` for production deployments
- Database is fully migrated and production-ready

### Environment Variables Required
**Database:**
- `DATABASE_URL` - Prisma Accelerate connection string
- `DIRECT_URL` - Direct PostgreSQL connection for migrations

**Authentication & Payments:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` - Clerk auth
- `CLERK_WEBHOOK_SECRET` - Clerk webhook signing secret: `whsec_trs4v6A6dBLb+IMEW6jPlHCoxLK8ADca`
- `STRIPE_SECRET_KEY` - Stripe payments

**Services:**
- `UPSTASH_REDIS_URL` - Redis caching
- `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` - Google AdSense (ca-pub-5405279544575502)

**Analytics:**
- LogRocket App ID: `9luh3k/temp-mail` (configured in LogRocketProvider)

### V0.dev Integration
This project is automatically synced with v0.dev. Changes made in v0.dev are pushed to this repository and deployed via Vercel.