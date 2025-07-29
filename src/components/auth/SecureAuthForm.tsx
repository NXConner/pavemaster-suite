import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { validatePassword } from '@/lib/security';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function SecureAuthForm() {
  const { signIn, signUp, resetPassword, loading, rateLimitRemaining } = useSecureAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const passwordValidation = validatePassword(formData.password);
  const passwordStrength = formData.password ? 
    Math.min(100, (passwordValidation.isValid ? 100 : (5 - passwordValidation.errors.length) * 20)) : 0;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    }
    
    if (!formData.password) {
      newErrors.push('Password is required');
    }
    
    if (activeTab === 'signup') {
      if (!formData.firstName.trim()) {
        newErrors.push('First name is required');
      }
      if (!formData.lastName.trim()) {
        newErrors.push('Last name is required');
      }
      if (!passwordValidation.isValid) {
        newErrors.push(...passwordValidation.errors);
      }
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (rateLimitRemaining <= 0) {
      setErrors(['Rate limit exceeded. Please wait before trying again.']);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (activeTab === 'signin') {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(
          formData.email, 
          formData.password, 
          formData.firstName, 
          formData.lastName
        );
      }
      
      if (result.error) {
        setErrors([result.error]);
      } else {
        // Clear form on success
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: ''
        });
      }
    } catch (error: any) {
      setErrors([error.message || 'An unexpected error occurred']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email.trim()) {
      setErrors(['Please enter your email address first']);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await resetPassword(formData.email);
      if (result.error) {
        setErrors([result.error]);
      }
    } catch (error: any) {
      setErrors([error.message || 'An unexpected error occurred']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Secure Access</CardTitle>
          </div>
          <CardDescription>
            Enhanced security for PaveMaster Suite
          </CardDescription>
          
          {/* Rate Limit Indicator */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Attempts remaining: 
            </span>
            <Badge variant={rateLimitRemaining > 2 ? 'default' : 'destructive'}>
              {rateLimitRemaining}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <TabsContent value="signin" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || rateLimitRemaining <= 0}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handlePasswordReset}
                  disabled={isSubmitting || !formData.email.trim()}
                >
                  Forgot Password?
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength < 40 ? 'text-red-600' : 
                          passwordStrength < 70 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength} 
                        className="h-2"
                      />
                      
                      {!passwordValidation.isValid && (
                        <div className="space-y-1">
                          {passwordValidation.errors.map((error, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <XCircle className="h-3 w-3 text-red-500" />
                              {error}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {passwordValidation.isValid && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Password meets all requirements
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !passwordValidation.isValid || rateLimitRemaining <= 0}
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}