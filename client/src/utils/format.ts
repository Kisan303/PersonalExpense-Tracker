// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Format date for display
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format number with commas
export function formatNumber(number: number): string {
  return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Get date range text for display
export function getDateRangeText(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) {
    return 'All time';
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return `Last ${diffDays} days`;
}
