/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_WEATHER_API_KEY?: string
  readonly VITE_GA_TRACKING_ID?: string
  readonly VITE_MIXPANEL_TOKEN?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_ENCRYPTION_KEY?: string
  readonly VITE_VAPID_KEY?: string
  readonly VITE_TWILIO_API_KEY?: string
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  readonly VITE_APP_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}