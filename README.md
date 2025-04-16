
# Expense Tracker Application

A full-stack expense tracking application built with React, TypeScript, Express, and MongoDB.

## Prerequisites

- Node.js (v20 or later)
- MongoDB Atlas account
- Git

## Setup Instructions

1. Clone the repository
```bash
git clone <your-repository-url>
cd expense-tracker
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
   
Create a `.env` file in the root directory with your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
```

4. Start the Development Server
```bash
npm run dev
```

The application will start on http://0.0.0.0:5000

## Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── lib/         # Shared libraries
├── server/              # Backend Express server
│   ├── routes.ts        # API routes
│   └── mongodb.ts       # Database configuration
└── shared/              # Shared TypeScript types
```

## Features

- Track expenses with descriptions, amounts, and categories
- Filter expenses by date range
- Visualize spending with charts
- Export expenses to PDF and CSV
- Responsive design for mobile and desktop

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking

## Tech Stack

- Frontend: React, TypeScript, TailwindCSS, shadcn/ui
- Backend: Express.js, Node.js
- Database: MongoDB
- Charts: Recharts
- PDF Export: jsPDF
