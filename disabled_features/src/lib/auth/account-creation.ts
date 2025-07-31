import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { validatePassword } from '../security/password-validator';
import { generateSecureToken } from '../security/token-generator';

// Advanced Account Creation Schema
const AccountCreationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().refine(
    (password) => validatePassword(password).isValid, 
    { message: 'Password does not meet security requirements' }
  ),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['admin', 'user', 'field_crew', 'manager']).default('user'),
  companyName: z.string().optional(),
  phoneNumber: z.string().optional()
});

export async function createEnhancedAccount(rawData: unknown) {
  // Validate input
  const validationResult = AccountCreationSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors[0].message);
  }

  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    role, 
    companyName, 
    phoneNumber 
  } = validationResult.data;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if email already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Create user with enhanced metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
        lastName,
        role,
        companyName,
        phoneNumber,
        accountCreatedAt: new Date().toISOString(),
        accountVerificationToken: generateSecureToken()
      }
    }
  });

  if (error) throw error;

  // Optional: Send verification email
  await sendAccountVerificationEmail(email, data.user?.id);

  return {
    userId: data.user?.id,
    email,
    role
  };
}

async function sendAccountVerificationEmail(email: string, userId?: string) {
  // Implement email verification logic
  // Could use services like SendGrid, Resend, or Supabase Edge Functions
}

export async function verifyAccount(token: string) {
  // Implement account verification logic
  // Validate token, mark account as verified
}

// Advanced account recovery and security features
export const AccountSecurityFeatures = {
  enableTwoFactorAuthentication: async (userId: string) => {
    // Implement 2FA setup
  },
  logSecurityEvent: async (userId: string, eventType: string) => {
    // Log security-related events
  }
}