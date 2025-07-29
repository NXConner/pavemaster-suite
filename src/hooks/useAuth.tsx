import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { toast } from './use-toast';

interface AuthResponse {
  error: AuthError | { message: string } | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: any, session: any) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: 'Welcome!',
            description: 'You have been signed in successfully.',
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Signed out',
            description: 'You have been signed out.',
          });
        }
      },
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      // TODO: Re-enable rate limiting once RPC functions are deployed
      // const clientIP = await getClientIP();
      // const { data: canProceed } = await supabase.rpc('check_rate_limit', {
      //   p_identifier: clientIP,
      //   p_action: 'signup_attempt',
      //   p_limit: 3,
      //   p_window_minutes: 15
      // });

      // if (!canProceed) {
      //   const error = { message: 'Too many signup attempts. Please try again later.' };
      //   toast({
      //     variant: 'destructive',
      //     title: 'Rate limit exceeded',
      //     description: error.message,
      //   });
      //   return { error };
      // }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      // TODO: Re-enable security logging once RPC functions are deployed
      // if (!error) {
      //   await supabase.rpc('log_security_event', {
      //     p_action: 'user_signup',
      //     p_resource_type: 'auth',
      //     p_details: { email, timestamp: new Date().toISOString() }
      //   });
      // }

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign up failed',
          description: error.message,
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link.',
        });
      }

      return { error };
    } catch (err: any) {
      const error = { message: 'An unexpected error occurred' };
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      return { error };
    }
  };

  // TODO: Re-enable IP detection function once RPC functions are deployed
  // const getClientIP = async (): Promise<string> => {
  //   try {
  //     const response = await fetch('https://api.ipify.org?format=json');
  //     const data = await response.json();
  //     return data.ip;
  //   } catch {
  //     return 'unknown';
  //   }
  // };

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Re-enable rate limiting once RPC functions are deployed
      // const clientIP = await getClientIP();
      // const { data: canProceed } = await supabase.rpc('check_rate_limit', {
      //   p_identifier: `${clientIP}-${email}`,
      //   p_action: 'login_attempt',
      //   p_limit: 5,
      //   p_window_minutes: 15
      // });

      // if (!canProceed) {
      //   const error = { message: 'Too many login attempts. Please try again later.' };
      //   toast({
      //     variant: 'destructive',
      //     title: 'Rate limit exceeded',
      //     description: error.message,
      //   });
      //   return { error };
      // }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // TODO: Re-enable security logging once RPC functions are deployed
      // if (!error) {
      //   await supabase.rpc('log_security_event', {
      //     p_action: 'user_signin',
      //     p_resource_type: 'auth',
      //     p_details: { email, timestamp: new Date().toISOString() }
      //   });
      // } else {
      //   // Log failed login attempt
      //   await supabase.rpc('log_security_event', {
      //     p_action: 'failed_signin',
      //     p_resource_type: 'auth',
      //     p_details: { email, error: error.message, timestamp: new Date().toISOString() }
      //   });
      // }

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: error.message,
        });
      }

      return { error };
    } catch (err: any) {
      const error = { message: 'An unexpected error occurred' };
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error signing out',
        description: error.message,
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error sending reset email',
          description: error.message,
        });
        return { error };
      }
      toast({
        title: 'Password reset email sent!',
        description: 'Check your inbox for the reset link.',
      });
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}