import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  DollarSign,
  ListFilter,
  Tag,
  FileText,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Expense, categories, insertExpenseSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export default function ExpenseForm({
  isOpen,
  onClose,
  expense,
}: ExpenseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formSchema = insertExpenseSchema.omit({ userId: true }).extend({
    amount: z.coerce.number().positive("Amount must be positive"),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        notes: expense.notes || "",
      });
    } else {
      form.reset({
        description: "",
        amount: 0,
        category: "Food",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [expense, form, isOpen]);

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/expenses", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/expenses/stats/summary"],
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormValues & { id: number }) => {
      const res = await apiRequest("PUT", `/api/expenses/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/expenses/stats/summary"],
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (expense?.id) {
        await updateMutation.mutateAsync({ ...values, id: expense.id });
      } else {
        await createMutation.mutateAsync(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {expense ? "Edit Expense" : "Track New Expense"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {expense
              ? "Update your expense details below"
              : "Keep track of your spending by filling out this form"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-gray-700">
                    <Tag className="h-4 w-4 mr-1.5 text-gray-500" />
                    Description *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What did you spend on?"
                      className="focus-visible:ring-gray-400 bg-white border-gray-300 text-gray-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-gray-700">
                    <DollarSign className="h-4 w-4 mr-1.5 text-gray-500" />
                    Amount *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 inset-y-0 flex items-center text-gray-500">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-8 focus-visible:ring-gray-400 bg-white border-gray-300 text-gray-800"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Enter the amount you spent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-gray-700">
                    <ListFilter className="h-4 w-4 mr-1.5 text-gray-500" />
                    Category *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-gray-400 bg-white border-gray-300 text-gray-800">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-gray-700">
                    <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                    Date *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="focus-visible:ring-gray-400 bg-white border-gray-300 text-gray-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-gray-700">
                    <FileText className="h-4 w-4 mr-1.5 text-gray-500" />
                    Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add additional details..."
                      className="resize-none focus-visible:ring-gray-400 bg-white border-gray-300 text-gray-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gray-700 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : expense ? (
                  "Update Expense"
                ) : (
                  "Add Expense"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
