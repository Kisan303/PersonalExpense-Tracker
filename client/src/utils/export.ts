import { Expense } from '@shared/schema';
import { formatCurrency, formatDate } from './format';

/**
 * Converts expenses data to CSV format
 */
export function expensesToCSV(expenses: Expense[]): string {
  if (expenses.length === 0) {
    return 'Date,Description,Category,Amount,Notes\n';
  }

  const header = 'Date,Description,Category,Amount,Notes\n';
  
  const rows = expenses.map(expense => {
    const date = formatDate(expense.date);
    const description = expense.description.replace(/,/g, ' '); // Replace commas to avoid CSV issues
    const category = expense.category;
    const amount = expense.amount.toString();
    const notes = expense.notes ? expense.notes.replace(/,/g, ' ').replace(/\n/g, ' ') : '';
    
    return `${date},${description},${category},${amount},${notes}`;
  }).join('\n');
  
  return header + rows;
}

/**
 * Triggers a download of expenses as a CSV file
 */
export function downloadExpensesCSV(expenses: Expense[], filename = 'expenses.csv'): void {
  const csv = expensesToCSV(expenses);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate a filename for expense export based on date range
 */
export function generateExportFilename(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) {
    return `expenses_all_time.csv`;
  }
  
  if (startDate && endDate) {
    const start = startDate.split('T')[0];
    const end = endDate.split('T')[0];
    return `expenses_${start}_to_${end}.csv`;
  }
  
  if (startDate) {
    const start = startDate.split('T')[0];
    return `expenses_from_${start}.csv`;
  }
  
  if (endDate) {
    const end = endDate.split('T')[0];
    return `expenses_until_${end}.csv`;
  }
  
  return 'expenses.csv';
}