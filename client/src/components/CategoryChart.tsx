import { Progress } from "@/components/ui/progress";

interface CategoryChartProps {
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

export default function CategoryChart({ categories }: CategoryChartProps) {
  // Function to get category color
  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-primary',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };
  
  return (
    <div className="space-y-3">
      {categories.map((category, index) => (
        <div key={category.name}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{category.name}</span>
            <span className="text-sm font-medium text-gray-700">{formatCurrency(category.amount)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getCategoryColor(index)}`}
              style={{ width: `${category.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
