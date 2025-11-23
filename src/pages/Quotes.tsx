import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToCSV, formatQuotesForExport } from "@/lib/csvExport";
import { logDataExported } from "@/lib/activityLogger";

const Quotes = () => {
  const navigate = useNavigate();

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data } = await supabase
        .from("quotes")
        .select("*, clients(name, email)")
        .eq("company_id", profile?.company_id)
        .order("created_at", { ascending: false });

      return data;
    },
  });

  const handleExport = async () => {
    if (!quotes || quotes.length === 0) return;
    
    const clients = quotes.map(q => q.clients).filter(Boolean);
    const formatted = formatQuotesForExport(quotes, clients);
    exportToCSV(formatted, `quotes_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    await logDataExported('quotes', quotes.length);
  };

  const formatBDT = (amount: number) => {
    return `৳${parseFloat(amount.toString()).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
            <p className="text-muted-foreground">
              Manage your sales quotes and proposals
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!quotes || quotes.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => navigate("/quotes/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes?.map((quote) => (
                <TableRow
                  key={quote.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/quotes/${quote.id}`)}
                >
                  <TableCell className="font-medium">{quote.quote_number}</TableCell>
                  <TableCell>{quote.clients?.name}</TableCell>
                  <TableCell>
                    {new Date(quote.issue_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {quote.expiry_date
                      ? new Date(quote.expiry_date).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>{formatBDT(quote.total)}</TableCell>
                  <TableCell>
                    <Badge variant={quote.status === "sent" ? "default" : "secondary"}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Quotes;
