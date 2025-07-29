// Application Constants
export const APP_NAME = "PaveMaster Suite"
export const APP_VERSION = "1.0.0"
export const APP_DESCRIPTION = "Enterprise Asphalt Operations Management"

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

// Authentication
export const TOKEN_KEY = "pavemaster_token"
export const REFRESH_TOKEN_KEY = "pavemaster_refresh_token"
export const USER_KEY = "pavemaster_user"

// Local Storage Keys
export const THEME_KEY = "pavemaster_theme"
export const LANGUAGE_KEY = "pavemaster_language"
export const PREFERENCES_KEY = "pavemaster_preferences"

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  ANALYTICS: "/analytics",
  TEAM: "/team",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const

// Feature Flags
export const FEATURES = {
  AI_ENABLED: import.meta.env.VITE_ENABLE_AI_FEATURES === "true",
  BLOCKCHAIN_ENABLED: import.meta.env.VITE_ENABLE_BLOCKCHAIN === "true",
  PWA_ENABLED: import.meta.env.VITE_ENABLE_PWA === "true",
  ANALYTICS_ENABLED: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  DEVELOPMENT_TOOLS: import.meta.env.VITE_ENABLE_DEVELOPMENT_TOOLS === "true",
} as const

// Theme Configuration
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Successfully logged in!",
  LOGOUT: "Successfully logged out!",
  SAVE: "Changes saved successfully!",
  DELETE: "Item deleted successfully!",
  UPDATE: "Update completed successfully!",
  CREATE: "Item created successfully!",
} as const

// Date Formats
export const DATE_FORMATS = {
  SHORT: "MMM dd, yyyy",
  LONG: "MMMM dd, yyyy",
  DATETIME: "MMM dd, yyyy 'at' h:mm a",
  TIME: "h:mm a",
  ISO: "yyyy-MM-dd",
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".pdf"],
} as const

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 39.8283, lng: -98.5795 }, // Center of USA
  DEFAULT_ZOOM: 4,
  MIN_ZOOM: 1,
  MAX_ZOOM: 20,
} as const

// Business Constants
export const BUSINESS = {
  EQUIPMENT_TYPES: [
    "Paver",
    "Roller",
    "Truck",
    "Excavator",
    "Bulldozer",
    "Grader",
    "Loader",
  ],
  PROJECT_STATUSES: [
    "Planning",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ],
  PRIORITY_LEVELS: ["Low", "Medium", "High", "Critical"],
  MEASUREMENT_UNITS: {
    AREA: ["sq ft", "sq yd", "sq m", "acres"],
    LENGTH: ["ft", "yd", "m", "mi", "km"],
    VOLUME: ["cu ft", "cu yd", "cu m", "gal", "L"],
    WEIGHT: ["lbs", "kg", "tons"],
  },
} as const

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_NAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 254,
  MAX_DESCRIPTION_LENGTH: 1000,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
  PROJECT_UPDATE: "project_update",
  TEAM_UPDATE: "team_update",
  NOTIFICATION: "notification",
  REAL_TIME_DATA: "real_time_data",
} as const

// Animation Durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const