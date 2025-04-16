import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Expense, FilterExpenses } from "@shared/schema";
import DateRangeFilter from "@/components/DateRangeFilter";
import SummaryCards from "@/components/SummaryCards";
import CategoryChart from "@/components/CategoryChart";
import PieChart from "@/components/PieChart";
import ExpenseCard from "@/components/ExpenseCard";
import { getDateRangeText } from "@/utils/format";
import { downloadExpensesCSV, generateExportFilename } from "@/utils/export";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart4, PieChart as PieChartIcon, FileText } from "lucide-react";
import { downloadExpensesPDF, generatePdfExportFilename } from "@/utils/pdf-export";
import PdfIcon from "@/components/icons/PdfIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
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
  
  // Create stats query
  const statsQuery = useQuery<{
    totalExpenses: number;
    averagePerDay: number;
    highestExpense: number;
    highestCategory: string;
    mostFrequentCategory: string;
    mostFrequentCount: number;
    categories: Array<{ name: string; amount: number; percentage: number }>;
  }>({
    queryKey: ['/api/expenses/stats/summary', filters],
    refetchOnWindowFocus: false,
  });
  
  // Create expenses query for recent expenses
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
    statsQuery.refetch();
    expensesQuery.refetch();
  };
  
  // Calculate date range text for display
  const dateRangeText = getDateRangeText(filters.startDate, filters.endDate);
  
  // Extract the recent expenses (top 5)
  const recentExpenses = expensesQuery.data?.slice(0, 5) || [];
  
  // Handle CSV export
  const handleExportCSV = () => {
    if (expensesQuery.data) {
      const filename = generateExportFilename(filters.startDate, filters.endDate);
      downloadExpensesCSV(expensesQuery.data, filename);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">Dashboard</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 ml-auto"
              disabled={expensesQuery.isLoading || !expensesQuery.data?.length}
            >
              <Download size={16} />
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
      </div>
      
      {/* Date Filter */}
      <Card className="mb-8 border-none shadow-md">
        <CardContent className="pt-6">
          <DateRangeFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={applyFilters}
          />
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      {statsQuery.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-none shadow-md">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsQuery.isError ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-8">
          Failed to load statistics. Please try again.
        </div>
      ) : statsQuery.data ? (
        <SummaryCards stats={{
          totalExpenses: statsQuery.data.totalExpenses,
          averagePerDay: statsQuery.data.averagePerDay,
          highestExpense: statsQuery.data.highestExpense,
          highestCategory: statsQuery.data.highestCategory,
          mostFrequentCategory: statsQuery.data.mostFrequentCategory,
          mostFrequentCount: statsQuery.data.mostFrequentCount
        }} dateRangeText={dateRangeText} />
      ) : null}
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Expense by Category */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">
              <div className="flex items-center gap-2">
                <BarChart4 size={20} className="text-primary" />
                Expense Breakdown
              </div>
            </CardTitle>
            <CardDescription>
              How your money was spent during {dateRangeText}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/6" />
                    </div>
                    <Skeleton className="h-2.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : statsQuery.isError ? (
              <div className="text-center py-8 text-gray-500">
                Failed to load category data.
              </div>
            ) : statsQuery.data && statsQuery.data.categories.length > 0 ? (
              <CategoryChart categories={statsQuery.data.categories} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No expense data available.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Pie Chart */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">
              <div className="flex items-center gap-2">
                <PieChartIcon size={20} className="text-primary" />
                Category Distribution
              </div>
            </CardTitle>
            <CardDescription>
              Visual breakdown of spending by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : statsQuery.isError ? (
              <div className="text-center py-8 text-gray-500">
                Failed to load pie chart data.
              </div>
            ) : statsQuery.data && statsQuery.data.categories.length > 0 ? (
              <PieChart categories={statsQuery.data.categories} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No expense data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Expenses */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-medium">Recent Expenses</CardTitle>
            <Link href="/expenses" className="text-sm text-primary hover:underline font-medium">
              View All
            </Link>
          </div>
          <CardDescription>Your most recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {expensesQuery.isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/6" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : expensesQuery.isError ? (
            <div className="text-center py-8 text-gray-500">
              Failed to load expenses. Please try again.
            </div>
          ) : recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No expenses found. Add your first expense to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
