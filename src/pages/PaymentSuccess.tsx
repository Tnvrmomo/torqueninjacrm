import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/billing");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-foreground">Payment Successful!</h1>
        
        <p className="text-muted-foreground mb-6">
          Your payment has been processed successfully. Your subscription has been upgraded.
        </p>
        
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            Redirecting to billing page in <span className="font-bold text-primary text-lg">{countdown}</span> seconds...
          </p>
        </div>
        
        <Button onClick={() => navigate("/billing")} className="w-full">
          Go to Billing Now
        </Button>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
