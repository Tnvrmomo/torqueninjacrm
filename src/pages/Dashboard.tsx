import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import StockSummaryWidget from "@/components/dashboard/StockSummaryWidget";
import AIInsightsWidget from "@/components/dashboard/AIInsightsWidget";
import { PaymentModal } from "@/components/billing/PaymentModal";

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { data: customization } = useQuery({
    queryKey: ['dashboard-customization', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
        
      if (!profile) return null;

      const { data } = await supabase
        .from('dashboard_customization')
        .select('*')
        .eq('company_id', profile.company_id)
        .single();
        
      return data;
    },
    enabled: !!user
  });
  
  const visibleModules = (customization?.visible_modules as string[]) || 
    ['inventory', 'quotes', 'invoices', 'clients', 'analytics'];
  
  // Show payment modal after 30 seconds on dashboard for trial users
  useEffect(() => {
    if (subscription?.status === 'trial') {
      const timer = setTimeout(() => {
        setShowPaymentModal(true);
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [subscription]);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to TorqueNinja Business Management
          </p>
        </div>

        <DashboardStats />

        <div className="grid gap-6 md:grid-cols-2">
          <QuickActions />
          <RecentActivity />
        </div>

        {visibleModules.includes('inventory') && (
          <StockSummaryWidget />
        )}

        {visibleModules.includes('analytics') && (
          <AIInsightsWidget />
        )}
      </div>

      <PaymentModal 
        show={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
    </MainLayout>
  );
};

export default Dashboard;
