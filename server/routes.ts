import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, updateExpenseSchema, filterExpensesSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // PUT YOUR ROUTES HERE
  
  // Get all expenses with optional filtering
  app.get('/api/expenses', async (req: Request, res: Response) => {
    try {
      const filters = filterExpensesSchema.parse({
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category
      });
      
      const expenses = await storage.getExpenses(filters);
      res.json(expenses);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: 'Failed to fetch expenses' });
      }
    }
  });
  
  // Get expense by ID
  app.get('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid expense ID' });
      }
      
      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch expense' });
    }
  });
  
  // Create new expense
  app.post('/api/expenses', async (req: Request, res: Response) => {
    try {
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        userId: 1 // Default to first user since we don't have auth
      });
      
      const newExpense = await storage.createExpense(expenseData);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: 'Failed to create expense' });
      }
    }
  });
  
  // Update existing expense
  app.put('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid expense ID' });
      }
      
      const updateData = updateExpenseSchema.parse({
        ...req.body,
        id,
        userId: 1 // Default to first user since we don't have auth
      });
      
      const updatedExpense = await storage.updateExpense(updateData);
      if (!updatedExpense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: 'Failed to update expense' });
      }
    }
  });
  
  // Delete expense
  app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid expense ID' });
      }
      
      const success = await storage.deleteExpense(id);
      if (!success) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete expense' });
    }
  });
  
  // Get expense statistics
  app.get('/api/expenses/stats/summary', async (req: Request, res: Response) => {
    try {
      const filters = filterExpensesSchema.parse({
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category
      });
      
      const stats = await storage.getExpenseStats(filters);
      res.json(stats);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: 'Failed to fetch expense statistics' });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
