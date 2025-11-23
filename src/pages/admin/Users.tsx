import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users as UsersIcon } from "lucide-react";
import { format } from "date-fns";

export default function Users() {
  const { user } = useAuth();

  const { data: isSuperAdmin, isLoading: isLoadingRole } = useQuery({
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

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*, companies(name), user_roles(role)')
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: isSuperAdmin === true
  });

  if (isLoadingRole) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
            <p className="text-muted-foreground">Manage all platform users across companies</p>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-6 animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </Card>
        ) : !allUsers || allUsers.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">Users will appear here as they sign up</p>
            </div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((profile: any) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.companies?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{profile.role || 'user'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                        {profile.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.created_at 
                        ? format(new Date(profile.created_at), 'dd MMM yyyy')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
