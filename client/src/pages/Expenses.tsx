import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Expense, FilterExpenses } from "@shared/schema";
import DateRangeFilter from "@/components/DateRangeFilter";
import ExpenseTable from "@/components/ExpenseTable";
import { Button } from "@/components/ui/button";
import { PlusIcon, FileDown, FileText } from "lucide-react";
import PdfIcon from "@/components/icons/PdfIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayoutContext } from "@/components/layout/Layout";
import { downloadExpensesPDF, generatePdfExportFilename } from "@/utils/pdf-export";
import { downloadExpensesCSV, generateExportFilename } from "@/utils/export";
import { getDateRangeText } from "@/utils/format";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Expenses() {

  // Initialize filters state (all expenses by default)
    const [filters, setFilters] = useState<FilterExpenses>(() => {
      const today = new Date();
      // Start with an empty filter to get all expenses
      return {
        startDate: "",
        endDate: today.toISOString().split('T')[0],
        category: ''
      };
    });
  
    // Query to get all expenses for initial date range
    const initialExpensesQuery = useQuery<Expense[]>({
      queryKey: ['/api/expenses', { startDate: "", endDate: "", category: "" }],
      onSuccess: (data) => {
        if (data && data.length > 0) {
          // Sort expenses by date to find earliest
          const sortedExpenses = [...data].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          const earliestDate = sortedExpenses[0].date.split('T')[0];
          
          // Update filters with earliest date
          setFilters(prev => ({
            ...prev,
            startDate: earliestDate
          }));
        }
      },
      refetchOnWindowFocus: false,
    });
    

 
  
  // Create expenses query
  const expensesQuery = useQuery<Expense[]>({
    queryKey: ['/api/expenses', filters],
    refetchOnWindowFocus: false,
  });
  
  // Function to handle filter change
  const handleFilterChange = (newFilters: FilterExpenses) => {
    setFilters(newFilters);
  };
  
  // Function to apply filters
  const applyFilters = () => {
    // Refetch data with current filters
    expensesQuery.refetch();
  };
  
 
 // Function to reset filters
const resetFilters = () => {
  const today = new Date();

  const formatYYYYMMDD = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  setFilters({
    startDate: "",  // Reset start date to empty string (no filter)
    endDate: formatYYYYMMDD(today),  // Set end date to today's date in YYYY-MM-DD format
    category: ''  // Reset category filter
  });

  // Refetch data with reset filters
  expensesQuery.refetch();
};

  
  // Handle add expense button click (from layout context)
  const handleAddExpense = () => {
    // Use the dummy expense to trigger the add expense modal
    // This is a trick to reuse the edit expense handler
    const dummyExpense = null;
    onEditExpense({} as Expense);
  };
  
  return (
    <div className="p-4 lg:p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Expense History</h2>
      
      {/* Filters */}
      <DateRangeFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
        showCategory={true}
      />
      
      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-700">All Expenses</h3>
          <div className="flex space-x-2">
            {!expensesQuery.isLoading && !expensesQuery.isError && expensesQuery.data && expensesQuery.data.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <FileDown className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    const dateRangeText = getDateRangeText(filters.startDate, filters.endDate);
                    const filename = generatePdfExportFilename(filters.startDate, filters.endDate);
                    const title = filters.category ? 
                      `Expense Report - ${filters.category}` : 
                      'Expense Report';
                    
                    downloadExpensesPDF(
                      expensesQuery.data || [], 
                      filename,
                      title,
                      dateRangeText
                    );
                  }} className="cursor-pointer">
                    <PdfIcon className="h-4 w-4 mr-2" />
                    <span>Export as PDF</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const filename = generateExportFilename(filters.startDate, filters.endDate);
                    downloadExpensesCSV(expensesQuery.data || [], filename);
                  }} className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Export as CSV</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              onClick={handleAddExpense}
              className="py-2 px-4 bg-primary hover:bg-blue-600 text-white font-medium rounded-md shadow-sm flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Expense
            </Button>
          </div>
        </div>
        
        {expensesQuery.isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 pb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : expensesQuery.isError ? (
          <div className="p-6 text-center text-red-500">
            Failed to load expenses. Please try again.
          </div>
        ) : (
          <ExpenseTable expenses={expensesQuery.data || []} />
        )}
      </div>
    </div>
  );
}
