import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AIInsightsWidget() {
  const { user } = useAuth();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-insights-widget', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'business_insight')
        .order('created_at', { ascending: false })
        .limit(1);
      
      return data || [];
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) return null;

  const latestInsight = insights[0];
  
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Business Insights
          <TrendingUp className="h-4 w-4 ml-auto text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(latestInsight.created_at), { addSuffix: true })}
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {latestInsight.message}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
