import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*, clients(name)")
        .eq("id", id!)
        .single();
      return data;
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Success", description: "Project deleted successfully" });
      navigate("/projects");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Card className="p-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Project not found</h3>
            <Button onClick={() => navigate("/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <Badge className={getStatusColor(project.status || "design")}>
                  {project.status?.toUpperCase()}
                </Badge>
              </div>
              {project.clients && <p className="text-muted-foreground">{project.clients.name}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteProjectMutation.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Project Details</h2>
          <div className="space-y-3">
            {project.clients && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{project.clients.name}</span>
              </div>
            )}
            {project.start_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">{format(new Date(project.start_date), "dd MMM yyyy")}</span>
              </div>
            )}
            {project.due_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">{format(new Date(project.due_date), "dd MMM yyyy")}</span>
              </div>
            )}
            {project.completion_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completion Date:</span>
                <span className="font-medium">{format(new Date(project.completion_date), "dd MMM yyyy")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(project.status || "design")}>
                {project.status}
              </Badge>
            </div>
          </div>
        </Card>

        {project.description && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Description</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
          </Card>
        )}

        {project.notes && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Notes</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectDetail;
