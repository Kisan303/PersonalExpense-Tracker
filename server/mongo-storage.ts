import { ObjectId } from 'mongodb';
import { IStorage } from './storage';
import { User, Expense, InsertUser, InsertExpense, UpdateExpense, FilterExpenses } from '@shared/schema';
import { ensureConnection } from './mongodb';
import { log } from './vite';

export class MongoStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const { users } = await ensureConnection();
      const user = await users.findOne({ id });
      return user || undefined;
    } catch (error) {
      log(`Error in getUser: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { users } = await ensureConnection();
      const user = await users.findOne({ username });
      return user || undefined;
    } catch (error) {
      log(`Error in getUserByUsername: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const { users } = await ensureConnection();
      
      // Get the next user ID
      const lastUser = await users.findOne({}, { sort: { id: -1 } });
      const nextId = lastUser ? lastUser.id + 1 : 1;
      
      const user: User = {
        ...insertUser,
        id: nextId
      };
      
      await users.insertOne(user);
      return user;
    } catch (error) {
      log(`Error in createUser: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      throw error;
    }
  }

  // Expense methods
  async getExpenses(filters?: FilterExpenses): Promise<Expense[]> {
    try {
      const { expenses } = await ensureConnection();
      
      // Build query from filters
      const query: any = {};
      
      if (filters) {
        // Handle date filtering
        if (filters.startDate || filters.endDate) {
          query.date = {};
          
          if (filters.startDate) {
            query.date.$gte = filters.startDate;
          }
          
          if (filters.endDate) {
            query.date.$lte = filters.endDate;
          }
        }
        
        // Handle category filtering
        if (filters.category && filters.category.trim() !== '') {
          query.category = filters.category;
        }
      }
      
      log(`Executing MongoDB query with filters: ${JSON.stringify(query)}`, 'mongodb');
      
      // Execute query and sort by date (newest first)
      const result = await expenses.find(query).sort({ date: -1 }).toArray();
      log(`Found ${result.length} expenses matching filters`, 'mongodb');
      
      return result;
    } catch (error) {
      log(`Error in getExpenses: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      throw error;
    }
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    try {
      const { expenses } = await ensureConnection();
      const expense = await expenses.findOne({ id });
      return expense || undefined;
    } catch (error) {
      log(`Error in getExpense: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      throw error;
    }
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    try {
      const { expenses } = await ensureConnection();
      
      // Get the next expense ID
      const lastExpense = await expenses.findOne({}, { sort: { id: -1 } });
      const nextId = lastExpense ? lastExpense.id + 1 : 1;
      
      const expense: Expense = {
        ...insertExpense,
        id: nextId,
        createdAt: new Date(),
        notes: insertExpense.notes || null,
        userId: insertExpense.userId || null
      };
      
      await expenses.insertOne(expense);
      return expense;
    } catch (error) {
      log(`Error in createExpense: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      throw error;
    }
  }

  async updateExpense(updateExpense: UpdateExpense): Promise<Expense | undefined> {
    try {
      const { expenses } = await ensureConnection();
      
      // Find the expense to update
      const existingExpense = await expenses.findOne({ id: updateExpense.id });
      if (!existingExpense) {
        return undefined;
      }
      
      // Create updated expense object
      const updated: Expense = {
        ...existingExpense,
        ...updateExpense,
        notes: updateExpense.notes || existingExpense.notes,
        userId: updateExpense.userId || existingExpense.userId,
        createdAt: existingExpense.createdAt
      };
      
      // Update in database
      await expenses.updateOne(
        { id: updateExpense.id },
        { $set: updated }
      );
      
      return updated;
    } catch (error) {
      log(`Error in updateExpense: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<boolean> {
    try {
      const { expenses } = await ensureConnection();
      const result = await expenses.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      log(`Error in deleteExpense: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      throw error;
    }
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
    try {
      log(`Getting expense stats with filters: ${JSON.stringify(filters)}`, 'mongodb');
      // Get filtered expenses
      const filteredExpenses = await this.getExpenses(filters);
      
      if (filteredExpenses.length === 0) {
        return {
          totalExpenses: 0,
          averagePerDay: 0,
          highestExpense: 0,
          highestCategory: '',
          mostFrequentCategory: '',
          mostFrequentCount: 0,
          categories: []
        };
      }
      
      // Calculate total expenses
      const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      // Find highest expense
      const highestExpense = Math.max(...filteredExpenses.map(exp => exp.amount));
      const highestExpenseItem = filteredExpenses.find(exp => exp.amount === highestExpense);
      const highestCategory = highestExpenseItem ? highestExpenseItem.category : '';
      
      // Calculate average per day
      let averagePerDay = 0;
      if (filters?.startDate && filters?.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        averagePerDay = totalExpenses / (diffDays || 1); // Avoid division by zero
      } else {
        // If no date range, use the expense dates to calculate
        const dates = new Set(filteredExpenses.map(exp => exp.date.split('T')[0]));
        averagePerDay = totalExpenses / (dates.size || 1); // Avoid division by zero
      }
      
      // Calculate category statistics
      const categoryMap = new Map<string, { count: number; amount: number }>();
      
      for (const expense of filteredExpenses) {
        const { category, amount } = expense;
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { count: 0, amount: 0 });
        }
        
        const categoryStats = categoryMap.get(category)!;
        categoryStats.count += 1;
        categoryStats.amount += amount;
      }
      
      // Find most frequent category
      let mostFrequentCategory = '';
      let mostFrequentCount = 0;
      
      // Convert map entries to array to avoid iterator issues
      const categoryEntries = Array.from(categoryMap.entries());
      for (const [category, stats] of categoryEntries) {
        if (stats.count > mostFrequentCount) {
          mostFrequentCount = stats.count;
          mostFrequentCategory = category;
        }
      }
      
      // Prepare category stats for chart
      const categories = Array.from(categoryMap.entries()).map(([name, { amount }]) => ({
        name,
        amount,
        percentage: (amount / totalExpenses) * 100
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
    } catch (error) {
      log(`Error in getExpenseStats: ${error instanceof Error ? error.message : String(error)}`, 'mongodb');
      throw error;
    }
  }
}