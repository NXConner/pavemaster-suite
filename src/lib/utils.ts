import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isValid, parseISO, formatDistanceToNow, startOfDay, endOfDay, addDays, subDays, type Locale } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// ENHANCED JARGON TRANSLATION SYSTEM
// ============================================================================

// Enhanced jargon terms database - comprehensive tactical/civilian terminology
const JARGON_TERMS: Record<string, { civilian: string; military: string; acronym?: string; definition?: string }> = {
  // Core application terms
  'dashboard': { civilian: 'Dashboard', military: 'Command Center', acronym: 'CC' },
  'overview': { civilian: 'Overview', military: 'Situational Awareness', acronym: 'SA' },
  'status': { civilian: 'Status', military: 'SITREP', definition: 'Situation Report' },
  'report': { civilian: 'Report', military: 'Intel Brief' },
  'alert': { civilian: 'Alert', military: 'Advisory', acronym: 'ADV' },
  'notification': { civilian: 'Notification', military: 'Message Traffic' },
  'update': { civilian: 'Update', military: 'Status Change' },
  'system': { civilian: 'System', military: 'Platform' },
  'network': { civilian: 'Network', military: 'Grid' },
  'connection': { civilian: 'Connection', military: 'Link' },
  'settings': { civilian: 'Settings', military: 'Configuration', acronym: 'CONFIG' },
  'preferences': { civilian: 'Preferences', military: 'Parameters' },
  'profile': { civilian: 'Profile', military: 'User Data' },
  'account': { civilian: 'Account', military: 'User Profile' },
  'login': { civilian: 'Login', military: 'Authentication', acronym: 'AUTH' },
  'logout': { civilian: 'Logout', military: 'Secure Exit' },
  'user': { civilian: 'User', military: 'Operator', acronym: 'OP' },
  'admin': { civilian: 'Admin', military: 'Command Authority', acronym: 'CA' },
  'manager': { civilian: 'Manager', military: 'Operations Chief', acronym: 'OPS' },
  'employee': { civilian: 'Employee', military: 'Personnel', acronym: 'PERS' },
  'team': { civilian: 'Team', military: 'Squad' },
  'crew': { civilian: 'Crew', military: 'Detail' },
  'project': { civilian: 'Project', military: 'Mission', acronym: 'MSN' },
  'task': { civilian: 'Task', military: 'Objective', acronym: 'OBJ' },
  'assignment': { civilian: 'Assignment', military: 'Orders' },
  'schedule': { civilian: 'Schedule', military: 'Timeline', acronym: 'TL' },
  'calendar': { civilian: 'Calendar', military: 'Operational Schedule' },
  'deadline': { civilian: 'Deadline', military: 'Time Hack' },
  'priority': { civilian: 'Priority', military: 'Precedence' },
  'urgent': { civilian: 'Urgent', military: 'Flash' },
  'important': { civilian: 'Important', military: 'Priority' },
  'critical': { civilian: 'Critical', military: 'Mission Critical' },
  'emergency': { civilian: 'Emergency', military: 'EMERGENCY', acronym: 'EMERG' },
  'safety': { civilian: 'Safety', military: 'Force Protection', acronym: 'FP' },
  'security': { civilian: 'Security', military: 'OpSec', definition: 'Operational Security' },
  'access': { civilian: 'Access', military: 'Clearance' },
  'permission': { civilian: 'Permission', military: 'Authorization', acronym: 'AUTH' },
  'location': { civilian: 'Location', military: 'Position', acronym: 'POS' },
  'address': { civilian: 'Address', military: 'Coordinates', acronym: 'COORD' },
  'coordinates': { civilian: 'Coordinates', military: 'Grid Reference' },
  'map': { civilian: 'Map', military: 'Chart' },
  'route': { civilian: 'Route', military: 'Path' },
  'distance': { civilian: 'Distance', military: 'Range' },
  'direction': { civilian: 'Direction', military: 'Bearing', acronym: 'BRG' },
  'equipment': { civilian: 'Equipment', military: 'Assets', acronym: 'EQPT' },
  'vehicle': { civilian: 'Vehicle', military: 'Transport', acronym: 'TRANS' },
  'truck': { civilian: 'Truck', military: 'Heavy Transport' },
  'tool': { civilian: 'Tool', military: 'Equipment Item' },
  'machine': { civilian: 'Machine', military: 'Equipment' },
  'device': { civilian: 'Device', military: 'Unit' },
  'maintenance': { civilian: 'Maintenance', military: 'Service', acronym: 'MAINT' },
  'repair': { civilian: 'Repair', military: 'Fix' },
  'inspection': { civilian: 'Inspection', military: 'Check', acronym: 'INSP' },
  'inventory': { civilian: 'Inventory', military: 'Assets List' },
  'supplies': { civilian: 'Supplies', military: 'Materiel', acronym: 'MAT' },
  'materials': { civilian: 'Materials', military: 'Resources' },
  'cost': { civilian: 'Cost', military: 'Expenditure', acronym: 'EXPEND' },
  'budget': { civilian: 'Budget', military: 'Allocation' },
  'expense': { civilian: 'Expense', military: 'Cost' },
  'invoice': { civilian: 'Invoice', military: 'Bill' },
  'payment': { civilian: 'Payment', military: 'Transaction' },
  'estimate': { civilian: 'Estimate', military: 'Assessment' },
  'quote': { civilian: 'Quote', military: 'Bid' },
  'contract': { civilian: 'Contract', military: 'Agreement' },
  'client': { civilian: 'Client', military: 'Customer' },
  'customer': { civilian: 'Customer', military: 'Client' },
  'vendor': { civilian: 'Vendor', military: 'Supplier' },
  'supplier': { civilian: 'Supplier', military: 'Provider' },
  'contact': { civilian: 'Contact', military: 'Point of Contact', acronym: 'POC' },
  'phone': { civilian: 'Phone', military: 'Communications', acronym: 'COMMS' },
  'email': { civilian: 'Email', military: 'Electronic Message' },
  'message': { civilian: 'Message', military: 'Traffic' },
  'communication': { civilian: 'Communication', military: 'Comms' },
  'data': { civilian: 'Data', military: 'Information', acronym: 'INFO' },
  'information': { civilian: 'Information', military: 'Intel', definition: 'Intelligence' },
  'record': { civilian: 'Record', military: 'Log Entry' },
  'document': { civilian: 'Document', military: 'File' },
  'file': { civilian: 'File', military: 'Document' },
  'folder': { civilian: 'Folder', military: 'Directory' },
  'archive': { civilian: 'Archive', military: 'Storage' },
  'backup': { civilian: 'Backup', military: 'Archive Copy' },
  'storage': { civilian: 'Storage', military: 'Repository' },
  'database': { civilian: 'Database', military: 'Data Store', acronym: 'DB' },
  'server': { civilian: 'Server', military: 'Host System' },
  'cloud': { civilian: 'Cloud', military: 'Remote Storage' },
  'online': { civilian: 'Online', military: 'Operational' },
  'offline': { civilian: 'Offline', military: 'Non-Operational' },
  'download': { civilian: 'Download', military: 'Retrieve' },
  'upload': { civilian: 'Upload', military: 'Transmit' },
  'sync': { civilian: 'Sync', military: 'Synchronize', acronym: 'SYNC' },
  'search': { civilian: 'Search', military: 'Query' },
  'filter': { civilian: 'Filter', military: 'Sort' },
  'sort': { civilian: 'Sort', military: 'Arrange' },
  'view': { civilian: 'View', military: 'Display' },
  'display': { civilian: 'Display', military: 'Show' },
  'show': { civilian: 'Show', military: 'Display' },
  'hide': { civilian: 'Hide', military: 'Conceal' },
  'open': { civilian: 'Open', military: 'Access' },
  'close': { civilian: 'Close', military: 'Secure' },
  'save': { civilian: 'Save', military: 'Store' },
  'delete': { civilian: 'Delete', military: 'Remove' },
  'edit': { civilian: 'Edit', military: 'Modify' },
  'modify': { civilian: 'Modify', military: 'Adjust' },
  'change': { civilian: 'Change', military: 'Alter' },
  'create': { civilian: 'Create', military: 'Generate' },
  'add': { civilian: 'Add', military: 'Insert' },
  'remove': { civilian: 'Remove', military: 'Extract' },
  'copy': { civilian: 'Copy', military: 'Duplicate' },
  'paste': { civilian: 'Paste', military: 'Insert' },
  'cut': { civilian: 'Cut', military: 'Extract' },
  'undo': { civilian: 'Undo', military: 'Reverse' },
  'redo': { civilian: 'Redo', military: 'Repeat' },
  'print': { civilian: 'Print', military: 'Hard Copy' },
  'export': { civilian: 'Export', military: 'Extract Data' },
  'import': { civilian: 'Import', military: 'Load Data' },
  'load': { civilian: 'Load', military: 'Initialize' },
  'refresh': { civilian: 'Refresh', military: 'Update' },
  'reload': { civilian: 'Reload', military: 'Restart' },
  'restart': { civilian: 'Restart', military: 'Reboot' },
  'shutdown': { civilian: 'Shutdown', military: 'Power Down' },
  'startup': { civilian: 'Startup', military: 'Initialize' },
  'install': { civilian: 'Install', military: 'Deploy' },
  'uninstall': { civilian: 'Uninstall', military: 'Remove' },
  'configure': { civilian: 'Configure', military: 'Setup' },
  'setup': { civilian: 'Setup', military: 'Configure' },
  'test': { civilian: 'Test', military: 'Verify' },
  'verify': { civilian: 'Verify', military: 'Confirm' },
  'validate': { civilian: 'Validate', military: 'Check' },
  'check': { civilian: 'Check', military: 'Inspect' },
  'monitor': { civilian: 'Monitor', military: 'Observe' },
  'track': { civilian: 'Track', military: 'Follow' },
  'log': { civilian: 'Log', military: 'Record' },
  'history': { civilian: 'History', military: 'Log' },
  'activity': { civilian: 'Activity', military: 'Operations' },
  'operation': { civilian: 'Operation', military: 'Mission' },
  'process': { civilian: 'Process', military: 'Procedure' },
  'procedure': { civilian: 'Procedure', military: 'Protocol' },
  'protocol': { civilian: 'Protocol', military: 'Standard' },
  'standard': { civilian: 'Standard', military: 'Specification' },
  'specification': { civilian: 'Specification', military: 'Requirements' },
  'requirement': { civilian: 'Requirement', military: 'Mandate' },
  'rule': { civilian: 'Rule', military: 'Regulation' },
  'policy': { civilian: 'Policy', military: 'Directive' },
  'guideline': { civilian: 'Guideline', military: 'Guidance' },
  'instruction': { civilian: 'Instruction', military: 'Orders' },
  'manual': { civilian: 'Manual', military: 'Field Manual', acronym: 'FM' },
  'guide': { civilian: 'Guide', military: 'Manual' },
  'help': { civilian: 'Help', military: 'Assistance' },
  'support': { civilian: 'Support', military: 'Backup' },
  'assistance': { civilian: 'Assistance', military: 'Aid' },
  'service': { civilian: 'Service', military: 'Support' },
  'training': { civilian: 'Training', military: 'Instruction' },
  'education': { civilian: 'Education', military: 'Training' },
  'learning': { civilian: 'Learning', military: 'Study' },
  'skill': { civilian: 'Skill', military: 'Capability' },
  'capability': { civilian: 'Capability', military: 'Asset' },
  'feature': { civilian: 'Feature', military: 'Function' },
  'function': { civilian: 'Function', military: 'Operation' },
  'mode': { civilian: 'Mode', military: 'Configuration' },
  'option': { civilian: 'Option', military: 'Choice' },
  'choice': { civilian: 'Choice', military: 'Selection' },
  'selection': { civilian: 'Selection', military: 'Pick' },
  'pick': { civilian: 'Pick', military: 'Choose' },
  'choose': { civilian: 'Choose', military: 'Select' },
  'select': { civilian: 'Select', military: 'Pick' },
  'submit': { civilian: 'Submit', military: 'Send' },
  'send': { civilian: 'Send', military: 'Transmit' },
  'receive': { civilian: 'Receive', military: 'Accept' },
  'accept': { civilian: 'Accept', military: 'Acknowledge' },
  'reject': { civilian: 'Reject', military: 'Deny' },
  'deny': { civilian: 'Deny', military: 'Refuse' },
  'approve': { civilian: 'Approve', military: 'Authorize' },
  'authorize': { civilian: 'Authorize', military: 'Grant' },
  'grant': { civilian: 'Grant', military: 'Allow' },
  'allow': { civilian: 'Allow', military: 'Permit' },
  'permit': { civilian: 'Permit', military: 'Enable' },
  'enable': { civilian: 'Enable', military: 'Activate' },
  'disable': { civilian: 'Disable', military: 'Deactivate' },
  'activate': { civilian: 'Activate', military: 'Enable' },
  'deactivate': { civilian: 'Deactivate', military: 'Disable' },
  'start': { civilian: 'Start', military: 'Begin' },
  'begin': { civilian: 'Begin', military: 'Commence' },
  'commence': { civilian: 'Commence', military: 'Start' },
  'stop': { civilian: 'Stop', military: 'Halt' },
  'halt': { civilian: 'Halt', military: 'Stop' },
  'pause': { civilian: 'Pause', military: 'Hold' },
  'resume': { civilian: 'Resume', military: 'Continue' },
  'continue': { civilian: 'Continue', military: 'Proceed' },
  'proceed': { civilian: 'Proceed', military: 'Advance' },
  'advance': { civilian: 'Advance', military: 'Move Forward' },
  'retreat': { civilian: 'Retreat', military: 'Fall Back' },
  'cancel': { civilian: 'Cancel', military: 'Abort' },
  'abort': { civilian: 'Abort', military: 'Terminate' },
  'terminate': { civilian: 'Terminate', military: 'End' },
  'end': { civilian: 'End', military: 'Complete' },
  'complete': { civilian: 'Complete', military: 'Finish' },
  'finish': { civilian: 'Finish', military: 'Done' },
  'done': { civilian: 'Done', military: 'Complete' },
  'success': { civilian: 'Success', military: 'Successful' },
  'failure': { civilian: 'Failure', military: 'Failed' },
  'error': { civilian: 'Error', military: 'Fault' },
  'warning': { civilian: 'Warning', military: 'Caution' },
  'caution': { civilian: 'Caution', military: 'Advisory' },
  'notice': { civilian: 'Notice', military: 'Advisory' },
  'info': { civilian: 'Info', military: 'Information' },
  'tip': { civilian: 'Tip', military: 'Guidance' },
  'note': { civilian: 'Note', military: 'Remark' },
  'comment': { civilian: 'Comment', military: 'Note' },
  'feedback': { civilian: 'Feedback', military: 'Response' },
  'response': { civilian: 'Response', military: 'Reply' },
  'reply': { civilian: 'Reply', military: 'Answer' },
  'answer': { civilian: 'Answer', military: 'Response' },
  'question': { civilian: 'Question', military: 'Query' },
  'query': { civilian: 'Query', military: 'Request' },
  'request': { civilian: 'Request', military: 'Requisition' },
  'order': { civilian: 'Order', military: 'Command' },
  'command': { civilian: 'Command', military: 'Order' },
  'control': { civilian: 'Control', military: 'Command' },
  'manage': { civilian: 'Manage', military: 'Control' },
  'organize': { civilian: 'Organize', military: 'Arrange' },
  'arrange': { civilian: 'Arrange', military: 'Order' },
  'plan': { civilian: 'Plan', military: 'Strategy' },
  'strategy': { civilian: 'Strategy', military: 'Plan' },
  'goal': { civilian: 'Goal', military: 'Objective' },
  'objective': { civilian: 'Objective', military: 'Target' },
  'target': { civilian: 'Target', military: 'Objective' },
  'mission': { civilian: 'Mission', military: 'Operation' },
  'vision': { civilian: 'Vision', military: 'Mission' },
  'value': { civilian: 'Value', military: 'Principle' },
  'principle': { civilian: 'Principle', military: 'Standard' },
};

// Jargon translation function
export function translateJargon(
  text: string,
  mode: 'civilian' | 'military' | 'hybrid',
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
      const firstChar = text.charAt(0);
      if (firstChar && firstChar === firstChar.toUpperCase()) {
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

// Get jargon term details
export function getJargonDetails(key: string) {
  return JARGON_TERMS[key.toLowerCase()];
}

// ============================================================================
// ENHANCED DATE & TIME UTILITIES
// ============================================================================

// Date formatting with locale support
export function formatDateWithLocale(date: Date | string, pattern: string = 'PPP', options?: {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 4;
  useAdditionalWeekYearTokens?: boolean;
  useAdditionalDayOfYearTokens?: boolean;
}): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) { return 'Invalid Date'; }

  return format(dateObj, pattern, options);
}

// Enhanced relative date formatter
export function createRelativeDateFormatter(
  options?: {
    locale?: Locale;
    addSuffix?: boolean;
    includeSeconds?: boolean;
  },
) {
  return (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) { return 'Invalid date'; }

    return formatDistanceToNow(dateObj, options);
  };
}

// Date range utilities
export function getDateRange(type: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear'): { start: Date; end: Date } {
  const now = new Date();
  const today = startOfDay(now);

  switch (type) {
    case 'today':
      return { start: today, end: endOfDay(now) };
    case 'yesterday':
      const yesterday = subDays(today, 1);
      return { start: yesterday, end: endOfDay(yesterday) };
    case 'thisWeek':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { start: startOfWeek, end: endOfDay(addDays(startOfWeek, 6)) };
    case 'lastWeek':
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      return { start: lastWeekStart, end: endOfDay(addDays(lastWeekStart, 6)) };
    case 'thisMonth':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: startOfMonth, end: endOfDay(endOfMonth) };
    case 'lastMonth':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: lastMonthStart, end: endOfDay(lastMonthEnd) };
    case 'thisYear':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      return { start: startOfYear, end: endOfDay(endOfYear) };
    case 'lastYear':
      const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
      return { start: lastYearStart, end: endOfDay(lastYearEnd) };
    default:
      return { start: today, end: endOfDay(now) };
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

// Enhanced validation patterns
const validationPatterns = {
  email: {
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    regex: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number',
  },
  url: {
    regex: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    message: 'Please enter a valid URL',
  },
  ipAddress: {
    regex: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    message: 'Please enter a valid IP address',
  },
  macAddress: {
    regex: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    message: 'Please enter a valid MAC address',
  },
  creditCard: {
    regex: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
    message: 'Please enter a valid credit card number',
  },
  zipCode: {
    regex: /^\d{5}(-\d{4})?$/,
    message: 'Please enter a valid ZIP code',
  },
  strongPassword: {
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  },
} as const;

// Validation function
export function validateInput(value: string, type: keyof typeof validationPatterns): boolean {
  const pattern = validationPatterns[type];
  if (!pattern) { return false; }

  const regex = pattern.regex;
  return regex?.test(value) ?? false;
}

// Get validation message
export function getValidationMessage(type: keyof typeof validationPatterns): string {
  return validationPatterns[type]?.message ?? 'Invalid input';
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

// Debounce function with immediate option
export function debounce<T extends(...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) { func(...args); }
    }, wait);

    if (callNow) { func(...args); }
  };
}

// Throttle function
export function throttle<T extends(...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization with TTL
export function memoizeWithTTL<T extends(...args: any[]) => any>(
  func: T,
  ttl: number = 5000,
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }

    const result = func(...args);
    cache.set(key, { value: result, timestamp: now });

    return result;
  }) as T;
}

// Deep object access with path
export function getNestedValue<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  if (!obj || typeof path !== 'string') { return defaultValue; }

  try {
    const objPath = path.split('.');
    return objPath.reduce<any>((current, key) => {
      return current && typeof current === 'object' ? (current as any)[key] : undefined;
    }, obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

// Deep object setting with path
export function setNestedValue(obj: any, path: string, value: any): void {
  if (!obj || typeof path !== 'string') { return; }

  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) { return; }

  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
}

// ============================================================================
// MATH & CALCULATION UTILITIES
// ============================================================================

// Enhanced number formatting
export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    currency?: string;
    percentage?: boolean;
    compact?: boolean;
    locale?: string;
  } = {},
): string {
  const {
    decimals = 2,
    currency,
    percentage = false,
    compact = false,
    locale = 'en-US',
  } = options;

  if (percentage) {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }

  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      notation: compact ? 'compact' : 'standard',
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
  }).format(value);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) { return 0; }
  return (value / total) * 100;
}

// Calculate percentage change
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) { return newValue > 0 ? 100 : 0; }
  return ((newValue - oldValue) / oldValue) * 100;
}

// Round to nearest increment
export function roundToNearest(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

// Map value from one range to another
export function mapRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
): number {
  const factor = (value - fromMin) / (fromMax - fromMin);
  return lerp(toMin, toMax, factor);
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

// Chunk array into smaller arrays
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Remove duplicates from array
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// Remove duplicates by key
export function uniqueBy<T>(array: T[], keyFn: (item: T) => any): T[] {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Group array by key
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

// Sort array by multiple criteria
export function sortBy<T>(array: T[], ...criteria: ((item: T) => any)[]): T[] {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      const aVal = criterion(a);
      const bVal = criterion(b);

      if (aVal < bVal) { return -1; }
      if (aVal > bVal) { return 1; }
    }
    return 0;
  });
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Convert to title case
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, capitalize);
}

// Convert to camelCase
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

// Convert to kebab-case
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// Convert to snake_case
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

// Truncate string with ellipsis
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) { return str; }
  return str.substring(0, length - suffix.length) + suffix;
}

// Extract initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

// Pluralize word based on count
export function pluralize(word: string, count: number, suffix: string = 's'): string {
  return count === 1 ? word : word + suffix;
}

// ============================================================================
// URL & QUERY STRING UTILITIES
// ============================================================================

// Parse query string to object
export function parseQueryString(query: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(query));
}

// Convert object to query string
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

// Safe localStorage with JSON support
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch {
      return defaultValue ?? null;
    }
  },

  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage quota exceeded
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Handle errors
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // Handle errors
    }
  },
};

// ============================================================================
// EVENT UTILITIES
// ============================================================================

// Simple event emitter
export class EventEmitter<T extends Record<string, any>> {
  private events: Map<keyof T, Function[]> = new Map();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event)!;
    listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  off<K extends keyof T>(event: K, listener?: Function): void {
    if (!listener) {
      this.events.delete(event);
      return;
    }

    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1] || '0', 16),
    g: parseInt(result[2] || '0', 16),
    b: parseInt(result[3] || '0', 16),
  } : null;
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Convert hex to HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) { return null; }

  const { r, g, b } = rgb;
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Generate random color
export function generateRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// Lighten/darken color
export function adjustColorBrightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) { return hex; }

  const adjust = (value: number) => Math.max(0, Math.min(255, value + amount));

  return rgbToHex(
    adjust(rgb.r),
    adjust(rgb.g),
    adjust(rgb.b),
  );
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

// Sleep/delay function
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await sleep(delay);
    }
  }

  throw lastError!;
}

// Timeout wrapper
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out',
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => { reject(new Error(timeoutMessage)); }, timeoutMs);
    }),
  ]);
}

// ============================================================================
// FILE & DOWNLOAD UTILITIES
// ============================================================================

// Download data as file
export function downloadAsFile(data: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { resolve(reader.result as string); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Format file size
export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) { return '0 B'; }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// RESPONSIVE & DEVICE UTILITIES
// ============================================================================

// Check if device is mobile
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Check if device supports touch
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Get viewport dimensions
export function getViewportDimensions(): { width: number; height: number } {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  };
}

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

// Focus trap for modals
export function createFocusTrap(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTabKey(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement && lastElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else if (document.activeElement === lastElement && firstElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Generate unique ID for accessibility
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  cn,
  translateJargon,
  withJargon,
  getJargonDetails,
  formatDateWithLocale,
  createRelativeDateFormatter,
  getDateRange,
  validateInput,
  getValidationMessage,
  debounce,
  throttle,
  memoizeWithTTL,
  getNestedValue,
  setNestedValue,
  formatNumber,
  calculatePercentage,
  calculatePercentageChange,
  roundToNearest,
  clamp,
  lerp,
  mapRange,
  chunk,
  unique,
  uniqueBy,
  groupBy,
  sortBy,
  capitalize,
  toTitleCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  truncate,
  getInitials,
  pluralize,
  parseQueryString,
  buildQueryString,
  storage,
  EventEmitter,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  generateRandomColor,
  adjustColorBrightness,
  sleep,
  retryWithBackoff,
  withTimeout,
  downloadAsFile,
  fileToBase64,
  formatFileSize,
  isMobileDevice,
  isTouchDevice,
  getViewportDimensions,
  createFocusTrap,
  generateId,
};