import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Education",
  "Personal",
  "Travel",
  "Other"
] as const;

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(), // Store as YYYY-MM-DD format
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertExpenseSchema = createInsertSchema(expenses)
  .pick({
    description: true,
    amount: true,
    category: true,
    date: true,
    notes: true,
    userId: true,
  })
  .extend({
    category: z.enum(categories),
  });

export const updateExpenseSchema = insertExpenseSchema.extend({
  id: z.number(),
});

export const filterExpensesSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;
export type FilterExpenses = z.infer<typeof filterExpensesSchema>;
export type Expense = typeof expenses.$inferSelect;
export type Category = (typeof categories)[number];
