import { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionRouteProps {
  children: ReactNode;
}

export const SubscriptionRoute = ({ children }: SubscriptionRouteProps) => {
  const { subscription, user } = useAuth();
  const navigate = useNavigate();
  
  // Check if super admin
  const { data: isSuperAdmin } = useQuery({
    queryKey: ['is-super-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .single();
      return !!data;
    },
    enabled: !!user
  });
  
  // Super admin bypasses all subscription checks
  if (isSuperAdmin) {
    return <>{children}</>;
  }
  
  // Allow trial and active subscriptions
  if (subscription?.status === 'trial' || subscription?.status === 'active') {
    // Show trial warning banner if ending soon
    if (subscription.status === 'trial' && subscription.trial_ends_at) {
      const daysLeft = Math.ceil(
        (new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysLeft <= 3 && daysLeft > 0) {
        return (
          <>
            <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-orange-800 dark:text-orange-200">
                  Your trial ends in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/billing');
                  }}
                  className="ml-4 border-orange-600 text-orange-600 hover:bg-orange-100"
                >
                  Upgrade Now
                </Button>
              </AlertDescription>
            </Alert>
            {children}
          </>
        );
      }
    }
    
    return <>{children}</>;
  }
  
  // Redirect to billing if expired/cancelled
  return <Navigate to="/billing" replace />;
};
