import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PaymentGateways = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["admin-payment-transactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_transactions")
        .select(`
          id,
          payment_method,
          amount_bdt,
          amount_usd,
          currency,
          status,
          created_at,
          company_id,
          companies(name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      return data || [];
    },
  });

  // Calculate gateway statistics
  const gatewayStats = transactions?.reduce((acc: any, txn: any) => {
    const method = txn.payment_method;
    if (!acc[method]) {
      acc[method] = {
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        revenue: 0,
      };
    }
    acc[method].total += 1;
    if (txn.status === 'completed') {
      acc[method].successful += 1;
      acc[method].revenue += txn.currency === 'BDT' ? (txn.amount_bdt || 0) : ((txn.amount_usd || 0) * 120);
    } else if (txn.status === 'failed') {
      acc[method].failed += 1;
    } else {
      acc[method].pending += 1;
    }
    return acc;
  }, {});

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount).replace("BDT", "৳");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Payment Gateways
          </h1>
          <p className="text-muted-foreground">
            Monitor payment gateway performance and transactions
          </p>
        </div>

        {/* Gateway Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(gatewayStats || {}).map(([gateway, stats]: [string, any]) => (
            <Card key={gateway}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{gateway}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Success:</span>
                  <span className="font-semibold">{stats.successful}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Failed:</span>
                  <span className="font-semibold">{stats.failed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-semibold text-primary">{formatBDT(stats.revenue)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Success Rate: {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn: any) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">
                        {txn.companies?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{txn.payment_method}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {txn.currency === 'BDT' 
                          ? formatBDT(txn.amount_bdt || 0)
                          : `$${txn.amount_usd || 0}`
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(txn.status)}
                          <Badge 
                            variant={
                              txn.status === 'completed' ? 'default' : 
                              txn.status === 'failed' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {txn.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(txn.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No transactions found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PaymentGateways;
