import { expenses, type Expense, type InsertExpense, type UpdateExpense, type FilterExpenses } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Expense related methods
  getExpenses(filters?: FilterExpenses): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(expense: UpdateExpense): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Stats methods
  getExpenseStats(filters?: FilterExpenses): Promise<{
    totalExpenses: number;
    averagePerDay: number;
    highestExpense: number;
    highestCategory: string;
    mostFrequentCategory: string;
    mostFrequentCount: number;
    categories: Array<{ name: string; amount: number; percentage: number }>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private expensesData: Map<number, Expense>;
  currentUserId: number;
  currentExpenseId: number;

  constructor() {
    this.users = new Map();
    this.expensesData = new Map();
    this.currentUserId = 1;
    this.currentExpenseId = 1;
    
    // Add some initial sample data
    this.createUser({ username: 'testuser', password: 'password' }).then(user => {
      const userId = user.id;
      const now = new Date();
      
      // Create some sample expenses
      const sampleExpenses: InsertExpense[] = [
        {
          description: 'Grocery shopping',
          amount: 85.32,
          category: 'Food',
          date: '2023-08-28',
          notes: 'Weekly groceries from Trader Joe\'s',
          userId
        },
        {
          description: 'Rent payment',
          amount: 1200.00,
          category: 'Housing',
          date: '2023-08-01',
          notes: 'Monthly rent',
          userId
        },
        {
          description: 'Uber ride',
          amount: 24.50,
          category: 'Transportation',
          date: '2023-08-15',
          notes: 'Airport trip',
          userId
        },
        {
          description: 'Netflix subscription',
          amount: 15.99,
          category: 'Entertainment',
          date: '2023-08-10',
          notes: 'Monthly subscription',
          userId
        },
        {
          description: 'New headphones',
          amount: 249.99,
          category: 'Shopping',
          date: '2023-08-20',
          notes: 'Sony WH-1000XM4',
          userId
        },
        {
          description: 'Coffee shop',
          amount: 5.75,
          category: 'Food',
          date: '2023-08-25',
          notes: 'Morning coffee and pastry',
          userId
        },
        {
          description: 'Electric bill',
          amount: 87.23,
          category: 'Utilities',
          date: '2023-08-05',
          notes: 'Monthly electric',
          userId
        },
        {
          description: 'Dinner with friends',
          amount: 65.80,
          category: 'Food',
          date: '2023-08-18',
          notes: 'Italian restaurant',
          userId
        }
      ];
      
      sampleExpenses.forEach(expense => this.createExpense(expense));
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id
    };
    this.users.set(id, user);
    return user;
  }
  
  async getExpenses(filters?: FilterExpenses): Promise<Expense[]> {
    let expenses = Array.from(this.expensesData.values());
    
    if (filters) {
      // Filter by category if provided
      if (filters.category && filters.category !== '') {
        expenses = expenses.filter(expense => expense.category === filters.category);
      }
      
      // Filter by date range if provided
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        expenses = expenses.filter(expense => new Date(expense.date) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        expenses = expenses.filter(expense => new Date(expense.date) <= endDate);
      }
    }
    
    // Sort by date, newest first
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expensesData.get(id);
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const createdAt = new Date();
    
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt
    };
    
    this.expensesData.set(id, expense);
    return expense;
  }
  
  async updateExpense(updateExpense: UpdateExpense): Promise<Expense | undefined> {
    const existing = this.expensesData.get(updateExpense.id);
    
    if (!existing) {
      return undefined;
    }
    
    const updated: Expense = {
      ...existing,
      description: updateExpense.description,
      amount: updateExpense.amount,
      category: updateExpense.category,
      date: updateExpense.date,
      notes: updateExpense.notes
    };
    
    this.expensesData.set(updateExpense.id, updated);
    return updated;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expensesData.delete(id);
  }
  
  async getExpenseStats(filters?: FilterExpenses): Promise<{
    totalExpenses: number;
    averagePerDay: number;
    highestExpense: number;
    highestCategory: string;
    mostFrequentCategory: string;
    mostFrequentCount: number;
    categories: Array<{ name: string; amount: number; percentage: number }>;
  }> {
    const expenses = await this.getExpenses(filters);
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate average per day
    let averagePerDay = 0;
    if (expenses.length > 0) {
      let startDate, endDate;
      
      if (filters?.startDate) {
        startDate = new Date(filters.startDate);
      } else {
        // Get oldest expense date
        const oldestExpense = [...expenses].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0];
        startDate = new Date(oldestExpense.date);
      }
      
      if (filters?.endDate) {
        endDate = new Date(filters.endDate);
      } else {
        // Get newest expense date
        const newestExpense = [...expenses].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        endDate = new Date(newestExpense.date);
      }
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      averagePerDay = totalExpenses / diffDays;
    }
    
    // Find highest expense
    let highestExpense = 0;
    let highestCategory = 'N/A';
    
    if (expenses.length > 0) {
      const highest = expenses.reduce((prev, current) => 
        prev.amount > current.amount ? prev : current
      );
      highestExpense = highest.amount;
      highestCategory = highest.category;
    }
    
    // Find most frequent category
    const categoryCounts: Record<string, number> = {};
    expenses.forEach(expense => {
      categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1;
    });
    
    let mostFrequentCategory = 'N/A';
    let mostFrequentCount = 0;
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > mostFrequentCount) {
        mostFrequentCategory = category;
        mostFrequentCount = count;
      }
    });
    
    // Calculate category totals and percentages
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    const categories = Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
    
    return {
      totalExpenses,
      averagePerDay,
      highestExpense,
      highestCategory,
      mostFrequentCategory,
      mostFrequentCount,
      categories
    };
  }
}

import { MongoStorage } from './mongo-storage';

// Use MongoDB storage for persistent data
export const storage = new MongoStorage();
