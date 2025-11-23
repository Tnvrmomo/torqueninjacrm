import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const Payments = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", search],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select("*, clients(name), invoices(invoice_number)")
        .order("payment_date", { ascending: false });

      if (search) {
        query = query.or(`payment_number.ilike.%${search}%,reference.ilike.%${search}%`);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount).replace("BDT", "৳");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-status-paid",
      pending: "bg-status-sent",
      failed: "bg-status-overdue",
      refunded: "bg-muted",
    };
    return colors[status] || "bg-muted";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">
              Track and manage payments
            </p>
          </div>
          <Button onClick={() => navigate("/payments/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-24"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : payments?.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground mb-4">
                {search ? "Try a different search term" : "Get started by recording your first payment"}
              </p>
              <Button onClick={() => navigate("/payments/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments?.map((payment) => (
              <Card
                key={payment.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {payment.payment_number}
                      </h3>
                      <Badge className={getStatusColor(payment.status || "completed")}>
                        {payment.status?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.clients?.name}
                      {payment.invoices && ` • ${payment.invoices.invoice_number}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.payment_date), "dd MMM yyyy")}
                      {payment.payment_method && ` • ${payment.payment_method}`}
                      {payment.reference && ` • Ref: ${payment.reference}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatBDT(payment.amount)}
                    </div>
                    {payment.refund_amount && payment.refund_amount > 0 && (
                      <p className="text-sm text-destructive">
                        Refunded: {formatBDT(payment.refund_amount)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Payments;
