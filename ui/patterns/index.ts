// ISAC-OS Design Patterns - Composite Components

// Data Display Patterns
export { default as DataGrid } from './DataGrid';
export { default as StatsGrid } from './StatsGrid';
export { default as MetricsPanel } from './MetricsPanel';
export { default as KPICard } from './KPICard';
export { default as DashboardWidget } from './DashboardWidget';

// Navigation Patterns
export { default as Breadcrumbs } from './Breadcrumbs';
export { default as SidebarNavigation } from './SidebarNavigation';
export { default as TabNavigation } from './TabNavigation';
export { default as StepperNavigation } from './StepperNavigation';
export { default as PaginationControls } from './PaginationControls';

// Form Patterns
export { default as SearchForm } from './SearchForm';
export { default as FilterForm } from './FilterForm';
export { default as LoginForm } from './LoginForm';
export { default as RegistrationForm } from './RegistrationForm';
export { default as SettingsForm } from './SettingsForm';
export { default as WizardForm } from './WizardForm';

// Content Patterns
export { default as ArticleCard } from './ArticleCard';
export { default as ProductCard } from './ProductCard';
export { default as UserCard } from './UserCard';
export { default as ProjectCard } from './ProjectCard';
export { default as NotificationCard } from './NotificationCard';

// Layout Patterns
export { default as HeaderLayout } from './HeaderLayout';
export { default as SidebarLayout } from './SidebarLayout';
export { default as DashboardLayout } from './DashboardLayout';
export { default as AuthLayout } from './AuthLayout';
export { default as ErrorLayout } from './ErrorLayout';

// Interactive Patterns
export { default as ModalManager } from './ModalManager';
export { default as TooltipManager } from './TooltipManager';
export { default as ContextMenu } from './ContextMenu';
export { default as ActionBar } from './ActionBar';
export { default as CommandPalette } from './CommandPalette';

// Security Patterns
export { default as PermissionWrapper } from './PermissionWrapper';
export { default as SecurityBadge } from './SecurityBadge';
export { default as PrivacyToggle } from './PrivacyToggle';
export { default as ConsentBanner } from './ConsentBanner';

// Communication Patterns
export { default as ChatInterface } from './ChatInterface';
export { default as CommentThread } from './CommentThread';
export { default as FeedbackForm } from './FeedbackForm';
export { default as AnnouncementBanner } from './AnnouncementBanner';

// Types
export type {
  PatternProps,
  LayoutProps,
  NavigationProps,
  FormProps,
  ContentProps
} from './types';