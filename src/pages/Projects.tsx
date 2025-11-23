import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Projects = () => {
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { data } = await supabase
        .from("projects")
        .select("*, clients(name)")
        .eq("company_id", profile?.company_id)
        .order("created_at", { ascending: false });

      return data;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      design: "bg-blue-500",
      production: "bg-yellow-500",
      delivery: "bg-green-500",
      completed: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage custom orders and projects
            </p>
          </div>
          <Button onClick={() => navigate("/projects/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.clients?.name || "-"}</TableCell>
                  <TableCell>
                    {project.start_date
                      ? new Date(project.start_date).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {project.due_date
                      ? new Date(project.due_date).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status || "design")}>
                      {project.status}
                    </Badge>
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

export default Projects;
