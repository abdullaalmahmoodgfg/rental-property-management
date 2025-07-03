# Rental Property Management Solution (Next.js Full-Stack)



> A flexible, full-stack application for managing rental properties, tenants, utility billing and inspections—optimized for low-income tenants and single-user operation.



---



## Table of Contents



1. [Overview](#overview)  
2. [Technology Stack](#technology-stack)  
3. [Key Features](#key-features)  
4. [Architecture & Directory Structure](#architecture--directory-structure)  
5. [UI/UX Guidelines](#uiux-guidelines)  
6. [Prerequisites](#prerequisites)  
7. [Getting Started](#getting-started)  
8. [Environment Variables](#environment-variables)  
9. [Database Setup & Migrations](#database-setup--migrations)  
10. [Running Locally](#running-locally)  
11. [Deployment](#deployment)  
12. [Storage & Media (S3/R2)](#storage--media-s3r2)  
13. [Usage](#usage)  
14. [Contributing & License](#contributing--license)



---



## Overview



A full-stack Next.js 14 + TypeScript application to:



- Track monthly rent payments (FULL | PARTIAL | NOT_PAID | OVERPAID)  
- Manage utility providers, meter readings (with photo verification), and cost calculations  
- Automate periodic inspections (water leaks, safety checks)  
- Provide rich reporting, reminders, and a clean mobile-first UI  



Designed for a single landlord managing multiple buildings and diverse tenant situations.



---



## Technology Stack



| Aspect               | Technology                                | Justification                                      |
|----------------------|-------------------------------------------|----------------------------------------------------|
| Frontend & Backend   | Next.js 14 (App Router) + TypeScript      | Unified React-based full-stack framework           |
| ORM & Database       | Prisma ORM + PostgreSQL (via Supabase)    | Type-safe, migration-driven database management    |
| Authentication       | NextAuth.js (Google OAuth)                | Free, battle-tested SSO solution                   |
| Storage & Media      | Cloudflare R2 (S3-compatible)             | Affordable object storage for meter photos & docs  |
| Styling              | Tailwind CSS                              | Rapid, consistent UI development                   |



---



## Key Features



1. **Payment & Billing**  
   - Monthly status tracking (full, partial, overdue, credit)  
   - Flexible partial/overpayments, collector notes  
   - Filtering, reporting, and exportable summaries  



2. **Utility Management**  
   - Provider setup & tiered pricing  
   - Meter reading upload + photo verification  
   - Automatic cost calculation & multi-level allocation  



3. **Inspections & Maintenance**  
   - Scheduled leak/safety inspections  
   - Dynamic checklists & result logging  
   - Priority alerts and full audit trail  



4. **Tenant & Property Management**  
   - Onboard tenants, leases, guarantors  
   - Document storage with expiry reminders  
   - Contact history & follow-up scheduling  



5. **System & Admin**  
   - Role-based access, audit logging  
   - Global settings & feature toggles  
   - Grace periods, discounts, and late-fee policies  



---



## Architecture & Directory Structure



/
├─ prisma/ # Prisma schema & migrations
├─ public/ # Static assets
├─ src/
│ ├─ app/ # Next.js App Router pages & API routes
│ ├─ components/ # Reusable React + Tailwind UI components
│ ├─ lib/ # Database client, auth helpers
│ ├─ services/ # Business logic & data-access modules
│ ├─ styles/ # Tailwind CSS config & globals
│ └─ utils/ # Utility functions (validation, formatting)
├─ functions/ # Azure Functions / cron jobs
├─ .env.example # Environment variable template
├─ next.config.js # Next.js configuration
├─ prisma.schema # Prisma schema entrypoint
└─ package.json



---



## UI/UX Guidelines



- **Responsive & Mobile-First**: fluid grids, touch-friendly controls  
- **Intuitive Navigation**: sidebar or top bar with clear labels  
- **Card-Based Dashboards**: high-level metrics at a glance  
- **Color-Coded Status Badges**: green (paid), amber (partial), red (overdue)  
- **Accessibility (WCAG AA)**: semantic HTML, keyboard support, sufficient contrast  
- **Consistent Design System**: typography scale, spacing, iconography  



---



## Prerequisites



- Node.js ≥ 18 & npm  
- Git  
- Supabase account (PostgreSQL)  
- Cloudflare R2 (or S3-compatible) credentials  

---

## Getting Started

```bash
git clone https://github.com/abdullaalmahmoodgfg/Property_rental_management.git
cd Property_rental_management
npm install
cp .env.example .env.local



Environment Variables
Create a .env.local with:

# Supabase
DATABASE_HOST=aws-0-eu-west-1.pooler.supabase.com
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres.jcyzsebrvtczhecokxnm
DATABASE_PASSWORD=zEXIQ41%s1zBK9
DATABASE_POOL_MODE=session



# Cloud Storage (S3/R2)
S3_ENDPOINT=https://ce3985d61f4008a3d1a53a7d7e73f653.r2.cloudflarestorage.com
S3_BUCKET_NAME=rental-property-images
S3_ACCESS_KEY_ID=77d2ec07253a33b7e1ec76ed9af199d8
S3_SECRET_ACCESS_KEY=c5e973fc8d69c3bafe3075c344157e52701e2679770ed80a60d5d2fe57091c18



Database Setup & Migrations



npx prisma migrate dev --name init
npx prisma generate



npm run dev



Frontend: http://localhost:3000



API routes under /api/*



Azure Functions (in /functions/) can be run with the Azure Functions Core Tools



Storage & Media (S3/R2)



Bucket: rental-property-images (Eastern Europe)



Endpoint: https://ce3985d61f4008a3d1a53a7d7e73f653.r2.cloudflarestorage.com/rental-property-images



Usage
This solution is intended solely for your personal property-management needs. No multi-tenant or public access is configured by default.