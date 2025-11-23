import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Shield } from "lucide-react";

export default function AdminSubscriptions() {
  const { user } = useAuth();
  
  const { data: isAdmin, isLoading: isLoadingRole } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      return !!data;
    },
    enabled: !!user
  });
  
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('company_subscriptions')
        .select('*, companies(name, email), subscription_plans(name, price_bdt, price_usd)')
        .order('created_at', { ascending: false });
      
      return data || [];
    },
    enabled: isAdmin === true
  });

  if (isLoadingRole) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trial: "secondary",
      expired: "destructive",
      cancelled: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status?.toUpperCase()}</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
            <p className="text-muted-foreground">View and manage all customer subscriptions</p>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-6 animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </Card>
        ) : !subscriptions || subscriptions.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
              <p className="text-muted-foreground">Subscriptions will appear here as users sign up</p>
            </div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Trial Ends</TableHead>
                  <TableHead>Period End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{sub.companies?.name}</div>
                        <div className="text-xs text-muted-foreground">{sub.companies?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{sub.subscription_plans?.name}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      {sub.amount_paid 
                        ? `${sub.currency === 'BDT' ? '৳' : '$'}${sub.amount_paid}` 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(sub.created_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      {sub.trial_ends_at 
                        ? format(new Date(sub.trial_ends_at), 'dd MMM yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {sub.current_period_end 
                        ? format(new Date(sub.current_period_end), 'dd MMM yyyy')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
