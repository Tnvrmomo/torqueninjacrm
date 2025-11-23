import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileText, Users, Package } from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "New Invoice",
      icon: FileText,
      onClick: () => navigate("/invoices/new"),
      variant: "default" as const,
    },
    {
      title: "New Client",
      icon: Users,
      onClick: () => navigate("/clients/new"),
      variant: "outline" as const,
    },
    {
      title: "New Product",
      icon: Package,
      onClick: () => navigate("/products/new"),
      variant: "outline" as const,
    },
    {
      title: "Import CSV",
      icon: Upload,
      onClick: () => navigate("/import"),
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              onClick={action.onClick}
              className="h-auto flex-col gap-2 py-4"
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
