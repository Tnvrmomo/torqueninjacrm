import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentGatewaySelector } from "@/components/billing/PaymentGatewaySelector";
import { AIUsageBilling } from "@/components/billing/AIUsageBilling";
import { format } from "date-fns";
import { CreditCard, TrendingUp, Zap } from "lucide-react";

const Billing = () => {
  const { subscription, refreshSubscription } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [aiUsage, setAiUsage] = useState({ total: 0, cost_bdt: 0, cost_usd: 0 });

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    // Fetch transactions
    const { data: txns } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .limit(10);

    setTransactions(txns || []);

    // Fetch AI usage
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('tokens_used, cost_bdt, cost_usd')
      .eq('company_id', profile.company_id);

    if (usage) {
      const totals = usage.reduce((acc, curr) => ({
        total: acc.total + (curr.tokens_used || 0),
        cost_bdt: acc.cost_bdt + (curr.cost_bdt || 0),
        cost_usd: acc.cost_usd + (curr.cost_usd || 0)
      }), { total: 0, cost_bdt: 0, cost_usd: 0 });
      setAiUsage(totals);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and payment methods</p>
        </div>

        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Subscription</span>
              <Badge className={getStatusColor(subscription?.status || 'inactive')}>
                {subscription?.status || 'No subscription'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {subscription?.plan?.name} Plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="text-lg font-semibold">{subscription.currency}</p>
                  </div>
                  {subscription.trial_ends_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Trial Ends</p>
                      <p className="text-lg font-semibold">
                        {format(new Date(subscription.trial_ends_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                  {subscription.current_period_end && (
                    <div>
                      <p className="text-sm text-muted-foreground">Renewal Date</p>
                      <p className="text-lg font-semibold">
                        {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
                
                {!showPayment && (
                  <Button onClick={() => setShowPayment(true)} className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                )}
              </>
            )}

            {showPayment && subscription && (
              <PaymentGatewaySelector
                planId={subscription.plan_id}
                currency={subscription.currency as "BDT" | "USD"}
                amount={subscription.currency === "BDT" ? subscription.plan?.price_bdt || 0 : subscription.plan?.price_usd || 0}
                onSuccess={() => {
                  setShowPayment(false);
                  refreshSubscription();
                }}
              />
            )}
          </CardContent>
        </Card>


        {/* AI Usage Billing Component */}
        <AIUsageBilling />

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No payment history yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((txn: any) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{txn.payment_method.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(txn.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {txn.currency === 'BDT' ? '৳' : '$'}
                        {txn.amount_bdt || txn.amount_usd}
                      </p>
                      <Badge variant={txn.status === 'completed' ? 'default' : 'secondary'}>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Billing;
