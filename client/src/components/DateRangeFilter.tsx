import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterExpenses } from "@shared/schema";

interface DateRangeFilterProps {
  filters: FilterExpenses;
  onFilterChange: (filters: FilterExpenses) => void;
  onApplyFilters: () => void;
  onResetFilters?: () => void;
  showCategory?: boolean;
}

export default function DateRangeFilter({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onResetFilters,
  showCategory = false 
}: DateRangeFilterProps) {
  // Get the categories from shared schema
  const categories = [
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
  ];
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, startDate: e.target.value });
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, endDate: e.target.value });
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };
  
  const handleReset = () => {
    // Calculate default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const formatYYYYMMDD = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    onFilterChange({
      startDate: formatYYYYMMDD(thirtyDaysAgo),
      endDate: formatYYYYMMDD(today),
      category: ''
    });
    
    if (onResetFilters) {
      onResetFilters();
    }
  };
  
  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-700 mb-3">
        {showCategory ? "Filters" : "Filter by Date"}
      </h3>
      <div className={`grid grid-cols-1 ${showCategory ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {showCategory && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category || ''}
              onChange={handleCategoryChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={handleStartDateChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={handleEndDateChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>
      </div>
      
      <div className={`mt-4 flex ${onResetFilters ? 'justify-between' : 'justify-end'}`}>
        {onResetFilters && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50"
          >
            Reset
          </Button>
        )}
        <Button
          onClick={onApplyFilters}
          className="py-2 px-4 bg-primary hover:bg-blue-600 text-white font-medium rounded-md shadow-sm"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
