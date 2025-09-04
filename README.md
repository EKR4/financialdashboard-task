# Financial Dashboard

A comprehensive financial management application that allows users to track and manage their finances across multiple banking platforms in one centralized dashboard.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Design Architecture](#design-architecture)
  - [Frontend Architecture](#frontend-architecture)
  - [Backend Architecture](#backend-architecture)
  - [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Account Management](#account-management)
- [Transaction Management](#transaction-management)
- [User Settings](#user-settings)
- [API Integration](#api-integration)
- [Tech Stack](#tech-stack)

## Overview

Financial Dashboard is a web application that provides users with a unified interface to view and manage their financial accounts across different banking platforms including M-Pesa, SBM Bank, and Co-operative Bank. The application offers real-time balance updates, transaction history, and analytical insights to help users manage their finances effectively.

## Features

### User Authentication and Security
- Email-based user authentication
- Email verification for new accounts
- Secure password management
- Protected routes for authenticated users only
- Row-Level Security (RLS) for data protection

### Dashboard and Account Management
- Consolidated dashboard showing total balance across all accounts
- Individual account cards with current balances
- Support for multiple account types (M-Pesa, SBM Bank, Co-operative Bank)
- Real-time balance updates
- Sample data generation for demonstration

### Transaction Management
- Transaction history for each account
- Transaction filtering by date, amount, type, and category
- Transaction categorization
- Pagination for efficient data loading

### User Settings
- Theme preferences (light/dark/system)
- Currency preferences
- Notification settings
- Low balance threshold alerts
- Large transaction threshold alerts

### Data Export and Notifications
- Transaction data export functionality
- Email notifications for important events
- Account balance alerts
- Transaction alerts based on user-defined thresholds

## Design Architecture

The Financial Dashboard application follows a modern architecture pattern that separates concerns and promotes maintainability and scalability.

### Frontend Architecture

The frontend is built using Next.js with the App Router pattern for efficient page rendering and navigation.

#### Component Structure

1. **Layout Components:**
   - Main layout with sidebar and navigation
   - Authentication layout for login/signup screens

2. **Page Components:**
   - Dashboard - Main user interface showing account balances
   - Accounts - Account management screens
   - Transactions - Transaction listing and filtering
   - Settings - User preference management

3. **UI Components:**
   - BalanceCard - Displays individual account balances
   - AccountDetailsModal - Shows detailed account information
   - AddAccountModal - Interface for adding new accounts
   - Notification - System notification display
   - ExportModal - Data export interface

4. **State Management:**
   - React hooks for local component state
   - Custom hooks for shared functionality
     - `useAuth` - Authentication state management
     - `useBalances` - Account balance data fetching
     - `useSettings` - User settings management

### Backend Architecture

The backend leverages Next.js API routes and Supabase for data management and authentication.

#### API Structure

1. **Authentication API:**
   - Handled primarily through Supabase Auth
   - Callback handlers for authentication flows
   - User profile management endpoints

2. **Account APIs:**
   - `/api/mpesa/balance` - Retrieve M-Pesa account balance
   - `/api/sbm/account` - Manage SBM bank account details
   - `/api/coop/balance` - Retrieve Co-operative Bank balance

3. **Data Management:**
   - CRUD operations through utility functions
   - Type-safe database interactions
   - Error handling and response formatting

### Database Schema

The application uses a PostgreSQL database (via Supabase) with the following key tables:

1. **users**
   - Extends the default Supabase Auth users
   - Stores user profile information (name, phone, preferences)
   - Linked to auth.users via foreign key

2. **accounts**
   - Stores financial account information
   - Supports multiple account types (M-Pesa, SBM, Coop)
   - Linked to users via user_id
   - Contains account numbers and additional account-specific data

3. **transactions**
   - Records all financial transactions
   - Linked to accounts via account_id
   - Supports categorization and status tracking
   - Includes transaction metadata for detailed information

4. **settings**
   - Stores user application settings
   - Theme and currency preferences
   - Notification settings and thresholds
   - Linked to users via user_id

## Authentication Flow

1. **Registration Process:**
   - User submits email, password, and optional profile information
   - System creates account in Supabase Auth
   - Verification email is sent to the user
   - Database trigger automatically creates user profile and default settings

2. **Email Verification:**
   - User clicks verification link in email
   - System processes verification via auth callback handler
   - User is redirected to login with success message

3. **Login Process:**
   - User submits email and password
   - System authenticates via Supabase Auth
   - Upon successful login, user is redirected to dashboard
   - Session is maintained for authenticated requests

4. **Session Management:**
   - Active sessions are maintained via Supabase
   - Middleware checks authentication status for protected routes
   - Automatic redirect to login for unauthenticated requests to protected routes

## Account Management

The application supports three types of financial accounts:

1. **M-Pesa**
   - Mobile money account
   - Balance tracking and transaction history
   - Real-time balance updates via API

2. **SBM Bank**
   - Traditional bank account
   - Account type information
   - Balance and transaction management

3. **Co-operative Bank**
   - Traditional bank account
   - Branch information
   - Balance and transaction management

Each account can be added, updated, or removed by the user. The system maintains a history of transactions for each account and provides real-time balance information when available.

## Transaction Management

The application provides comprehensive transaction management features:

1. **Transaction Recording:**
   - Credit and debit transactions
   - Transaction categorization
   - Reference number tracking
   - Status management

2. **Transaction Filtering:**
   - Date range filtering
   - Amount range filtering
   - Transaction type filtering
   - Category filtering
   - Text search functionality

3. **Pagination and Display:**
   - Paginated transaction lists
   - Sorting by date (newest first)
   - Transaction details display

## User Settings

The application allows users to customize their experience through various settings:

1. **Appearance Settings:**
   - Theme selection (light/dark/system)
   - Default currency selection

2. **Notification Preferences:**
   - Email notification toggle
   - Low balance alerts with customizable threshold
   - Large transaction alerts with customizable threshold

3. **Account Preferences:**
   - Active/inactive account toggle
   - Display preferences

## API Integration

The application integrates with banking APIs to fetch real-time data:

1. **Authentication:**
   - API requests include authentication tokens
   - Session validation for secure data access

2. **Data Fetching:**
   - Balance information retrieval
   - Transaction history synchronization
   - Error handling for API failures

3. **Mock Implementation:**
   - For development and demonstration purposes
   - Simulated API responses with realistic delays
   - Sample data generation for new accounts

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- React Hooks
- React Context API

### Backend
- Next.js API Routes
- Supabase
- PostgreSQL
- TypeScript
- Row Level Security

### Authentication
- Supabase Auth
- Email verification
- Session management

### Data Storage
- Supabase PostgreSQL database
- Database triggers for automation
- Row-Level Security for data protection

### Development Tools
- ESLint for code quality
- PostCSS for CSS processing
- TypeScript for type safety
- Git for version control