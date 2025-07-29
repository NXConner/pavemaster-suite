import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { SecurityBanner } from '@/components/ui/security-banner';
import { validateEmail, validatePassword, sanitizeInput } from '@/lib/security';
import { Loader2, Shield, Truck } from 'lucide-react';

export default function Auth() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [resetMode, setResetMode] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors([]);
    
    const formData = new FormData(e.currentTarget);
    const email = sanitizeInput(formData.get('email') as string);
    const password = formData.get('password') as string;
    
    // Validate input
    const errors: string[] = [];
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    if (!password) {
      errors.push('Password is required');
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }
    
    await signIn(email, password);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors([]);
    
    const formData = new FormData(e.currentTarget);
    const email = sanitizeInput(formData.get('email') as string);
    const password = formData.get('password') as string;
    const firstName = sanitizeInput(formData.get('firstName') as string);
    const lastName = sanitizeInput(formData.get('lastName') as string);
    
    // Validate input
    const errors: string[] = [];
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
    
    if (!firstName.trim()) {
      errors.push('First name is required');
    }
    if (!lastName.trim()) {
      errors.push('Last name is required');
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }
    
    await signUp(email, password, firstName, lastName);
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors([]);
    
    const formData = new FormData(e.currentTarget);
    const email = sanitizeInput(formData.get('email') as string);
    
    // Validate input
    const errors: string[] = [];
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }
    
    const { error } = await resetPassword(email);
    if (!error) {
      setResetMode(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">PaveMaster Suite</h1>
          </div>
          <p className="text-muted-foreground">
            Enterprise pavement management platform
          </p>
        </div>

        {/* Security Notice */}
        <SecurityBanner
          level="warning"
          message="Secure Authentication Required"
          details="This enterprise platform requires authentication to access your pavement management data."
        />

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <SecurityBanner
            level="critical"
            message="Validation Errors"
            details={validationErrors.join(', ')}
          />
        )}

        {/* Auth Tabs */}
        <Card>
          {resetMode ? (
            <form onSubmit={handleResetPassword}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Reset Password</CardTitle>
                <CardDescription>
                  Enter your email to receive a password reset link
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setResetMode(false)}
                  disabled={loading}
                >
                  Back to Sign In
                </Button>
              </CardFooter>
            </form>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to your PaveMaster account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm" 
                    onClick={() => setResetMode(true)}
                    disabled={loading}
                  >
                    Forgot your password?
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Create account</CardTitle>
                  <CardDescription>
                    Set up your PaveMaster account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Strong password"
                      required
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            </Tabs>
          )}
        </Card>

        <Separator />

        {/* Demo Credentials */}
        <Card className="border-muted">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Demo Access</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Email:</strong> n8ter8@gmail.com</p>
                <p><strong>Admin Role:</strong> Pre-configured admin access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}