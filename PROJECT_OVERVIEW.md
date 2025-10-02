# Employee Management SaaS - Project Overview

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form + Zod validation
- **Data Tables**: TanStack Table v8
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Theme**: next-themes (dark mode support)

## Project Structure

```
src/
├── api/                    # API layer
│   ├── axios.ts           # Axios instance with interceptors & refresh token logic
│   └── endpoints.ts       # API endpoint definitions
│
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── StatCard.tsx      # Dashboard stat cards
│   ├── RoleBadge.tsx     # User role badges
│   ├── PlanBadge.tsx     # Subscription plan badges
│   ├── Loader.tsx        # Loading indicators
│   ├── ConfirmDialog.tsx # Confirmation dialogs
│   ├── DatePicker.tsx    # Date picker component
│   ├── DataTable.tsx     # Reusable data table with sorting/filtering
│   └── ThemeToggle.tsx   # Dark mode toggle
│
├── layouts/              # Layout components
│   ├── AuthLayout.tsx    # Authentication pages layout
│   └── DashboardLayout.tsx # Main dashboard layout with sidebar
│
├── pages/                # Page components
│   ├── LoginPage.tsx         # Login with email/password & Google OAuth
│   ├── RegisterPage.tsx      # User registration
│   ├── VerifyEmailPage.tsx   # Email verification
│   ├── InvitationPage.tsx    # Accept team invitations
│   ├── DashboardPage.tsx     # Main dashboard with stats
│   ├── AttendancePage.tsx    # Attendance management (CRUD)
│   ├── LeavesPage.tsx        # Leave requests & approvals
│   ├── ReportsPage.tsx       # Monthly reports with charts (PRO+)
│   ├── UsersPage.tsx         # User management & invitations (ADMIN+)
│   ├── SubscriptionPage.tsx  # Subscription plans & upgrade (OWNER)
│   ├── ProfilePage.tsx       # User profile settings
│   ├── BillingSuccessPage.tsx # Payment success page
│   ├── BillingCancelPage.tsx  # Payment cancelled page
│   ├── NotFoundPage.tsx      # 404 error page
│   └── UnauthorizedPage.tsx  # 403 access denied page
│
├── routes/               # Routing configuration
│   ├── AppRouter.tsx     # Main router with all routes
│   └── ProtectedRoute.tsx # Route guards (auth, role, plan checks)
│
├── store/                # Zustand stores
│   ├── authStore.ts      # Authentication state
│   ├── subscriptionStore.ts # Subscription state
│   └── uiStore.ts        # UI state (sidebar, etc.)
│
├── types/                # TypeScript definitions
│   └── index.ts          # All type definitions
│
├── utils/                # Utility functions
│   ├── tenant.ts         # Tenant detection from subdomain
│   └── format.ts         # Date/string formatting utilities
│
├── App.tsx               # Main app component
└── main.tsx              # App entry point with ThemeProvider
```

## Key Features

### Authentication & Authorization
- Email/password authentication
- Google OAuth integration
- Email verification support
- Token refresh mechanism with retry logic
- Role-based access control (OWNER/ADMIN/EMPLOYEE)
- Plan-based feature gating (FREE/PRO/ENTERPRISE/TRIAL)

### Multi-Tenancy
- Tenant detection from subdomain or X-Tenant header
- Environment variable override for development (VITE_TENANT_OVERRIDE)

### Core Features
1. **Dashboard**: Overview stats, today's attendance, quick actions
2. **Attendance**: Daily attendance tracking with CRUD operations
3. **Leaves**: Leave request creation and approval workflow
4. **Reports**: Monthly analytics with charts (PRO+ feature)
5. **Users**: User management, role assignment, email invitations (ADMIN+)
6. **Subscription**: Plan comparison and upgrade via Stripe (OWNER only)
7. **Profile**: User profile editing

### UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Animations and transitions with Framer Motion
- Toast notifications (sonner)
- Loading states and skeletons
- Empty states
- Confirmation dialogs
- Accessible components (ARIA)

### API Integration
- Axios instance with automatic tenant header injection
- Access token in Authorization header
- Refresh token flow on 401 responses
- Request queuing during token refresh
- Error handling and user-friendly messages

## Running the Project

```bash
# Install dependencies
npm install

# Start development server (auto-started)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_TENANT_OVERRIDE=acme
VITE_OAUTH_GOOGLE_URL=http://localhost:8080/oauth2/authorization/google
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
```

## API Endpoints Reference

### Authentication
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/register` - Register new account
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/verify-email?token=...` - Verify email
- `POST /api/v1/auth/verify-email/resend?email=...` - Resend verification
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Invitations
- `POST /api/v1/invitations?email=...&role=...` - Send invitation
- `GET /api/v1/invitations/:token` - Get invitation details
- `POST /api/v1/invitations/:token/accept` - Accept invitation

### Attendance
- `GET /api/v1/attendance/daily?date=YYYY-MM-DD` - Get daily attendance
- `PUT /api/v1/attendance` - Mark attendance

### Leaves
- `GET /api/v1/leaves` - List all leaves
- `POST /api/v1/leaves` - Create leave request
- `PATCH /api/v1/leaves/:id/decision?approverId=...` - Approve/reject leave

### Reports
- `GET /api/v1/reports/monthly?month=YYYY-MM` - Get monthly report (PRO+)

### Billing
- `POST /api/v1/billing/checkout-session` - Create Stripe checkout session

## Access Control

### Route Guards
- **Public**: Login, Register, Verify Email, Invitation Accept
- **Authenticated**: Dashboard, Attendance, Leaves, Profile
- **ADMIN+**: Users management
- **OWNER**: Subscription settings
- **PRO+ Plans**: Monthly reports

### Role Hierarchy
- **OWNER**: Full access to everything
- **ADMIN**: User management, leave approvals
- **EMPLOYEE**: Basic access (attendance, leaves)

### Plan Features
- **FREE**: Basic features, up to 10 employees
- **PRO**: Monthly reports, up to 50 employees, advanced features
- **ENTERPRISE**: Unlimited, priority support, custom integrations
- **TRIAL**: Temporary access to premium features

## Design System
- **Colors**: Professional color palette with dark mode support
- **Typography**: Clear hierarchy with proper font sizes
- **Spacing**: Consistent 8px spacing system
- **Animations**: Subtle transitions and micro-interactions
- **Accessibility**: ARIA labels, keyboard navigation, proper contrast

## Notes
- The project is production-ready with proper error handling
- All forms include validation with user-friendly error messages
- Data tables support searching, sorting, and pagination
- The build compiles successfully with no errors
- Dark mode is fully supported across all pages
- Responsive design works on all screen sizes
