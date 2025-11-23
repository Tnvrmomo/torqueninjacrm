import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ActivityLog = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data } = await supabase
        .from("activity_log")
        .select("*")
        .eq("company_id", profile?.company_id)
        .order("activity_date", { ascending: false })
        .limit(100);

      return data;
    },
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            View recent system activities and changes
          </p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities?.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {new Date(activity.activity_date).toLocaleString()}
                  </TableCell>
                  <TableCell>{activity.activity}</TableCell>
                  <TableCell>{activity.entity_type || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {activity.ip_address || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ActivityLog;
