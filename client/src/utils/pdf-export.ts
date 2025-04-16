import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense } from '@shared/schema';
import { formatCurrency, formatDate } from './format';

/**
 * Generates a receipt-style PDF document for expenses
 */
export function generateExpensesPDF(expenses: Expense[], title = 'Expense Report', dateRange = ''): jsPDF {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 22);
  
  // Add date range if provided
  if (dateRange) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(dateRange, 14, 30);
  }
  
  // Add current date
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.text(`Generated on: ${currentDate}`, 14, 38);
  
  // Calculate total amount
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Add summary box
  doc.setFillColor(240, 240, 240);
  doc.rect(14, 45, 182, 15, 'F');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Number of Expenses: ${expenses.length}`, 17, 53);
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 130, 53);
  
  // Generate table
  autoTable(doc, {
    startY: 65,
    head: [['Date', 'Description', 'Category', 'Amount', 'Notes']],
    body: expenses.map(expense => [
      formatDate(expense.date),
      expense.description,
      expense.category,
      formatCurrency(expense.amount),
      expense.notes || ''
    ]),
    headStyles: {
      fillColor: [60, 100, 160],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250]
    },
    columnStyles: {
      0: { cellWidth: 25 },  // Date
      1: { cellWidth: 60 },  // Description
      2: { cellWidth: 30 },  // Category
      3: { cellWidth: 25 },  // Amount
      4: { cellWidth: 40 }   // Notes
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 3,
      fontSize: 9
    },
    didDrawPage: (data) => {
      // Footer with page number
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    }
  });
  
  // Add signature line
  const pageCount = doc.getNumberOfPages();
  doc.setPage(pageCount);
  
  const y = doc.internal.pageSize.height - 40;
  doc.setDrawColor(0, 0, 0);
  doc.line(14, y, 80, y);
  doc.setFontSize(10);
  doc.text("Signature", 14, y + 5);
  
  return doc;
}

/**
 * Triggers a download of expenses as a PDF file
 */
export function downloadExpensesPDF(
  expenses: Expense[], 
  filename = 'expenses.pdf', 
  title = 'Expense Report',
  dateRange = ''
): void {
  const doc = generateExpensesPDF(expenses, title, dateRange);
  doc.save(filename);
}

/**
 * Generate a filename for expense PDF export based on date range
 */
export function generatePdfExportFilename(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) {
    return `expenses_${new Date().toISOString().slice(0, 10)}.pdf`;
  }
  
  const start = startDate ? startDate.replace(/-/g, '') : 'all';
  const end = endDate ? endDate.replace(/-/g, '') : 'latest';
  
  return `expenses_${start}_to_${end}.pdf`;
}