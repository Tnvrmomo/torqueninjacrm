import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Zap, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

const AdminAnalytics = () => {
  const { data: aiUsage } = useQuery({
    queryKey: ["admin-ai-usage"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_usage")
        .select("usage_type, tokens_used, cost_bdt, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      return data || [];
    },
  });

  const { data: subscriptionStats } = useQuery({
    queryKey: ["admin-subscription-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_subscriptions")
        .select(`
          status,
          created_at,
          subscription_plans(name)
        `)
        .order("created_at", { ascending: false });

      return data || [];
    },
  });

  const { data: userGrowth } = useQuery({
    queryKey: ["admin-user-growth"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: true });

      return data || [];
    },
  });

  // Process AI usage data for charts
  const aiUsageByType = aiUsage?.reduce((acc: any, usage: any) => {
    const type = usage.usage_type;
    if (!acc[type]) {
      acc[type] = { type, tokens: 0, cost: 0, count: 0 };
    }
    acc[type].tokens += usage.tokens_used || 0;
    acc[type].cost += usage.cost_bdt || 0;
    acc[type].count += 1;
    return acc;
  }, {});

  const aiUsageChart = Object.values(aiUsageByType || {});

  // Process subscription data
  const subscriptionByPlan = subscriptionStats?.reduce((acc: any, sub: any) => {
    const plan = sub.subscription_plans?.name || 'Unknown';
    if (!acc[plan]) {
      acc[plan] = { plan, count: 0 };
    }
    acc[plan].count += 1;
    return acc;
  }, {});

  const subscriptionChart = Object.values(subscriptionByPlan || {});

  // Calculate totals
  const totalAITokens = aiUsage?.reduce((sum, usage) => sum + (usage.tokens_used || 0), 0) || 0;
  const totalAICost = aiUsage?.reduce((sum, usage) => sum + (usage.cost_bdt || 0), 0) || 0;
  const activeSubscriptions = subscriptionStats?.filter((s: any) => s.status === 'active').length || 0;
  const trialSubscriptions = subscriptionStats?.filter((s: any) => s.status === 'trial').length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Platform Analytics
          </h1>
          <p className="text-muted-foreground">
            Platform-wide usage statistics and trends
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userGrowth?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Tokens Used
              </CardTitle>
              <Zap className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAITokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total tokens consumed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Cost
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{totalAICost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total AI spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Subs
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground mt-1">{trialSubscriptions} on trial</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>AI Usage by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aiUsageChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Query Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscriptions by Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subscriptionChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Subscribers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">AI Queries (Last 100)</p>
                <p className="text-2xl font-bold mt-2">{aiUsage?.length || 0}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Avg Tokens per Query</p>
                <p className="text-2xl font-bold mt-2">
                  {aiUsage && aiUsage.length > 0
                    ? Math.round(totalAITokens / aiUsage.length)
                    : 0}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold mt-2">{subscriptionStats?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminAnalytics;
