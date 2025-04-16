import dotenv from 'dotenv';
dotenv.config();


import { MongoClient, Collection, Db } from 'mongodb';
import { User, Expense, FilterExpenses } from '@shared/schema';
import { log } from './vite';

// Connection Variables
const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'app'; // Using the database name you provided

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

let client: MongoClient | null = null;
let db: Db | null = null;

// Collections
let users: Collection<User> | null = null;
let expenses: Collection<Expense> | null = null;

// Initialize MongoDB connection
export async function connectToMongoDB(): Promise<void> {
  if (client) {
    return;
  }

  try {
    log(`Connecting to MongoDB Atlas...`, 'mongodb');
    
    // Log connection string partially (for debugging, without revealing credentials)
    const connectionStringSafe = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    log(`Using connection string: ${connectionStringSafe}`, 'mongodb');
    
    // Connect with options
    client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,   // 45 seconds
    });
    
    await client.connect();
    log(`Connected to MongoDB client successfully!`, 'mongodb');
    
    // Connect to the specified database
    db = client.db(DB_NAME);
    log(`Connected to database: ${DB_NAME}`, 'mongodb');
    
    // Initialize collections
    users = db.collection<User>('users');
    expenses = db.collection<Expense>('expenses');
    
    // Create indexes for better query performance
    await expenses.createIndex({ userId: 1 });
    await expenses.createIndex({ date: 1 });
    await expenses.createIndex({ category: 1 });
    
    log(`MongoDB setup complete!`, 'mongodb');
  } catch (error) {
    log(`Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
    throw error;
  }
}

// Close MongoDB connection
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    users = null;
    expenses = null;
    log(`MongoDB connection closed`, 'mongodb');
  }
}

// Check if we're connected to MongoDB
export function isConnected(): boolean {
  return client !== null && db !== null;
}

// Get collections
export function getCollections() {
  if (!users || !expenses) {
    throw new Error('MongoDB collections not initialized');
  }
  
  return {
    users,
    expenses
  };
}

// Ensure connection before accessing collections
export async function ensureConnection() {
  if (!isConnected()) {
    await connectToMongoDB();
  }
  return getCollections();
}