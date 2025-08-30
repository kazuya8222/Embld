# Stripe Connect Revenue Sharing System

## Overview
This implementation provides a complete Stripe Connect Express integration with revenue sharing for the EmBld platform. Users can connect their bank accounts, and when their products are purchased, they automatically receive 30% of the revenue.

## Features Implemented

### 1. Database Schema
- **users table**: Added Stripe Connect fields
  - `stripe_account_id`: Unique Connect account ID
  - `stripe_onboarding_completed`: Boolean for completion status
  - `stripe_account_created_at`: Account creation timestamp

- **transactions table**: Records all payments
  - Payment intent tracking
  - Product and buyer information
  - Amount and currency
  - Status and metadata

- **payouts table**: Revenue distribution records
  - User revenue shares (30%)
  - Stripe transfer tracking
  - Status management
  - Transfer timestamps

- **revenue_analytics table**: Aggregated analytics
  - Daily revenue tracking
  - User and product breakdown
  - Transaction counts

### 2. API Endpoints

#### `/api/stripe/connect`
- **POST**: Creates Stripe Connect account and onboarding link
- **GET**: Checks account status and onboarding completion

#### `/api/stripe/checkout`
- **POST**: Creates checkout session with automatic revenue sharing
- Calculates 70/30 split (platform/user)
- Includes product and owner metadata

#### `/api/stripe/revenue-webhook`
- Handles payment success events
- Processes revenue distribution
- Updates analytics
- Creates Stripe transfers to connected accounts

#### `/api/revenue/analytics`
- Returns user revenue analytics
- Supports different time periods (day/week/month/year)
- Aggregates data by period
- Calculates totals and averages

#### `/api/revenue/payouts`
- Returns user payout history
- Provides summary statistics
- Shows pending and completed payouts

### 3. Frontend Components

#### `RevenueDashboard`
- Interactive charts using Recharts
- Revenue trends visualization
- Period filtering (daily/weekly/monthly/yearly)
- Export to CSV functionality
- Summary cards with key metrics

#### `PurchaseButton`
- Integration with checkout API
- Loading states and error handling
- Formatted pricing display

#### Stripe Connect Settings Page (`/dashboard/settings/stripe`)
- Onboarding flow management
- Account status display
- Connection verification
- Security and revenue information

#### Revenue Management Page (`/dashboard/revenue`)
- Complete earnings overview
- Payout history
- Stripe connection status
- Revenue dashboard integration

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local`:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_REVENUE_WEBHOOK_SECRET=whsec_...

# App URL (for Stripe redirects)
NEXT_PUBLIC_URL=http://localhost:3000
```

### 2. Stripe Dashboard Configuration

#### Enable Stripe Connect
1. Go to Stripe Dashboard → Connect
2. Enable Connect for your account
3. Set up Express accounts

#### Create Webhooks
1. Create webhook endpoint: `https://yourdomain.com/api/stripe/revenue-webhook`
2. Subscribe to events:
   - `payment_intent.succeeded`
   - `transfer.created`
   - `account.updated`

#### Test Mode Setup
1. Use test API keys for development
2. Use Stripe CLI for local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/revenue-webhook
   ```

### 3. Database Migration
The schema has been applied with the migration: `add_stripe_connect_schema`

### 4. Testing Flow

#### User Onboarding
1. User visits `/dashboard/settings/stripe`
2. Clicks "Stripe Connectを設定する"
3. Completes Stripe onboarding (bank account, tax info, etc.)
4. Returns to app with completed status

#### Revenue Flow
1. Customer purchases a product using `PurchaseButton`
2. Stripe processes payment
3. Webhook receives `payment_intent.succeeded`
4. System calculates 30% user share
5. Creates `Transfer` to user's connected account
6. Updates analytics and payout records
7. User sees revenue in `/dashboard/revenue`

## Revenue Sharing Logic

### Platform Split
- **Platform**: 70% of revenue
- **User**: 30% of revenue

### Transfer Process
1. Payment succeeds → Record transaction
2. Calculate user share (30%)
3. Create payout record (status: pending)
4. If user has completed Stripe onboarding:
   - Create Stripe Transfer
   - Update payout status to completed
5. If user hasn't completed onboarding:
   - Keep payout as pending
   - Transfer when onboarding completes

### Analytics Aggregation
- Daily revenue tracking per user/product
- Real-time updates on payment success
- Upsert logic to handle multiple transactions per day

## Error Handling

### Payment Failures
- Transaction marked as failed
- No payout created
- User notified through UI

### Transfer Failures
- Payout marked as failed
- Can be retried manually
- User sees failed status in dashboard

### Webhook Resilience
- Idempotency for duplicate events
- Error logging for debugging
- Graceful fallback handling

## Security Considerations

### Webhook Verification
- Stripe signature verification
- Environment-specific webhook secrets
- Request validation

### Data Protection
- RLS policies for user data access
- Service role for webhook processing
- Encrypted sensitive information

### Connect Account Security
- Express accounts for simplified onboarding
- Stripe handles KYC/compliance
- Automatic account verification

## Monitoring and Maintenance

### Key Metrics to Monitor
- Transfer success rate
- Onboarding completion rate
- Revenue processing latency
- Failed payment rates

### Regular Tasks
- Monitor Stripe Dashboard for account issues
- Review failed transfers and payouts
- Update webhook endpoints as needed
- Monitor rate limits and API usage

## Usage Examples

### Creating a Product Purchase
```typescript
import { PurchaseButton } from '@/components/products/PurchaseButton'

<PurchaseButton
  productId="product-uuid"
  price={1000} // ¥1,000
  title="My Product"
/>
```

### Displaying User Revenue
```typescript
import { RevenueDashboard } from '@/components/dashboard/RevenueDashboard'

<RevenueDashboard productId="optional-product-filter" />
```

### Checking Stripe Connection Status
```typescript
const response = await fetch('/api/stripe/connect')
const { connected, onboarding_completed } = await response.json()
```

This system provides a complete revenue sharing solution with automatic payouts, comprehensive analytics, and a user-friendly interface for managing earnings.