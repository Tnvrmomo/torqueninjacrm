import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: expense, isLoading } = useQuery({
    queryKey: ["expense", id],
    queryFn: async () => {
      const { data } = await supabase.from("expenses").select("*").eq("id", id!).single();
      return data;
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("expenses").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Success", description: "Expense deleted successfully" });
      navigate("/expenses");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const formatBDT = (amount: number) => {
    return `৳${parseFloat(amount.toString()).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Card className="p-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!expense) {
    return (
      <MainLayout>
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Expense not found</h3>
            <Button onClick={() => navigate("/expenses")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Expenses
            </Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/expenses")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Expense Details</h1>
              <p className="text-muted-foreground">{format(new Date(expense.expense_date), "dd MMM yyyy")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/expenses/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteExpenseMutation.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Amount</div>
              <div className="text-3xl font-bold text-primary">{formatBDT(expense.amount)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Category</div>
              <div className="text-xl font-semibold capitalize">{expense.category}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{format(new Date(expense.expense_date), "dd MMM yyyy")}</span>
            </div>
            {expense.vendor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-medium">{expense.vendor}</span>
              </div>
            )}
            {expense.payment_method && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">{expense.payment_method.replace("_", " ")}</span>
              </div>
            )}
            {expense.description && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description:</span>
                <span className="font-medium">{expense.description}</span>
              </div>
            )}
          </div>
        </Card>

        {expense.notes && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Notes</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{expense.notes}</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ExpenseDetail;
