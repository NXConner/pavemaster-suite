import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AuthRateLimiter, PasswordValidator } from '@/lib/security';

interface AuthResponse {
  error: AuthError | null;
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
      (event, session) => {
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    // Validate password strength
    const passwordValidation = PasswordValidator.validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        variant: 'destructive',
        title: 'Password too weak',
        description: passwordValidation.errors[0],
      });
      return { error: { message: passwordValidation.errors.join(', ') } as AuthError };
    }

    // Check rate limit
    const canAttempt = await AuthRateLimiter.checkRateLimit(email, 'signup');
    if (!canAttempt) {
      const remaining = AuthRateLimiter.getRemainingAttempts(email, 'signup');
      toast({
        variant: 'destructive',
        title: 'Too many attempts',
        description: `Please wait before trying again. Attempts remaining: ${remaining}`,
      });
      return { error: { message: 'Rate limit exceeded' } as AuthError };
    }

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

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign up failed',
        description: error.message,
      });
    } else {
      // Reset rate limit on success
      await AuthRateLimiter.reset(email, 'signup');
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation link.',
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Check rate limit
    const canAttempt = await AuthRateLimiter.checkRateLimit(email, 'signin');
    if (!canAttempt) {
      const remaining = AuthRateLimiter.getRemainingAttempts(email, 'signin');
      toast({
        variant: 'destructive',
        title: 'Account temporarily locked',
        description: `Too many failed attempts. Please wait before trying again. Attempts remaining: ${remaining}`,
      });
      return { error: { message: 'Rate limit exceeded' } as AuthError };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error.message,
      });
    } else {
      // Reset rate limit on success
      await AuthRateLimiter.reset(email, 'signin');
    }

    return { error };
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