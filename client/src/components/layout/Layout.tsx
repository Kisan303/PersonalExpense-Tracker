import React, { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useToast } from "@/hooks/use-toast";
import ExpenseForm from "../ExpenseForm";
import DeleteConfirmation from "../DeleteConfirmation";
import { useMobile } from "@/hooks/use-mobile";
import { Expense } from "@shared/schema";

// Create a context to share the edit and delete handlers
type LayoutContextType = {
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: number) => void;
};

export const LayoutContext = React.createContext<LayoutContextType>({
  onEditExpense: () => {},
  onDeleteExpense: () => {},
});

export const useLayoutContext = () => React.useContext(LayoutContext);

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const isMobile = useMobile();
  const { toast } = useToast();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);

  const handleAddExpense = () => {
    setExpenseToEdit(null);
    setIsAddExpenseOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsAddExpenseOpen(true);
  };

  const handleDeleteExpense = (id: number) => {
    console.log("Attempting to delete expense with ID:", id); //Added for debugging
    setExpenseToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeExpenseForm = () => {
    setIsAddExpenseOpen(false);
    setExpenseToEdit(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar 
        currentPath={location} 
        onNavigate={setLocation} 
        onAddExpense={handleAddExpense}
      />

      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">ExpenseTracker</h1>
          <button 
            onClick={handleAddExpense} 
            className="p-2 rounded-full bg-primary text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        {/* Pass the edit and delete handlers to the layout context */}
        <LayoutContext.Provider 
          value={{ 
            onEditExpense: handleEditExpense, 
            onDeleteExpense: handleDeleteExpense 
          }}
        >
          {children}
        </LayoutContext.Provider>
      </main>

      {/* Mobile Navigation */}
      <MobileNav currentPath={location} onNavigate={setLocation} />

      {/* Modals */}
      <ExpenseForm 
        isOpen={isAddExpenseOpen} 
        onClose={closeExpenseForm} 
        expense={expenseToEdit} 
      />

      <DeleteConfirmation 
        isOpen={isDeleteModalOpen} 
        onClose={closeDeleteModal} 
        expenseId={expenseToDelete} 
      />
    </div>
  );
}