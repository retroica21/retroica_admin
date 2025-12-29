# Getting Started with Retroica Admin

This is your multi-tenant admin system for managing retro electronics inventory across multiple sales platforms.

## Initial Setup

### 1. Database Setup

Run the SQL scripts in your Supabase SQL editor in this exact order:

```bash
1. scripts/001_create_base_schema.sql
2. scripts/002_create_rls_policies.sql
3. scripts/003_create_triggers.sql
4. scripts/004_create_helper_functions.sql
```

These scripts create:
- Tables for profiles, products, listings, orders, and financial transactions
- Row Level Security (RLS) policies for multi-tenant data isolation
- Automated triggers for cross-platform product delisting
- Helper functions for statistics and reporting

### 2. Create Your Admin Account

1. Go to `/auth/signup`
2. Create an account with your email
3. Check your email for confirmation
4. After confirming, manually update your role in Supabase:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 3. Create Seller Accounts

For each seller in your team:

1. Have them sign up at `/auth/signup`
2. They will automatically get the 'seller' role
3. Or create accounts manually in Supabase and send credentials

### 4. Import Existing Inventory

Follow the [Import Guide](./IMPORT_GUIDE.md) to import your Excel inventory.

## Architecture Overview

### Multi-Tenant Structure

- **Admins**: Full access to all products, orders, sellers, and system settings
- **Sellers**: Can only see and manage their own products and orders
- **Row Level Security**: Database-level enforcement of tenant isolation

### Platform Integration

The system supports:
- **Etsy**: Vintage electronics marketplace
- **Medusa**: Your custom Next.js + Medusa store
- **Aukro**: Polish auction platform
- **Other**: Extensible for additional platforms

### Sync Strategy

- **Webhooks**: Real-time updates from platforms (when supported)
- **Polling**: Periodic API checks for status updates
- **Hybrid**: Both methods for reliability

When a product sells on one platform, it's automatically delisted from others via database triggers.

## Key Features

### 1. Central Product Management (`/admin/products`)
- Single source of truth for all inventory
- Track products across multiple platforms
- Manage pricing, descriptions, images

### 2. Multi-Platform Listings (`/admin/sync`)
- Sync products to Etsy, Medusa, Aukro
- Track listing status per platform
- Handle errors and conflicts

### 3. Order Management (`/admin/orders`)
- Consolidated view of all sales
- Track order status and fulfillment
- Platform-specific order details

### 4. Financial Dashboard (`/admin/financials`)
- Revenue tracking across platforms
- Platform fee calculations
- Seller-specific earnings
- Profit/loss reporting

### 5. Seller Management (`/admin/sellers`)
- Manage seller accounts
- View seller performance
- Handle payouts

## User Roles & Permissions

### Admin Permissions
- View all products, orders, and financial data
- Manage sellers and their access
- Configure platform integrations
- Import/export data
- Access system settings

### Seller Permissions
- View/edit their own products
- See their own orders
- Track their own earnings
- Request product status changes
- View where their products are listed

## Dashboard Routes

### Admin Routes (`/admin/*`)
- `/admin` - Overview dashboard with system-wide stats
- `/admin/products` - All products across all sellers
- `/admin/orders` - All orders from all platforms
- `/admin/sellers` - Seller management
- `/admin/import` - Excel import tool
- `/admin/sync` - Platform synchronization

### Seller Routes (`/dashboard/*`)
- `/dashboard` - Personal dashboard with seller stats
- `/dashboard/products` - Their own products
- `/dashboard/orders` - Their own orders
- `/dashboard/financials` - Their own earnings

### Auth Routes (`/auth/*`)
- `/auth/login` - Email/password login
- `/auth/signup` - New account registration
- `/auth/signup-success` - Confirmation message

## API Structure

### Product APIs
- `GET /api/products` - List products (filtered by role)
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Platform Sync APIs
- `POST /api/sync/[platform]` - Trigger manual sync
- `POST /api/webhooks/[platform]` - Handle platform webhooks

### Import API
- `POST /api/import/excel` - Import from Excel

## Environment Variables

Required environment variables (already configured via Supabase integration):

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional for development:
```env
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

## Next Steps

1. ✅ Database schema is set up
2. ✅ Authentication system is configured
3. ✅ Import tool is ready
4. ⏭️ Import your Excel inventory
5. ⏭️ Configure platform API credentials
6. ⏭️ Test platform syncing
7. ⏭️ Train your sellers

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Platform Integration Next Steps

To enable actual platform syncing, you'll need to:

1. **Etsy API**
   - Register app at Etsy Developer Portal
   - Add OAuth credentials
   - Implement listing creation/updates

2. **Medusa API**
   - Configure Medusa backend URL
   - Add admin API token
   - Implement product sync

3. **Aukro API**
   - Register for Aukro API access
   - Add authentication credentials
   - Implement auction listing

Each platform adapter in `lib/platforms/` has stubbed methods ready for implementation.
