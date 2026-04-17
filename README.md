# A&S Branded Collection

A modern e-commerce platform for a Pakistani fashion and beauty store built with Next.js, TypeScript, and Supabase.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Features Documentation](#features-documentation)
- [Deployment](#deployment)

## Overview

A&S Branded Collection is a fully functional e-commerce platform designed for Pakistani customers. The platform offers a seamless shopping experience with product browsing, secure checkout, order tracking, and customer reviews.

The platform uses Cash on Delivery (COD) as the primary payment method and provides free delivery on orders above PKR 3,000.

## Features

### Customer Features

- Product Browsing
  - Category and subcategory filtering
  - Search functionality
  - Price range filtering
  - Sort options
  - Pagination

- Shopping Cart
  - Add/remove items
  - Quantity management
  - Real-time price calculations
  - Free shipping threshold display

- Checkout & Orders
  - Simple COD checkout process
  - Pakistani phone number validation
  - Order confirmation page

- Order Tracking
  - Public order tracking without login
  - Lookup by Order Number and phone verification
  - Visual status timeline (Pending, Confirmed, Ready to Ship, Shipped, Delivered)
  - Full order details with shipping information
  - Ability to cancel orders before shipping

- Product Reviews
  - Leave reviews without login
  - 1-5 star rating system
  - Optional review description
  - View average ratings and rating distribution
  - Expandable review list

### Admin Features

- Dashboard
  - Summary statistics
  - Recent orders overview
  - Quick actions

- Product Management
  - Create, read, update, delete products
  - Multiple image uploads per product
  - Discount management
  - Stock quantity tracking
  - Primary image selection

- Order Management
  - View all orders with filtering
  - Update order status
  - Add tracking information
  - Add order notes
  - Cancel orders when applicable

- Category Management
  - Create categories and subcategories
  - Drag-and-drop reordering
  - Group naming for mega menu
  - Image uploads for subcategories

- Banner Management
  - Upload promotional banners
  - Toggle active/inactive
  - Reorder banners
  - Add banner titles and links

- Review Management
  - View all customer reviews
  - Delete inappropriate reviews
  - Filter reviews by product

- Store Settings
  - Update store name, phone, email
  - WhatsApp number management
  - Store address
  - Free delivery threshold
  - Expected delivery days

## Tech Stack

Frontend:

- Next.js 16 (App Router)
- TypeScript
- React
- CSS Variables for theming

Backend:

- Next.js API Routes
- Node.js

Database:

- PostgreSQL (via Supabase)
- Supabase Storage for images

Authentication:

- Supabase Auth (admin only)

Deployment:

- Vercel

## Project Structure

```text
app/
├── page.tsx                                 # Homepage
├── layout.tsx                               # Root layout
├── globals.css                              # Global styles
├── products/
│   ├── page.tsx                             # Products listing
│   └── [slug]/page.tsx                      # Product detail
├── track-order/
│   └── page.tsx                             # Order tracking page
├── cart/page.tsx                            # Cart page
├── checkout/page.tsx                        # Checkout form
├── order-confirmation/page.tsx              # Order success page
├── category/[slug]/page.tsx                 # Category redirect
├── admin/
│   ├── layout.tsx                           # Admin shell
│   ├── login/page.tsx                       # Admin login
│   ├── page.tsx                             # Dashboard
│   ├── orders/page.tsx                      # Orders management
│   ├── reviews/page.tsx                     # Reviews management
│   ├── products/page.tsx                    # Products CRUD
│   ├── categories/page.tsx                  # Categories management
│   ├── banners/page.tsx                     # Banners management
│   └── settings/page.tsx                    # Store settings
└── api/
    ├── products/                            # Products endpoints
    ├── categories/                          # Categories endpoints
    ├── banners/                             # Banners endpoints
    ├── orders/                              # Orders endpoints
    ├── settings/                            # Settings endpoints
    ├── track-order/                         # Order tracking endpoint
    └── admin/                               # Admin endpoints

lib/
├── supabase.ts                              # Supabase client
├── supabase-server.ts                       # Server-side client
├── admin-auth.ts                            # Admin middleware
├── cart-context.tsx                         # Cart state management
├── use-settings.ts                          # Settings hook
├── utils.ts                                 # Utility functions
└── types/index.ts                           # TypeScript interfaces

components/
├── Navbar.tsx                               # Navigation
├── Footer.tsx                               # Footer
├── StarRating.tsx                           # Star rating widget
├── ReviewForm.tsx                           # Review form
├── ReviewsSection.tsx                       # Reviews display
├── OrderTrackingForm.tsx                    # Tracking form
├── OrderStatusTimeline.tsx                  # Status timeline
├── OrderTrackingDetails.tsx                 # Order details
└── [other components]

middleware.ts                                # Auth middleware
```

## Database Schema

### orders table

```text
- id (uuid, primary key)
- first_name (text)
- last_name (text)
- phone (text)
- address (text)
- city (text)
- postal_code (text)
- total_amount (numeric)
- status (enum: pending, confirmed, ready_to_ship, shipped, delivered, cancelled)
- payment_method (text)
- estimated_delivery_date (date)
- shipping_carrier (text)
- tracking_number (text)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### order_items table

```text
- id (uuid, primary key)
- order_id (uuid, foreign key)
- product_id (uuid)
- product_name (text)
- product_price (numeric)
- product_discount_percent (numeric)
- quantity (integer)
```

### order_status_history table

```text
- id (uuid, primary key)
- order_id (uuid, foreign key)
- status (enum)
- changed_at (timestamp)
- changed_by (text)
- notes (text)
- created_at (timestamp)
```

### products table

```text
- id (uuid, primary key)
- name (text)
- slug (text)
- description (text)
- price (numeric)
- discount_percent (numeric)
- stock_qty (integer)
- category_id (uuid, foreign key)
- created_at (timestamp)
- updated_at (timestamp)
```

### product_images table

```text
- id (uuid, primary key)
- product_id (uuid, foreign key)
- image_url (text)
- is_primary (boolean)
- created_at (timestamp)
```

### reviews table

```text
- id (uuid, primary key)
- product_id (uuid, foreign key)
- customer_name (text)
- rating (integer, 1-5)
- description (text, optional)
- created_at (timestamp)
```

### categories table

```text
- id (uuid, primary key)
- name (text)
- slug (text)
- is_active (boolean)
- sort_order (integer)
- created_at (timestamp)
```

### subcategories table

```text
- id (uuid, primary key)
- category_id (uuid, foreign key)
- name (text)
- slug (text)
- group_name (text)
- image_url (text)
- is_active (boolean)
- sort_order (integer)
- created_at (timestamp)
```

### banners table

```text
- id (uuid, primary key)
- image_url (text)
- title (text)
- link_url (text)
- is_active (boolean)
- sort_order (integer)
- created_at (timestamp)
```

### store_settings table

```text
- key (text, primary key)
- value (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/as-branded-collection.git
cd as-branded-collection
```

2. Install dependencies

```bash
npm install
```

3. Create a .env.local file with required environment variables

```bash
cp .env.example .env.local
```

4. Set up database

- Create a new Supabase project
- Run the SQL migrations in the database
- Update environment variables with Supabase credentials

5. Run development server

```bash
npm run dev
```

Open <http://localhost:3000> in your browser.

## Environment Variables

Create a .env.local file in the project root:

```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these values from your Supabase project settings.

## API Routes

### Public Routes

#### Products

- GET /api/products - List products with filtering
- GET /api/products/[slug] - Get single product
- GET /api/categories - Get categories with subcategories
- GET /api/banners - Get active banners
- GET /api/settings - Get store settings

#### Orders

- POST /api/orders - Create order (checkout)
- POST /api/track-order - Track order by number and phone

#### Reviews

- GET /api/products/[slug]/reviews - Get reviews for product
- POST /api/products/[slug]/reviews - Submit product review

### Admin Routes

All admin routes require authentication via Supabase Auth.

#### Orders

- GET /api/admin/orders - List all orders
- GET /api/admin/orders/[id] - Get order details
- PATCH /api/admin/orders/[id]/status - Update order status
- POST /api/admin/orders/[id]/cancel - Cancel order

#### Products

- GET /api/admin/products - List products
- POST /api/admin/products - Create product
- PUT /api/admin/products/[id] - Update product
- DELETE /api/admin/products/[id] - Delete product
- POST /api/admin/products/[id]/images - Upload product images

#### Categories

- GET /api/admin/categories - List categories
- POST /api/admin/categories - Create category
- PUT /api/admin/categories/[id] - Update category
- DELETE /api/admin/categories/[id] - Delete category

#### Reviews

- GET /api/admin/reviews - List all reviews
- DELETE /api/admin/reviews/[id] - Delete review

#### Banners

- GET /api/admin/banners - List banners
- POST /api/admin/banners - Create banner
- PUT /api/admin/banners/[id] - Update banner
- DELETE /api/admin/banners/[id] - Delete banner

#### Settings

- GET /api/admin/settings - Get settings
- PUT /api/admin/settings - Update settings

## Features Documentation

### Order Tracking

Customers can track orders without login by visiting `/track-order` and entering:

- Order Number (displayed on confirmation page)
- Phone Number (used for verification)

The tracking page shows:

- Visual status timeline with current status
- Order items with prices
- Shipping address and contact information
- Shipping carrier and tracking number (when available)
- Estimated delivery date
- Full status history with timestamps

### Product Reviews

Customers can leave reviews on product pages without login. Reviews include:

- Customer name
- 1-5 star rating
- Optional description/comment

Product pages display:

- Average rating
- Rating distribution chart
- List of customer reviews (expandable)
- Review form to submit new reviews

### Order Management

The order status workflow includes:

- Pending: Order received, awaiting confirmation
- Confirmed: Order confirmed by store
- Ready to Ship: Order is packed and ready
- Shipped: Order has been shipped with tracking
- Delivered: Order successfully delivered
- Cancelled: Order has been cancelled

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to vercel.com and sign in
3. Click "New Project"
4. Select your GitHub repository
5. Add environment variables in Vercel dashboard
6. Click "Deploy"

The application will be automatically deployed and redeployed on every push to main branch.

## Security

- All admin routes require authentication
- Phone number verification for order tracking
- Environment variables for sensitive data
- CORS protection on API routes
- Input validation on all forms
- SQL injection protection via Supabase

## Support

For issues, feature requests, or questions:

- Open a GitHub issue
- Contact the development team

## License

This project is proprietary and confidential. All rights reserved.

## Author

- Muhammad Sami

## Acknowledgments

- Supabase for database and authentication
- Next.js team for the amazing framework
- Vercel for hosting platform

## Changelog

### Version 1.0.0 (Current)

Features:

- Complete e-commerce platform
- Product management system
- Order tracking
- Customer reviews
- Admin dashboard
- Order management with status tracking
- Category and subcategory system
- Banner management
- Store settings management

Fixes:

- Order tracking API lookup by order number
- Review submission validation

---

Last updated: April 2026

For the latest updates and documentation, visit the project repository.
