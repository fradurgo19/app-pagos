# Utility Bill Management System

A comprehensive web application for managing and tracking utility bills with advanced reporting and automation features.

## Features

### Core Functionality
- **User Authentication** - Secure email/password authentication with role-based access control
- **Bill Registration** - Multi-section form with validation and draft saving
- **Bill Management** - Advanced data table with sorting, filtering, and bulk operations
- **Dashboard Analytics** - KPI cards and interactive charts for expense tracking
- **Document Management** - File upload support for invoices (PDF, JPG, PNG)
- **Role-Based Access** - Basic users and area coordinators with different permissions

### Key Highlights
- 📊 **6-month expense trend analysis**
- 📈 **Service type and location breakdowns**
- 🔔 **Budget alerts and due date reminders (mock)**
- 📤 **Export to CSV/Excel**
- ✅ **Inline bill approval for coordinators**
- 🔍 **Advanced search and filtering**

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Architecture

### Atomic Design Structure
```
src/
├── atoms/          # Basic UI components (Button, Input, Card, Badge)
├── molecules/      # Composite components (KPICard, FileUpload, SearchBar)
├── organisms/      # Complex components (Navbar, BillForm, BillsTable, Charts)
├── templates/      # Page layouts (AuthLayout, ProtectedLayout)
├── pages/          # Route components (Dashboard, Bills, NewBill)
├── hooks/          # Custom React hooks
├── services/       # API and business logic
├── context/        # Global state management
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

## Database Schema

### Tables
- **profiles** - User information with roles and locations
- **utility_bills** - Bill records with all details
- **budget_thresholds** - Monthly spending limits by service type
- **notifications** - System notifications for users

### Row Level Security (RLS)
- Users can view and manage their own bills
- Area coordinators can view and approve bills in their location
- All tables have comprehensive RLS policies

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd utility-bill-manager
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Database setup
The database schema is already applied through migrations. The following tables are created:
- profiles
- utility_bills
- budget_thresholds
- notifications

5. Start the development server
```bash
npm run dev
```

6. Build for production
```bash
npm run build
```

## User Roles

### Basic User
- Create and manage own bills
- View personal dashboard
- Upload documents
- Export bills to CSV

### Area Coordinator
- All basic user permissions
- View bills for their location
- Approve pending bills
- Manage budget thresholds

## Default Test Users

After signup, users are assigned the 'basic_user' role. To test area coordinator features, update a user's role in the database:

```sql
UPDATE profiles SET role = 'area_coordinator' WHERE email = 'coordinator@example.com';
```

## Key Components

### Dashboard
- Monthly total with month-over-month comparison
- Pending and overdue bill counts
- 6-month expense trend chart
- Service type distribution chart
- Location-based cost center breakdown

### Bill Registration
- Four-section form with validation
- Real-time error checking
- File upload for invoices
- Save as draft or submit
- Autocomplete based on historical data

### Bills Management
- Sortable data table
- Multi-criteria filtering
- Search across invoice numbers and providers
- Bulk delete operations
- Inline approval for coordinators
- Export to CSV

## Automation Features (Mock)

The following automation features are implemented as mock services:

1. **Email Notifications** - Simulated emails for new bills and approvals
2. **Due Date Reminders** - 3-day advance warnings
3. **Budget Alerts** - Notifications at 80% threshold
4. **Monthly Reports** - Automated report generation

## TypeScript

The application uses strict TypeScript mode with comprehensive type definitions:
- No `any` types in production code
- All components and functions are properly typed
- Strict null checks enabled

## Accessibility

- Semantic HTML throughout
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Performance Optimizations

- Code splitting with React Router
- Debounced search inputs
- Optimistic UI updates
- Lazy loading for charts
- Responsive design (mobile-first)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Real-time notifications with WebSockets
- PDF generation for reports
- Advanced analytics with machine learning
- Mobile app (React Native)
- Integration with accounting software
- Automated bill parsing with OCR

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
