import { Expense } from "@shared/schema";
import { formatCurrency, formatDate } from "@/utils/format";
import { useLayoutContext } from "@/components/layout/Layout";

interface ExpenseCardProps {
  expense: Expense;
}

export default function ExpenseCard({ expense }: ExpenseCardProps) {
  const { onEditExpense, onDeleteExpense } = useLayoutContext();

  const handleDelete = () => {
    if (expense?.id) {
      onDeleteExpense(expense.id);
    }
  };
  
  // Function to get category badge color
  const getCategoryBadgeClass = (category: string) => {
    const map: Record<string, string> = {
      'Food': 'bg-green-100 text-green-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Housing': 'bg-purple-100 text-purple-800',
      'Utilities': 'bg-gray-100 text-gray-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Health': 'bg-red-100 text-red-800',
      'Shopping': 'bg-yellow-100 text-yellow-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Personal': 'bg-teal-100 text-teal-800',
      'Travel': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return map[category] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="p-4 border-b border-gray-200 last:border-0">
      <div className="flex justify-between mb-1">
        <span className="font-medium text-gray-900">{expense.description}</span>
        <span className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <div>
          <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(expense.category)}`}>
            {expense.category}
          </span>
          <span className="ml-2">{formatDate(expense.date)}</span>
        </div>
        <div>
          <button 
            onClick={() => onEditExpense(expense)} 
            className="text-primary hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
            title="Edit expense"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </button>
          <button 
            onClick={handleDelete} 
            className="text-destructive hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors ml-1"
            title="Delete expense"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
