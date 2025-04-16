# Expense Tracker Web Application

## Overview
The Expense Tracker is a full-stack web application designed to help users track and manage their expenses effectively. It allows users to categorize their expenses, visualize spending trends, and export data in various formats (CSV, PDF). The application supports both mobile and desktop views with a responsive design.

## Access & Setup
- **Development URL**: Access the application via `http://0.0.0.0:5000` when running locally.
- **MongoDB Connection**: A MongoDB URI is required to connect to the database. This should be set in a `.env` file in the root directory with the key `MONGODB_URI`.

## Features

### 1. Dashboard
**Location**: `/client/src/pages/Dashboard.tsx`

Provides an overview with:
- Total expenses summary cards
- Breakdown of expenses by category
- Visual charts (Pie and Bar)
- List of recent expenses
- Data export functionality (CSV/PDF)

### 2. Expenses Page
**Location**: `/client/src/pages/Expenses.tsx`

Features:
- Complete list of all expenses
- Filtering and sorting options
- Add, edit, or delete expenses
- Export data functionality
- Search functionality for better usability

### 3. Expense Management
Features include:
- Adding, editing, and deleting expenses
- Categorizing expenses for better tracking
- Adding optional notes and descriptions for each expense

### 4. Data Visualization
Charts:
- Pie chart for category-wise distribution
- Bar chart for tracking spending over time
- Interactive charts with hover tooltips for detailed insights

### 5. Export Options
Export functionality:
- Export your expenses as a well-formatted PDF
- Export as CSV for easy spreadsheet analysis
- Custom date range selection for exports

## Components Guide

### 1. ExpenseForm
**Purpose**: To add or edit expense entries  
**Fields**:
- **Description** (required)
- **Amount** (required)
- **Category** (required)
- **Date** (required)
- **Notes** (optional)

### 2. ExpenseTable
**Purpose**: To display a table of all expenses  
**Features**:
- Sortable columns
- Pagination for large data
- Action buttons for each row (Edit, Delete)
- Search functionality to find specific expenses

### 3. DateRangeFilter
**Purpose**: To filter expenses based on a selected date range  
**Options**:
- Custom date selection
- Preset date ranges (Last 7 days, Last month, etc.)

### 4. Charts
**Components**:
- **PieChart**: Displays the distribution of expenses by category
- **CategoryChart**: Shows spending patterns over time or by category

## User Interface

### 1. Navigation
- **Dashboard**: Provides an overview of expenses and statistics
- **Expenses**: A detailed page for managing and viewing expenses

### 2. Common Actions
- **Add Expense**: Use the "+" button in the header to add a new expense
- **Export**: Export options are available in both the dashboard and expenses pages
- **Filter**: Use the date range filter at the top of the page
- **Search**: A search bar is available in the expenses page for quick lookups

### 3. Responsive Design
- **Desktop**: Full sidebar navigation for easy access to all pages
- **Mobile**: Collapsible menu for a cleaner mobile experience
- **Adaptive layouts**: Optimized for different screen sizes, providing a seamless user experience

## Technical Details

### 1. API Endpoints
**Base URL**: `/api`

**Expenses Routes**:
- `GET /expenses`: Fetch all expenses
- `POST /expenses`: Create a new expense
- `PUT /expenses/:id`: Update an existing expense
- `DELETE /expenses/:id`: Delete an expense

**Statistics Routes**:
- `GET /expenses/stats/summary`: Get overall expense statistics

### 2. Data Format
**Example of an Expense Object**:
```typescript
{
  id: number,
  description: string,
  amount: number,
  category: string,
  date: string, // Format: YYYY-MM-DD
  notes?: string,
  userId: number,
  createdAt: string
}
