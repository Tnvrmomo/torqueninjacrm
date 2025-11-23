import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Clock, CheckCircle } from "lucide-react";

const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("status, total, balance");
      
      const draft = invoices?.filter(i => i.status === "draft").length || 0;
      const sent = invoices?.filter(i => i.status === "sent").length || 0;
      const overdue = invoices?.filter(i => i.status === "overdue").length || 0;
      const paid = invoices?.filter(i => i.status === "paid").length || 0;
      
      const totalRevenue = invoices?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;
      const outstanding = invoices?.reduce((sum, i) => sum + (i.balance || 0), 0) || 0;

      return {
        draft,
        sent,
        overdue,
        paid,
        totalRevenue,
        outstanding,
      };
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted"></CardHeader>
            <CardContent className="h-24 bg-muted/50"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatBDT(stats?.totalRevenue || 0),
      icon: DollarSign,
      description: "All time",
      color: "text-primary",
    },
    {
      title: "Outstanding",
      value: formatBDT(stats?.outstanding || 0),
      icon: Clock,
      description: `${stats?.sent || 0} sent, ${stats?.overdue || 0} overdue`,
      color: "text-status-overdue",
    },
    {
      title: "Paid Invoices",
      value: stats?.paid || 0,
      icon: CheckCircle,
      description: "Completed",
      color: "text-status-paid",
    },
    {
      title: "Draft Invoices",
      value: stats?.draft || 0,
      icon: FileText,
      description: "Not sent yet",
      color: "text-muted-foreground",
    },
  ];

  return (
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
  );
};

export default DashboardStats;
