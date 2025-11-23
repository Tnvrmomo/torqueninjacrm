import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AIUsageBilling = () => {
  const { user, subscription } = useAuth();

  const { data: aiUsage } = useQuery({
    queryKey: ['ai-usage', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return null;

      // Get current month's usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('company_id', profile.company_id)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      const totalQueries = data?.length || 0;
      const totalCostBDT = data?.reduce((sum, item) => sum + (item.cost_bdt || 0), 0) || 0;
      const totalCostUSD = data?.reduce((sum, item) => sum + (item.cost_usd || 0), 0) || 0;
      const totalTokens = data?.reduce((sum, item) => sum + (item.tokens_used || 0), 0) || 0;

      return {
        totalQueries,
        totalCostBDT,
        totalCostUSD,
        totalTokens,
        records: data || []
      };
    },
    enabled: !!user
  });

  const planLimit = subscription?.plan?.ai_queries_limit || 0;
  const usagePercent = planLimit > 0 ? Math.min((aiUsage?.totalQueries || 0) / planLimit * 100, 100) : 0;
  const isNearLimit = usagePercent >= 80;
  const isOverLimit = (aiUsage?.totalQueries || 0) > planLimit && planLimit > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Usage This Month
          </CardTitle>
          <CardDescription>
            Track your AI assistant queries and costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Queries</p>
              <p className="text-2xl font-bold">{aiUsage?.totalQueries || 0}</p>
              {planLimit > 0 && (
                <p className="text-xs text-muted-foreground">
                  of {planLimit} included
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tokens Used</p>
              <p className="text-2xl font-bold">
                {(aiUsage?.totalTokens || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                ~{Math.round((aiUsage?.totalTokens || 0) / 1000)}K tokens
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Cost</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  ৳{(aiUsage?.totalCostBDT || 0).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${(aiUsage?.totalCostUSD || 0).toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>

          {/* Usage Bar */}
          {planLimit > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage</span>
                <span className={isOverLimit ? "text-destructive font-semibold" : ""}>
                  {usagePercent.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={usagePercent} 
                className={isOverLimit ? "bg-destructive/20" : isNearLimit ? "bg-orange-500/20" : ""}
              />
            </div>
          )}

          {/* Warnings */}
          {isOverLimit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've exceeded your monthly AI query limit. Additional usage will be billed separately.
              </AlertDescription>
            </Alert>
          )}

          {isNearLimit && !isOverLimit && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                You're approaching your monthly limit. Consider upgrading to avoid extra charges.
              </AlertDescription>
            </Alert>
          )}

          {/* Pricing Info */}
          <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Usage-Based Pricing
            </p>
            <p className="text-muted-foreground">
              Additional queries: ৳5 per 100 queries (or $0.05 USD)
            </p>
            <p className="text-muted-foreground text-xs">
              Unlimited AI queries available with Lifetime plan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};