import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
        .select("*, clients(name)")
        .eq("company_id", profile?.company_id)
        .order("created_at", { ascending: false });

      return data;
    },
  });

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
          <Button onClick={() => navigate("/quotes/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
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
