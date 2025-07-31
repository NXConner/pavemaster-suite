// Shared UI Components
// Central export for all reusable UI components across features

// Layout Components
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Button, buttonVariants } from './button';
export { Badge, badgeVariants } from './badge';
export { Separator } from './separator';

// Form Components
export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';
export { Checkbox } from './checkbox';
export { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton 
} from './select';
export { Switch } from './switch';
export { Slider } from './slider';
export { 
  Form, 
  FormField, 
  FormSubmitButton 
} from './form';

// Navigation Components
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut
} from './dropdown-menu';
export { 
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from './breadcrumb';

// Overlay Components
export { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from './dialog';
export { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose,
  SheetOverlay,
  SheetPortal
} from './sheet';
export { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from './tooltip';
export { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from './popover';

// Feedback Components
export { Skeleton } from './skeleton';
export { Progress } from './progress';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { useToast, toast } from './use-toast';

// Data Display Components
export { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './table';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { ScrollArea, ScrollBar } from './scroll-area';

// Command & Search
export { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from './command';

// Additional Components
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
export { Sidebar } from './sidebar';

// Types
export type { ButtonProps } from './button';
export type { BadgeProps } from './badge';
export type { InputProps } from './input';
export type { LabelProps } from './label';
export type { TextareaProps } from './textarea';
export type { CheckboxProps } from './checkbox';
export type { SwitchProps } from './switch';
export type { SliderProps } from './slider';

// Constants and Utilities
export { cn } from '../lib/utils';