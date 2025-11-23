import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";

interface UpgradePromptProps {
  feature: string;
  currentCount: number;
  limit: number | null;
  open: boolean;
  onClose: () => void;
}

export const UpgradePrompt = ({ feature, currentCount, limit, open, onClose }: UpgradePromptProps) => {
  const navigate = useNavigate();
  
  const featureNames: Record<string, string> = {
    products: 'Products',
    invoices: 'Invoices',
    quotes: 'Quotes',
    ai_queries: 'AI Queries'
  };

  const handleUpgrade = () => {
    onClose();
    navigate('/billing');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle>Upgrade Required</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            You've reached your plan limit for {featureNames[feature] || feature}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {currentCount} / {limit}
              </div>
              <div className="text-sm text-muted-foreground">
                {featureNames[feature] || feature} used
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Upgrade to Professional for:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>Unlimited {featureNames[feature] || feature}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>Advanced Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>Smart Notifications</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>1,000 AI Queries/month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="flex-1">
            View Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
