import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="h-20 w-20 text-destructive" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-foreground">Payment Failed</h1>
        
        <p className="text-muted-foreground mb-6">
          Unfortunately, your payment could not be processed. Please try again or contact support.
        </p>
        
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-destructive/80">
            <strong>Common issues:</strong>
          </p>
          <ul className="text-sm text-destructive/70 mt-2 space-y-1 text-left">
            <li>• Insufficient funds</li>
            <li>• Incorrect card details</li>
            <li>• Payment gateway timeout</li>
            <li>• Bank security restrictions</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <Button onClick={() => navigate("/billing")} className="w-full">
            Try Again
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6">
          Need help? Contact us at support@torqueninja.com
        </p>
      </Card>
    </div>
  );
};

export default PaymentFailure;
