import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const VerifyPending = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No email address found",
        variant: "destructive",
      });
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Verification email has been resent. Please check your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-10 w-10 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-foreground">Check Your Email</h1>
        
        <p className="text-muted-foreground mb-2">
          We've sent a verification email to:
        </p>
        
        <p className="font-semibold text-lg mb-6 text-foreground">
          {user?.email || "your email address"}
        </p>
        
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Important:</strong> Please click the verification link in the email to activate your account.
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-sm text-muted-foreground">
            <ArrowRight className="inline h-4 w-4 mr-1" />
            Check your spam/junk folder if you don't see it
          </p>
          <p className="text-sm text-muted-foreground">
            <ArrowRight className="inline h-4 w-4 mr-1" />
            The verification link expires in 24 hours
          </p>
        </div>
        
        <Button 
          onClick={handleResendEmail} 
          disabled={resending}
          variant="outline"
          className="w-full"
        >
          {resending ? "Sending..." : "Resend Verification Email"}
        </Button>
        
        <p className="text-xs text-muted-foreground mt-6">
          Need help? Contact us at support@torqueninja.com
        </p>
      </Card>
    </div>
  );
};

export default VerifyPending;
