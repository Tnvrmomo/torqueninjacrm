import { useState } from "react";
import { Mail, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  // Only show if user exists and email is not confirmed
  if (!user || user.email_confirmed_at || dismissed) return null;

  const handleResend = async () => {
    if (!user.email) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Verification email has been resent.",
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
    <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1">
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Please verify your email address.</strong> Check your inbox for a verification link.
            </AlertDescription>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResend}
              disabled={resending}
              className="mt-2 border-amber-600 text-amber-600 hover:bg-amber-100"
            >
              {resending ? "Sending..." : "Resend Email"}
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};
