import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  user: any;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState(null);
  const [loading] = useState(false);

  const signUp = async (email: string, password: string) => {
    console.log('Sign up:', email, password);
  };

  const signIn = async (email: string, password: string) => {
    console.log('Sign in:', email, password);
  };

  const signOut = async () => {
    console.log('Sign out');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
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