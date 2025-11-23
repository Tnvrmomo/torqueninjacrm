import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  name: string;
  features: any;
  ai_queries_limit: number | null;
  price_bdt: number;
  price_usd: number;
}

interface CompanySubscription {
  id: string;
  plan_id: string;
  status: string;
  currency: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  plan?: SubscriptionPlan;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscription: CompanySubscription | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSubscription = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return;
      }

      if (!profile?.company_id) {
        console.warn('No company_id found for user');
        return;
      }

      const { data: subscriptionData, error: subError } = await supabase
        .from('company_subscriptions')
        .select(`
          *,
          plan:subscription_plans(name, features, ai_queries_limit, price_bdt, price_usd)
        `)
        .eq('company_id', profile.company_id)
        .single();

      if (subError) {
        console.error('Subscription fetch error:', subError);
        return;
      }

      if (subscriptionData) {
        setSubscription(subscriptionData as any);
      }
    } catch (err) {
      console.error('Subscription fetch error:', err);
    }
  };

  const refreshSubscription = async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchSubscription(session.user.id);
        } else {
          setSubscription(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchSubscription(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, subscription, isLoading, signOut, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
