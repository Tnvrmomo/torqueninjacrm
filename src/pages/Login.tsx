import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Check if user has profile and company
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", data.user.id)
        .single();

      if (!profile) {
        toast({
          title: "Account Setup Error",
          description: "Your account is incomplete. Please contact support.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check email verification (if required)
      if (!data.user.email_confirmed_at) {
        navigate("/verify-pending");
        setLoading(false);
        return;
      }

      // Check user role for redirection
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Redirect based on role
      if (roleData?.role === 'super_admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-primary">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Torque Stickers" className="h-16" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          
          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
              Forgot your password?
            </Link>
          </div>
        </form>
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
