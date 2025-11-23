import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CreditCard, DollarSign, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total companies
      const { count: totalCompanies } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true });

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from("company_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get trial subscriptions
      const { count: trialSubscriptions } = await supabase
        .from("company_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "trial");

      // Get total revenue
      const { data: revenueData } = await supabase
        .from("company_subscriptions")
        .select("amount_paid");

      const totalRevenue = revenueData?.reduce((sum, sub) => sum + (sub.amount_paid || 0), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        totalCompanies: totalCompanies || 0,
        activeSubscriptions: activeSubscriptions || 0,
        trialSubscriptions: trialSubscriptions || 0,
        totalRevenue,
      };
    },
  });

  const { data: recentUsers } = useQuery({
    queryKey: ["recent-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, email, created_at, company_id, companies(name)")
        .order("created_at", { ascending: false })
        .limit(10);

      return data || [];
    },
  });

  const { data: recentSubscriptions } = useQuery({
    queryKey: ["recent-subscriptions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_subscriptions")
        .select(`
          id,
          status,
          created_at,
          amount_paid,
          currency,
          company_id,
          companies(name),
          subscription_plans(name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      return data || [];
    },
  });

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount).replace("BDT", "৳");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-20 bg-muted"></CardHeader>
                <CardContent className="h-24 bg-muted/50"></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Registered accounts",
      color: "text-blue-500",
    },
    {
      title: "Total Companies",
      value: stats?.totalCompanies || 0,
      icon: Building2,
      description: "Active businesses",
      color: "text-green-500",
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      description: `${stats?.trialSubscriptions || 0} on trial`,
      color: "text-purple-500",
    },
    {
      title: "Total Revenue",
      value: formatBDT(stats?.totalRevenue || 0),
      icon: DollarSign,
      description: "All time",
      color: "text-primary",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform-wide statistics and recent activity</p>
          </div>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            SUPER ADMIN
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent User Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.companies && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Company: {user.companies.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent user registrations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubscriptions && recentSubscriptions.length > 0 ? (
                  recentSubscriptions.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{sub.companies?.name || 'Unknown Company'}</p>
                        <p className="text-sm text-muted-foreground">
                          {sub.subscription_plans?.name || 'Unknown Plan'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {sub.status}
                          </Badge>
                          {sub.amount_paid && (
                            <span className="text-xs text-muted-foreground">
                              {sub.currency === 'BDT' ? formatBDT(sub.amount_paid) : `$${sub.amount_paid}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent subscriptions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
