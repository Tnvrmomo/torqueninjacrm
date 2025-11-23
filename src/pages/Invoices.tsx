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

const Invoices = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices", search],
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`invoice_number.ilike.%${search}%,po_number.ilike.%${search}%`);
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
      draft: "bg-status-draft",
      sent: "bg-status-sent",
      viewed: "bg-status-viewed",
      partial: "bg-status-partial",
      paid: "bg-status-paid",
      overdue: "bg-status-overdue",
    };
    return colors[status] || "bg-muted";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              Create and manage invoices
            </p>
          </div>
          <Button onClick={() => navigate("/invoices/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
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
        ) : invoices?.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {search ? "Try a different search term" : "Get started by creating your first invoice"}
              </p>
              <Button onClick={() => navigate("/invoices/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices?.map((invoice) => (
              <Card
                key={invoice.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/invoices/${invoice.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {invoice.invoice_number}
                      </h3>
                      <Badge className={getStatusColor(invoice.status || "draft")}>
                        {invoice.status?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.clients?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Issued: {format(new Date(invoice.issue_date), "dd MMM yyyy")}
                      {invoice.due_date && ` • Due: ${format(new Date(invoice.due_date), "dd MMM yyyy")}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatBDT(invoice.total)}
                    </div>
                    {invoice.balance > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Due: {formatBDT(invoice.balance)}
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

export default Invoices;
