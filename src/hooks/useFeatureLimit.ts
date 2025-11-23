import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type FeatureType = 'products' | 'invoices' | 'quotes' | 'ai_queries';

export const useFeatureLimit = (feature: FeatureType) => {
  const { user, subscription } = useAuth();
  
  const { data: currentCount, isLoading } = useQuery({
    queryKey: [feature, 'count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      if (!profile) return 0;
      
      if (feature === 'products') {
        const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id);
        return count || 0;
      } else if (feature === 'invoices') {
        const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id);
        return count || 0;
      } else if (feature === 'quotes') {
        const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id);
        return count || 0;
      } else {
        const { count } = await supabase.from('ai_usage').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id);
        return count || 0;
      }
    },
    enabled: !!user,
  });

  const plan = subscription?.plan;
  const limit = plan?.features?.[`${feature}_limit`];
  const canAdd = limit === null || limit === undefined || (currentCount ?? 0) < limit;
  
  return {
    canAdd,
    limitReached: !canAdd,
    currentCount: currentCount || 0,
    limit: limit || null,
    planName: plan?.name || 'Unknown',
    isLoading
  };
};
