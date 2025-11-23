import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
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
        
        <h1 className="text-3xl font-bold mb-4 text-foreground">Email Verified!</h1>
        
        <p className="text-muted-foreground mb-6">
          Your email has been successfully verified. Welcome to TorqueNinja!
        </p>
        
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard in <span className="font-bold text-primary text-lg">{countdown}</span> seconds...
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground">
          You can now access all features with your 7-day free trial.
        </p>
      </Card>
    </div>
  );
};

export default VerifyEmail;
