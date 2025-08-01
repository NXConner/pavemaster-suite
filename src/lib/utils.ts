// ============================================================================
// ENHANCED UTILITY FUNCTIONS - PaveMaster Suite
// ============================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid, parseISO, formatDistanceToNow } from "date-fns";

// Enhanced className utility with conditional merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// JARGON AND LOCALIZATION UTILITIES
// ============================================================================

// Jargon translation maps
const JARGON_TERMS: Record<string, { civilian: string; military: string }> = {
  // Navigation and Movement
  'location': { civilian: 'Location', military: 'Position' },
  'destination': { civilian: 'Destination', military: 'Objective' },
  'route': { civilian: 'Route', military: 'Vector' },
  'navigation': { civilian: 'Navigation', military: 'Nav' },
  'position': { civilian: 'Position', military: 'GPS Coordinates' },
  'coordinates': { civilian: 'Coordinates', military: 'Grid Reference' },
  'waypoint': { civilian: 'Stop', military: 'Waypoint' },
  'checkpoint': { civilian: 'Checkpoint', military: 'Control Point' },
  
  // Operations and Management
  'project': { civilian: 'Project', military: 'Mission' },
  'task': { civilian: 'Task', military: 'Objective' },
  'assignment': { civilian: 'Assignment', military: 'Mission Brief' },
  'deadline': { civilian: 'Deadline', military: 'Mission Timeline' },
  'priority': { civilian: 'Priority', military: 'Priority Level' },
  'status': { civilian: 'Status', military: 'SITREP' },
  'update': { civilian: 'Update', military: 'Intel Update' },
  'report': { civilian: 'Report', military: 'After Action Report' },
  'briefing': { civilian: 'Meeting', military: 'Mission Brief' },
  'debrief': { civilian: 'Review', military: 'Debrief' },
  
  // Personnel and Teams
  'team': { civilian: 'Team', military: 'Unit' },
  'crew': { civilian: 'Crew', military: 'Squad' },
  'supervisor': { civilian: 'Supervisor', military: 'Squad Leader' },
  'manager': { civilian: 'Manager', military: 'Commander' },
  'worker': { civilian: 'Worker', military: 'Operative' },
  'employee': { civilian: 'Employee', military: 'Personnel' },
  'operator': { civilian: 'Operator', military: 'Field Operative' },
  'technician': { civilian: 'Technician', military: 'Specialist' },
  
  // Equipment and Resources
  'equipment': { civilian: 'Equipment', military: 'Hardware' },
  'vehicle': { civilian: 'Vehicle', military: 'Transport' },
  'truck': { civilian: 'Truck', military: 'Heavy Transport' },
  'machine': { civilian: 'Machine', military: 'Equipment Unit' },
  'tool': { civilian: 'Tool', military: 'Equipment' },
  'supplies': { civilian: 'Supplies', military: 'Resources' },
  'inventory': { civilian: 'Inventory', military: 'Asset Registry' },
  'maintenance': { civilian: 'Maintenance', military: 'Service Protocol' },
  
  // Communication and Status
  'message': { civilian: 'Message', military: 'Communication' },
  'notification': { civilian: 'Notification', military: 'Alert' },
  'alert': { civilian: 'Alert', military: 'Warning Status' },
  'warning': { civilian: 'Warning', military: 'Caution Advisory' },
  'emergency': { civilian: 'Emergency', military: 'Critical Alert' },
  'critical': { civilian: 'Critical', military: 'Priority Alpha' },
  'urgent': { civilian: 'Urgent', military: 'Immediate Action' },
  'normal': { civilian: 'Normal', military: 'Standard Operations' },
  
  // Safety and Security
  'safety': { civilian: 'Safety', military: 'Security Protocol' },
  'security': { civilian: 'Security', military: 'Force Protection' },
  'incident': { civilian: 'Incident', military: 'Event Report' },
  'violation': { civilian: 'Violation', military: 'Breach' },
  'compliance': { civilian: 'Compliance', military: 'Regulation Adherence' },
  'inspection': { civilian: 'Inspection', military: 'Assessment' },
  'audit': { civilian: 'Audit', military: 'Evaluation' },
  
  // Time and Scheduling
  'schedule': { civilian: 'Schedule', military: 'Timeline' },
  'timeline': { civilian: 'Timeline', military: 'Operational Schedule' },
  'shift': { civilian: 'Shift', military: 'Watch' },
  'break': { civilian: 'Break', military: 'Stand Down' },
  'overtime': { civilian: 'Overtime', military: 'Extended Operations' },
  'availability': { civilian: 'Availability', military: 'Operational Status' },
  
  // Performance and Metrics
  'performance': { civilian: 'Performance', military: 'Operational Efficiency' },
  'productivity': { civilian: 'Productivity', military: 'Mission Effectiveness' },
  'efficiency': { civilian: 'Efficiency', military: 'Operational Readiness' },
  'quality': { civilian: 'Quality', military: 'Mission Standards' },
  'accuracy': { civilian: 'Accuracy', military: 'Precision Level' },
  'completion': { civilian: 'Completion', military: 'Mission Accomplished' },
  
  // Technology and Systems
  'system': { civilian: 'System', military: 'Platform' },
  'software': { civilian: 'Software', military: 'System Software' },
  'hardware': { civilian: 'Hardware', military: 'Equipment Platform' },
  'network': { civilian: 'Network', military: 'Communication Grid' },
  'connection': { civilian: 'Connection', military: 'Link Status' },
  'signal': { civilian: 'Signal', military: 'Transmission' },
  'data': { civilian: 'Data', military: 'Intelligence' },
  'backup': { civilian: 'Backup', military: 'Redundancy' },
  
  // Financial and Business
  'cost': { civilian: 'Cost', military: 'Resource Expenditure' },
  'budget': { civilian: 'Budget', military: 'Resource Allocation' },
  'expense': { civilian: 'Expense', military: 'Operational Cost' },
  'profit': { civilian: 'Profit', military: 'Resource Efficiency' },
  'revenue': { civilian: 'Revenue', military: 'Resource Generation' },
  'invoice': { civilian: 'Invoice', military: 'Resource Request' },
  'payment': { civilian: 'Payment', military: 'Resource Transfer' },
  
  // Weather and Environment
  'weather': { civilian: 'Weather', military: 'Environmental Conditions' },
  'temperature': { civilian: 'Temperature', military: 'Thermal Reading' },
  'conditions': { civilian: 'Conditions', military: 'Field Conditions' },
  'forecast': { civilian: 'Forecast', military: 'Weather Intel' },
  'visibility': { civilian: 'Visibility', military: 'Visual Range' },
  'wind': { civilian: 'Wind', military: 'Wind Vector' },
  
  // General Interface Terms
  'dashboard': { civilian: 'Dashboard', military: 'Command Center' },
  'overview': { civilian: 'Overview', military: 'Situation Overview' },
  'summary': { civilian: 'Summary', military: 'Intel Summary' },
  'details': { civilian: 'Details', military: 'Technical Data' },
  'settings': { civilian: 'Settings', military: 'Configuration' },
  'preferences': { civilian: 'Preferences', military: 'User Config' },
  'profile': { civilian: 'Profile', military: 'Personnel File' },
  'account': { civilian: 'Account', military: 'User Credentials' },
  'login': { civilian: 'Login', military: 'Authentication' },
  'logout': { civilian: 'Logout', military: 'Sign Off' },
  'search': { civilian: 'Search', military: 'Query' },
  'filter': { civilian: 'Filter', military: 'Sort Parameters' },
  'export': { civilian: 'Export', military: 'Data Extract' },
  'import': { civilian: 'Import', military: 'Data Ingestion' },
  'save': { civilian: 'Save', military: 'Store Data' },
  'cancel': { civilian: 'Cancel', military: 'Abort' },
  'confirm': { civilian: 'Confirm', military: 'Acknowledge' },
  'submit': { civilian: 'Submit', military: 'Transmit' },
  'edit': { civilian: 'Edit', military: 'Modify' },
  'delete': { civilian: 'Delete', military: 'Terminate' },
  'create': { civilian: 'Create', military: 'Initialize' },
  'add': { civilian: 'Add', military: 'Deploy' },
  'remove': { civilian: 'Remove', military: 'Extract' },
  'view': { civilian: 'View', military: 'Display' },
  'show': { civilian: 'Show', military: 'Reveal' },
  'hide': { civilian: 'Hide', military: 'Conceal' },
  'enable': { civilian: 'Enable', military: 'Activate' },
  'disable': { civilian: 'Disable', military: 'Deactivate' },
  'start': { civilian: 'Start', military: 'Initiate' },
  'stop': { civilian: 'Stop', military: 'Cease' },
  'pause': { civilian: 'Pause', military: 'Hold' },
  'resume': { civilian: 'Resume', military: 'Continue' },
  'refresh': { civilian: 'Refresh', military: 'Update Status' },
  'reload': { civilian: 'Reload', military: 'Reinitialize' },
  'reset': { civilian: 'Reset', military: 'Restore Default' },
  'clear': { civilian: 'Clear', military: 'Purge' },
  'close': { civilian: 'Close', military: 'Terminate Session' },
  'open': { civilian: 'Open', military: 'Access' },
  'load': { civilian: 'Load', military: 'Deploy' },
  'unload': { civilian: 'Unload', military: 'Withdraw' },
  'upload': { civilian: 'Upload', military: 'Transmit Data' },
  'download': { civilian: 'Download', military: 'Retrieve Data' },
  'sync': { civilian: 'Sync', military: 'Synchronize' },
  'backup': { civilian: 'Backup', military: 'Archive' },
  'restore': { civilian: 'Restore', military: 'Recover' },
  'update': { civilian: 'Update', military: 'Modify Status' },
  'upgrade': { civilian: 'Upgrade', military: 'Enhance System' },
  'install': { civilian: 'Install', military: 'Deploy System' },
  'uninstall': { civilian: 'Uninstall', military: 'Remove System' },
  'configure': { civilian: 'Configure', military: 'Set Parameters' },
  'optimize': { civilian: 'Optimize', military: 'Enhance Performance' },
  'analyze': { civilian: 'Analyze', military: 'Assess Data' },
  'monitor': { civilian: 'Monitor', military: 'Surveillance' },
  'track': { civilian: 'Track', military: 'Trace' },
  'control': { civilian: 'Control', military: 'Command' },
  'manage': { civilian: 'Manage', military: 'Coordinate' },
  'operate': { civilian: 'Operate', military: 'Execute' },
  'execute': { civilian: 'Execute', military: 'Implement' },
  'deploy': { civilian: 'Deploy', military: 'Field' },
  'activate': { civilian: 'Activate', military: 'Go Live' },
  'deactivate': { civilian: 'Deactivate', military: 'Stand Down' },
  'online': { civilian: 'Online', military: 'Operational' },
  'offline': { civilian: 'Offline', military: 'Non-Operational' },
  'available': { civilian: 'Available', military: 'Ready' },
  'unavailable': { civilian: 'Unavailable', military: 'Not Ready' },
  'active': { civilian: 'Active', military: 'Live' },
  'inactive': { civilian: 'Inactive', military: 'Standby' },
  'pending': { civilian: 'Pending', military: 'Awaiting Orders' },
  'complete': { civilian: 'Complete', military: 'Mission Complete' },
  'incomplete': { civilian: 'Incomplete', military: 'Mission Ongoing' },
  'success': { civilian: 'Success', military: 'Mission Success' },
  'failure': { civilian: 'Failure', military: 'Mission Failed' },
  'error': { civilian: 'Error', military: 'System Fault' },
  'warning': { civilian: 'Warning', military: 'Advisory' },
  'info': { civilian: 'Info', military: 'Intel' },
  'help': { civilian: 'Help', military: 'Support' },
  'support': { civilian: 'Support', military: 'Assistance' },
  'contact': { civilian: 'Contact', military: 'Communications' },
  'feedback': { civilian: 'Feedback', military: 'After Action' },
  'version': { civilian: 'Version', military: 'Build Number' },
  'license': { civilian: 'License', military: 'Authorization' },
  'terms': { civilian: 'Terms', military: 'Regulations' },
  'privacy': { civilian: 'Privacy', military: 'Security Clearance' },
  'cookies': { civilian: 'Cookies', military: 'Session Tokens' },
  'cache': { civilian: 'Cache', military: 'Temporary Storage' },
  'storage': { civilian: 'Storage', military: 'Data Repository' },
  'memory': { civilian: 'Memory', military: 'Data Buffer' },
  'cpu': { civilian: 'CPU', military: 'Processing Unit' },
  'gpu': { civilian: 'GPU', military: 'Graphics Processor' },
  'ram': { civilian: 'RAM', military: 'System Memory' },
  'disk': { civilian: 'Disk', military: 'Storage Device' },
  'bandwidth': { civilian: 'Bandwidth', military: 'Data Throughput' },
  'latency': { civilian: 'Latency', military: 'Response Time' },
  'ping': { civilian: 'Ping', military: 'Echo Test' },
  'timeout': { civilian: 'Timeout', military: 'Session Expired' },
  'retry': { civilian: 'Retry', military: 'Retry Attempt' },
  'abort': { civilian: 'Abort', military: 'Mission Abort' },
  'cancel': { civilian: 'Cancel', military: 'Stand Down' },
  'override': { civilian: 'Override', military: 'Command Override' },
  'bypass': { civilian: 'Bypass', military: 'Route Around' },
  'redirect': { civilian: 'Redirect', military: 'Reroute' },
  'forward': { civilian: 'Forward', military: 'Relay' },
  'backward': { civilian: 'Backward', military: 'Retreat' },
  'next': { civilian: 'Next', military: 'Advance' },
  'previous': { civilian: 'Previous', military: 'Fallback' },
  'first': { civilian: 'First', military: 'Primary' },
  'last': { civilian: 'Last', military: 'Final' },
  'home': { civilian: 'Home', military: 'Base' },
  'exit': { civilian: 'Exit', military: 'Egress' },
  'enter': { civilian: 'Enter', military: 'Ingress' },
  'access': { civilian: 'Access', military: 'Entry Point' },
  'permission': { civilian: 'Permission', military: 'Clearance' },
  'authorization': { civilian: 'Authorization', military: 'Authentication' },
  'credentials': { civilian: 'Credentials', military: 'Access Codes' },
  'token': { civilian: 'Token', military: 'Security Key' },
  'key': { civilian: 'Key', military: 'Cipher Key' },
  'password': { civilian: 'Password', military: 'Access Code' },
  'username': { civilian: 'Username', military: 'User ID' },
  'session': { civilian: 'Session', military: 'Active Session' },
  'connection': { civilian: 'Connection', military: 'Link Established' },
  'disconnection': { civilian: 'Disconnection', military: 'Link Terminated' },
  'reconnection': { civilian: 'Reconnection', military: 'Link Restored' }
};

// Jargon translation function
export function translateJargon(
  text: string, 
  mode: 'civilian' | 'military' | 'hybrid'
): string {
  if (mode === 'civilian') {
    return text;
  }
  
  // Handle hybrid mode
  if (mode === 'hybrid') {
    // In hybrid mode, show both terms when available
    const lowerText = text.toLowerCase();
    const translation = JARGON_TERMS[lowerText];
    if (translation) {
      return `${translation.civilian} (${translation.military})`;
    }
    return text;
  }
  
  // Military mode - translate to military terminology
  if (mode === 'military') {
    const lowerText = text.toLowerCase();
    const translation = JARGON_TERMS[lowerText];
    if (translation) {
      // Preserve original case
      if (text === text.toUpperCase()) {
        return translation.military.toUpperCase();
      }
      if (text[0] === text[0].toUpperCase()) {
        return translation.military.charAt(0).toUpperCase() + translation.military.slice(1);
      }
      return translation.military;
    }
  }
  
  return text;
}

// Component wrapper for jargon translation
export function withJargon(text: string, mode: 'civilian' | 'military' | 'hybrid'): string {
  return translateJargon(text, mode);
}

// ============================================================================
// DATE AND TIME UTILITIES
// ============================================================================

// Enhanced date formatting with multiple options
export function formatDate(
  date: Date | string | number,
  formatString: string = 'PPP',
  options?: {
    locale?: Locale;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: number;
    useAdditionalWeekYearTokens?: boolean;
    useAdditionalDayOfYearTokens?: boolean;
  }
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }
    return format(dateObj, formatString, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

// Relative time formatting
export function formatRelativeTime(
  date: Date | string | number,
  baseDate?: Date,
  options?: {
    locale?: Locale;
    addSuffix?: boolean;
    includeSeconds?: boolean;
  }
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      includeSeconds: false,
      ...options
    });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
}

// Time zone utilities
export function convertToTimeZone(
  date: Date | string,
  timeZone: string = 'America/New_York'
): Date {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return new Date(dateObj.toLocaleString('en-US', { timeZone }));
  } catch (error) {
    console.error('Error converting timezone:', error);
    return new Date();
  }
}

// Business hours checker
export function isBusinessHours(
  date: Date = new Date(),
  businessHours: { start: number; end: number; days: number[] } = {
    start: 8, // 8 AM
    end: 17, // 5 PM
    days: [1, 2, 3, 4, 5] // Monday to Friday
  }
): boolean {
  const hour = date.getHours();
  const day = date.getDay();
  
  return businessHours.days.includes(day) && 
         hour >= businessHours.start && 
         hour < businessHours.end;
}

// ============================================================================
// NUMBER AND CURRENCY UTILITIES
// ============================================================================

// Enhanced number formatting
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions & {
    locale?: string;
    compact?: boolean;
    precision?: number;
  } = {}
): string {
  const {
    locale = 'en-US',
    compact = false,
    precision,
    ...formatOptions
  } = options;

  try {
    let formatOpts = { ...formatOptions };
    
    if (compact) {
      formatOpts.notation = 'compact';
      formatOpts.compactDisplay = 'short';
    }
    
    if (precision !== undefined) {
      formatOpts.minimumFractionDigits = precision;
      formatOpts.maximumFractionDigits = precision;
    }
    
    return new Intl.NumberFormat(locale, formatOpts).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return value.toString();
  }
}

// Currency formatting
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...options
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// Percentage formatting
export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value.toFixed(decimals)}%`;
  }
}

// File size formatting
export function formatFileSize(
  bytes: number,
  decimals: number = 2,
  binary: boolean = false
): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = binary ? 1024 : 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = binary 
    ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

// Enhanced string manipulation
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

// Text truncation with smart word breaking
export function truncate(
  text: string,
  length: number = 100,
  options: {
    ending?: string;
    wordBreak?: boolean;
    preserveWords?: boolean;
  } = {}
): string {
  const { ending = '...', wordBreak = false, preserveWords = true } = options;
  
  if (text.length <= length) return text;
  
  let truncated = text.substr(0, length - ending.length);
  
  if (preserveWords && !wordBreak) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.substr(0, lastSpace);
    }
  }
  
  return truncated + ending;
}

// Slug generation
export function slugify(
  text: string,
  options: {
    replacement?: string;
    lower?: boolean;
    strict?: boolean;
    trim?: boolean;
  } = {}
): string {
  const {
    replacement = '-',
    lower = true,
    strict = false,
    trim = true
  } = options;
  
  let slug = text;
  
  if (lower) slug = slug.toLowerCase();
  
  // Replace spaces and special characters
  slug = slug.replace(/[\s\W-]+/g, replacement);
  
  if (strict) {
    slug = slug.replace(/[^a-zA-Z0-9\-_]/g, '');
  }
  
  if (trim) {
    slug = slug.replace(new RegExp(`^\\${replacement}+|\\${replacement}+$`, 'g'), '');
  }
  
  return slug;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone number validation
export function isValidPhone(phone: string, country: string = 'US'): boolean {
  const phoneRegexes: Record<string, RegExp> = {
    US: /^(\+1)?[\s.-]?(\([0-9]{3}\)|[0-9]{3})[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/,
    CA: /^(\+1)?[\s.-]?(\([0-9]{3}\)|[0-9]{3})[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/,
    UK: /^(\+44)?[\s.-]?([0-9]{4,5}|[0-9]{10,11})$/,
    // Add more country patterns as needed
  };
  
  const regex = phoneRegexes[country] || phoneRegexes.US;
  return regex.test(phone);
}

// URL validation
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters long');
  
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');
  
  // Pattern checks
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('Avoid repeating characters');
  
  if (!/^(?:password|123456|qwerty|abc123|admin|user)$/i.test(password)) score += 1;
  else feedback.push('Avoid common passwords');
  
  return {
    score,
    feedback,
    isStrong: score >= 6
  };
}

// ============================================================================
// ARRAY AND OBJECT UTILITIES
// ============================================================================

// Deep merge objects
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

// Check if value is object
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Deep clone
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  return obj;
}

// Array utilities
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function throttledFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Retry with exponential backoff
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    maxDelay = 10000
  } = options;
  
  let attempt = 0;
  
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      const delayTime = Math.min(delay * Math.pow(backoff, attempt), maxDelay);
      await sleep(delayTime);
      attempt++;
    }
  }
  
  throw new Error('Retry attempts exhausted');
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

// Enhanced localStorage with error handling and expiration
export const storage = {
  set: (key: string, value: any, expires?: Date): void => {
    try {
      const item = {
        value,
        expires: expires?.getTime() || null,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },
  
  get: <T = any>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      
      // Check expiration
      if (item.expires && Date.now() > item.expires) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error getting localStorage:', error);
      return null;
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
  
  exists: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  }
};

// ============================================================================
// URL AND NAVIGATION UTILITIES
// ============================================================================

// URL parameter utilities
export function getUrlParams(url?: string): URLSearchParams {
  const targetUrl = url || window.location.search;
  return new URLSearchParams(targetUrl);
}

export function setUrlParams(params: Record<string, string>): void {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  window.history.replaceState({}, '', url.toString());
}

export function removeUrlParams(keys: string[]): void {
  const url = new URL(window.location.href);
  keys.forEach(key => url.searchParams.delete(key));
  window.history.replaceState({}, '', url.toString());
}

// ============================================================================
// DEVICE AND BROWSER UTILITIES
// ============================================================================

// Device detection
export const device = {
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },
  
  isTablet: (): boolean => {
    return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(
      navigator.userAgent
    );
  },
  
  isDesktop: (): boolean => {
    return !device.isMobile() && !device.isTablet();
  },
  
  isIOS: (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  
  isAndroid: (): boolean => {
    return /Android/.test(navigator.userAgent);
  },
  
  getViewportSize: (): { width: number; height: number } => {
    return {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    };
  }
};

// Browser capabilities
export const browser = {
  supportsWebP: (): boolean => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  },
  
  supportsWebGL: (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch {
      return false;
    }
  },
  
  supportsServiceWorker: (): boolean => {
    return 'serviceWorker' in navigator;
  },
  
  supportsNotifications: (): boolean => {
    return 'Notification' in window;
  },
  
  supportsGeolocation: (): boolean => {
    return 'geolocation' in navigator;
  },
  
  isOnline: (): boolean => {
    return navigator.onLine;
  }
};

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

// Performance measurement
export function measurePerformance<T>(
  fn: () => T | Promise<T>,
  label?: string
): T | Promise<T> {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      console.log(`${label || 'Function'} took ${end - start} milliseconds`);
    });
  }
  
  const end = performance.now();
  console.log(`${label || 'Function'} took ${end - start} milliseconds`);
  return result;
}

// Memory usage (if available)
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return null;
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

// Error boundary helper
export function withErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error, ...args: Parameters<T>) => void
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (errorHandler) {
        errorHandler(err, ...args);
      } else {
        console.error('Function error:', err);
      }
      throw err;
    }
  }) as T;
}

// Safe JSON parse
export function safeJsonParse<T = any>(
  str: string,
  defaultValue: T
): T {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

// Focus management
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }
  
  element.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

// Announce to screen readers
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// ============================================================================
// MATHEMATICAL UTILITIES
// ============================================================================

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * clamp(factor, 0, 1);
}

// Map value from one range to another
export function mapRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  const normalized = (value - fromMin) / (fromMax - fromMin);
  return lerp(toMin, toMax, normalized);
}

// Round to specific decimal places
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// Generate random number in range
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Generate random integer in range
export function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Generate random color
export function randomColor(): string {
  return rgbToHex(
    randomIntInRange(0, 255),
    randomIntInRange(0, 255),
    randomIntInRange(0, 255)
  );
}

// ============================================================================
// CONSTANTS AND EXPORTS
// ============================================================================

// Export all utilities
export const utils = {
  // Jargon utilities
  translateJargon,
  withJargon,
  
  // Date utilities
  formatDate,
  formatRelativeTime,
  convertToTimeZone,
  isBusinessHours,
  
  // Number utilities
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  
  // String utilities
  capitalize,
  titleCase,
  camelCase,
  kebabCase,
  snakeCase,
  truncate,
  slugify,
  
  // Validation utilities
  isValidEmail,
  isValidPhone,
  isValidURL,
  checkPasswordStrength,
  
  // Array and object utilities
  deepMerge,
  deepClone,
  unique,
  groupBy,
  sortBy,
  
  // Async utilities
  sleep,
  debounce,
  throttle,
  retry,
  
  // Storage utilities
  storage,
  
  // URL utilities
  getUrlParams,
  setUrlParams,
  removeUrlParams,
  
  // Device utilities
  device,
  browser,
  
  // Performance utilities
  measurePerformance,
  getMemoryUsage,
  
  // Error handling
  withErrorBoundary,
  safeJsonParse,
  
  // Accessibility utilities
  trapFocus,
  announceToScreenReader,
  
  // Math utilities
  clamp,
  lerp,
  mapRange,
  roundTo,
  randomInRange,
  randomIntInRange,
  
  // Color utilities
  hexToRgb,
  rgbToHex,
  randomColor
};

// Default export
export default utils;