import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  authRateLimiter,
  validateEmail,
  validatePassword,
  logSecurityEvent,
  sanitizeInput,
} from '@/lib/security';

interface SecureAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  rateLimitRemaining: number;
}

interface AuthAttempt {
  success: boolean;
  timestamp: number;
  identifier: string;
}

export function useSecureAuth() {
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
    rateLimitRemaining: 5,
  });

  const [recentAttempts, setRecentAttempts] = useState<AuthAttempt[]>([]);

  // Get client identifier for rate limiting
  const getClientIdentifier = useCallback(() => {
    return `auth_${Date.now()}_${Math.random()}`;
  }, []);

  // Update rate limit remaining count
  const updateRateLimitRemaining = useCallback(() => {
    const identifier = getClientIdentifier();
    const remaining = authRateLimiter.getRemainingAttempts(identifier);
    setAuthState(prev => ({ ...prev, rateLimitRemaining: remaining }));
  }, [getClientIdentifier]);

  // Enhanced sign up with security checks
  const signUp = useCallback(async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => {
    const identifier = getClientIdentifier();

    // Check rate limit
    if (!authRateLimiter.isAllowed(identifier)) {
      const error = 'Too many signup attempts. Please wait before trying again.';
      toast.error(error);
      await logSecurityEvent('signup_rate_limit_exceeded', 'auth', undefined, { email });
      return { error };
    }

    // Validate inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedFirstName = firstName ? sanitizeInput(firstName) : '';
    const sanitizedLastName = lastName ? sanitizeInput(lastName) : '';

    if (!validateEmail(sanitizedEmail)) {
      const error = 'Please enter a valid email address';
      toast.error(error);
      return { error };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      const error = passwordValidation.errors.join(', ');
      toast.error(error);
      return { error };
    }

    try {
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName,
          },
        },
      });

      if (error) {
        await logSecurityEvent('signup_failed', 'auth', undefined, {
          email: sanitizedEmail,
          error: error.message,
        });
        setRecentAttempts(prev => [...prev, {
          success: false,
          timestamp: Date.now(),
          identifier,
        }]);
        return { error: error.message };
      }

      await logSecurityEvent('signup_successful', 'auth', undefined, {
        email: sanitizedEmail,
      });

      setRecentAttempts(prev => [...prev, {
        success: true,
        timestamp: Date.now(),
        identifier,
      }]);

      toast.success('Account created successfully! Please check your email to confirm your account.');
      return { error: null };
    } catch (error: any) {
      await logSecurityEvent('signup_error', 'auth', undefined, {
        email: sanitizedEmail,
        error: error.message,
      });
      return { error: error.message };
    } finally {
      updateRateLimitRemaining();
    }
  }, [getClientIdentifier, updateRateLimitRemaining]);

  // Enhanced sign in with security checks
  const signIn = useCallback(async (email: string, password: string) => {
    const identifier = getClientIdentifier();

    // Check rate limit
    if (!authRateLimiter.isAllowed(identifier)) {
      const error = 'Too many login attempts. Please wait before trying again.';
      toast.error(error);
      await logSecurityEvent('login_rate_limit_exceeded', 'auth', undefined, { email });
      return { error };
    }

    // Validate inputs
    const sanitizedEmail = sanitizeInput(email);

    if (!validateEmail(sanitizedEmail)) {
      const error = 'Please enter a valid email address';
      toast.error(error);
      return { error };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        await logSecurityEvent('login_failed', 'auth', undefined, {
          email: sanitizedEmail,
          error: error.message,
        });

        setRecentAttempts(prev => [...prev, {
          success: false,
          timestamp: Date.now(),
          identifier,
        }]);

        // Special handling for specific auth errors
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Invalid email or password' };
        }

        return { error: error.message };
      }

      await logSecurityEvent('login_successful', 'auth', undefined, {
        email: sanitizedEmail,
      });

      setRecentAttempts(prev => [...prev, {
        success: true,
        timestamp: Date.now(),
        identifier,
      }]);

      // Reset rate limiter on successful login
      authRateLimiter.reset(identifier);

      toast.success('Welcome back!');
      return { error: null };
    } catch (error: any) {
      await logSecurityEvent('login_error', 'auth', undefined, {
        email: sanitizedEmail,
        error: error.message,
      });
      return { error: error.message };
    } finally {
      updateRateLimitRemaining();
    }
  }, [getClientIdentifier, updateRateLimitRemaining]);

  // Enhanced sign out with logging
  const signOut = useCallback(async () => {
    try {
      const currentUser = authState.user;
      await supabase.auth.signOut();

      if (currentUser) {
        await logSecurityEvent('logout_successful', 'auth', undefined, {
          user_id: currentUser.id,
        });
      }

      toast.success('Signed out successfully');
    } catch (error: any) {
      await logSecurityEvent('logout_error', 'auth', undefined, {
        error: error.message,
      });
      toast.error('Error signing out');
    }
  }, [authState.user]);

  // Enhanced password reset with security
  const resetPassword = useCallback(async (email: string) => {
    const identifier = getClientIdentifier();

    // Check rate limit
    if (!authRateLimiter.isAllowed(identifier)) {
      const error = 'Too many reset attempts. Please wait before trying again.';
      toast.error(error);
      await logSecurityEvent('password_reset_rate_limit_exceeded', 'auth', undefined, { email });
      return { error };
    }

    const sanitizedEmail = sanitizeInput(email);

    if (!validateEmail(sanitizedEmail)) {
      const error = 'Please enter a valid email address';
      toast.error(error);
      return { error };
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/reset`;

      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        await logSecurityEvent('password_reset_failed', 'auth', undefined, {
          email: sanitizedEmail,
          error: error.message,
        });
        return { error: error.message };
      }

      await logSecurityEvent('password_reset_requested', 'auth', undefined, {
        email: sanitizedEmail,
      });

      toast.success('Password reset email sent! Check your inbox.');
      return { error: null };
    } catch (error: any) {
      await logSecurityEvent('password_reset_error', 'auth', undefined, {
        email: sanitizedEmail,
        error: error.message,
      });
      return { error: error.message };
    } finally {
      updateRateLimitRemaining();
    }
  }, [getClientIdentifier, updateRateLimitRemaining]);

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!mounted) { return; }

        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          isAuthenticated: !!session?.user,
        }));

        // Log auth state changes
        if (event && session?.user) {
          await logSecurityEvent(`auth_${event}`, 'auth', undefined, {
            user_id: session.user.id,
            event,
          });
        }
      },
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (!mounted) { return; }

      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        isAuthenticated: !!session?.user,
      }));
    });

    updateRateLimitRemaining();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateRateLimitRemaining]);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    recentAttempts,
  };
}