import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UsageWarningProps {
  feature: string;
  current: number;
  limit: number;
}

export const UsageWarning = ({ feature, current, limit }: UsageWarningProps) => {
  const navigate = useNavigate();
  const percent = (current / limit) * 100;

  if (percent < 80) return null;

  return (
    <Alert variant={percent >= 95 ? "destructive" : "default"} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Usage Limit Warning</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          You've used {current} of {limit} {feature} ({percent.toFixed(0)}% of your plan limit)
        </span>
        <Button size="sm" variant="outline" onClick={() => navigate("/billing")}>
          Upgrade Plan
        </Button>
      </AlertDescription>
    </Alert>
  );
};
