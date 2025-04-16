import { Link } from "wouter";

type SidebarProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
  onAddExpense: () => void;
};

export default function Sidebar({ currentPath, onNavigate, onAddExpense }: SidebarProps) {
  return (
    <aside className="hidden lg:block fixed top-0 left-0 w-64 h-full bg-white shadow-md z-10">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">ExpenseTracker</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link 
              href="/" 
              className={`flex items-center p-2 rounded-lg ${
                currentPath === "/" 
                  ? "bg-blue-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              href="/expenses" 
              className={`flex items-center p-2 rounded-lg ${
                currentPath === "/expenses" 
                  ? "bg-blue-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Expenses
            </Link>
          </li>
          <li>
            <button
              onClick={onAddExpense}
              className="w-full flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Expense
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
