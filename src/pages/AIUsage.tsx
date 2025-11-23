import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Download, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";

const AIUsage = () => {
  const { user, subscription } = useAuth();
  const [selectedMonth] = useState(new Date());

  const { data: usage, isLoading } = useQuery({
    queryKey: ["ai-usage", user?.id, selectedMonth],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user?.id)
        .single();

      if (!profile?.company_id) return [];

      const { data, error } = await supabase
        .from("ai_usage")
        .select("*")
        .eq("company_id", profile.company_id)
        .gte("created_at", startOfMonth(selectedMonth).toISOString())
        .lte("created_at", endOfMonth(selectedMonth).toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const totalQueries = usage?.length || 0;
  const totalTokens = usage?.reduce((sum, item) => sum + (item.tokens_used || 0), 0) || 0;
  const totalCost = usage?.reduce((sum, item) => sum + (item.cost_bdt || 0), 0) || 0;
  
  const limit = subscription?.plan?.ai_queries_limit || 100;
  const usagePercent = (totalQueries / limit) * 100;

  const usageByType = usage?.reduce((acc: any, item) => {
    acc[item.usage_type] = (acc[item.usage_type] || 0) + 1;
    return acc;
  }, {}) || {};

  const handleExport = () => {
    const csv = [
      ["Date", "Type", "Queries", "Tokens", "Cost (BDT)"].join(","),
      ...(usage || []).map(item => [
        format(new Date(item.created_at!), "yyyy-MM-dd HH:mm"),
        item.usage_type,
        "1",
        item.tokens_used || 0,
        item.cost_bdt || 0,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-usage-${format(selectedMonth, "yyyy-MM")}.csv`;
    a.click();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Usage Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your AI queries, tokens, and costs
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQueries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {limit - totalQueries} remaining this month
              </p>
              <Progress value={usagePercent} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all queries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(selectedMonth, "MMMM yyyy")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usage by Type</CardTitle>
            <CardDescription>Breakdown of AI queries by feature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(usageByType).map(([type, count]: [string, any]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{type}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {count} {count === 1 ? 'query' : 'queries'}
                    </span>
                    <div className="w-32">
                      <Progress value={(count / totalQueries) * 100} />
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(usageByType).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No AI usage data for this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest AI queries and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usage?.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{item.usage_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.created_at!), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.tokens_used} tokens</p>
                    <p className="text-xs text-muted-foreground">৳{item.cost_bdt?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {(!usage || usage.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AIUsage;
