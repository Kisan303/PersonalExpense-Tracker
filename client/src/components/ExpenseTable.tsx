import { Expense } from "@shared/schema";
import { formatCurrency, formatDate } from "@/utils/format";
import { useLayoutContext } from "@/components/layout/Layout";
import { useMobile } from "@/hooks/use-mobile";
import ExpenseCard from "./ExpenseCard";
import { Edit, Trash } from "lucide-react"; // ← import icons here

interface ExpenseTableProps {
  expenses: Expense[];
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  const { onEditExpense, onDeleteExpense } = useLayoutContext();
  const isMobile = useMobile();

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

  if (isMobile) {
    return (
      <div className="md:hidden">
        <ul className="divide-y divide-gray-200">
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <li key={expense.id}>
                <ExpenseCard expense={expense} />
              </li>
            ))
          ) : (
            <li className="p-6 text-center text-gray-500">
              No expenses found. Add a new expense to get started.
            </li>
          )}
        </ul>
      </div>
    );
  }

  return (
    <div className="hidden md:block overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <tr key={expense.id} className="transition-all duration-300 ease-in-out hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(expense.category)}`}>
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                  <button
                    onClick={() => onEditExpense(expense)}
                    className="text-primary hover:text-blue-700 transition"
                    aria-label="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-destructive hover:text-red-700 transition"
                    aria-label="Delete"
                  >
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No expenses found. Add a new expense to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
