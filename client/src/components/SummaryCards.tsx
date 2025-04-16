import { formatCurrency } from "@/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Zap, BarChart } from "lucide-react";

interface SummaryCardsProps {
  stats: {
    totalExpenses: number;
    averagePerDay: number;
    highestExpense: number;
    highestCategory: string;
    mostFrequentCategory: string;
    mostFrequentCount: number;
  };
  dateRangeText: string;
}

export default function SummaryCards({ stats, dateRangeText }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Expenses */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Expenses</h3>
              <p className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-500 text-transparent bg-clip-text">
                {formatCurrency(stats.totalExpenses)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{dateRangeText}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Average Per Day */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Daily Average</h3>
              <p className="text-2xl font-bold bg-gradient-to-br from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                {formatCurrency(stats.averagePerDay)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{dateRangeText}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Highest Expense */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Highest Expense</h3>
              <p className="text-2xl font-bold bg-gradient-to-br from-amber-500 to-orange-500 text-transparent bg-clip-text">
                {formatCurrency(stats.highestExpense)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{stats.highestCategory}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Most Frequent Category */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Most Frequent</h3>
              <p className="text-2xl font-bold bg-gradient-to-br from-green-500 to-emerald-500 text-transparent bg-clip-text">
                {stats.mostFrequentCategory || "None"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.mostFrequentCount > 0 ? `${stats.mostFrequentCount} transactions` : "No data"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <BarChart className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
