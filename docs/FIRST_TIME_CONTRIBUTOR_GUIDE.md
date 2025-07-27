# 🚀 First-Time Contributor Guide - PaveMaster Suite

Welcome to the PaveMaster Suite! This guide will help you get up and running quickly as a contributor to this comprehensive pavement analysis and performance tracking application.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (optional, for local development) - [Download here](https://docker.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

## 🏃‍♂️ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pavemaster-suite
```

### 2. Install Dependencies
```bash
# Run the automated setup script
./scripts/install_dependencies.sh

# Or manually with npm
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local configuration
# At minimum, you'll need Supabase credentials
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
pavemaster-suite/
├── src/                          # Source code
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components (shadcn/ui)
│   │   ├── enhanced/             # Enhanced utility components
│   │   └── ...                   # Feature-specific components
│   ├── pages/                    # Route components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries
│   ├── integrations/supabase/    # Supabase client and types
│   └── index.css                 # Global styles and design tokens
├── public/                       # Static assets
├── scripts/                      # Build and deployment scripts
├── docs/                         # Project documentation
├── .github/                      # GitHub workflows and templates
├── supabase/                     # Supabase configuration
│   ├── functions/                # Edge functions
│   └── config.toml               # Supabase project config
└── monitoring/                   # Monitoring and observability
```

## 🎨 Design System

### Using the Design System
- **Colors**: Use semantic tokens from `src/index.css` (e.g., `hsl(var(--primary))`
- **Components**: Leverage shadcn/ui components in `src/components/ui/`
- **Styling**: Follow Tailwind CSS conventions with design system tokens
- **Responsive**: Mobile-first approach with responsive design

### Key Design Principles
```css
/* Use semantic color tokens */
.my-component {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* Leverage design system spacing */
.my-layout {
  @apply p-6 space-y-4;
}
```

## 🧩 Component Development

### Creating New Components
1. **Location**: Place in appropriate directory under `src/components/`
2. **Naming**: Use PascalCase (e.g., `MyComponent.tsx`)
3. **Structure**: Follow the established pattern:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  // other props
}

export const MyComponent: React.FC<MyComponentProps> = ({
  className,
  ...props
}) => {
  return (
    <div className={cn("base-styles", className)}>
      {/* component content */}
    </div>
  );
};
```

### UI Components
- **Base Components**: Use shadcn/ui components from `src/components/ui/`
- **Customization**: Create variants using `class-variance-authority`
- **Accessibility**: Ensure all components are accessible (use proper ARIA attributes)

## 🔧 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes
# Test your changes
npm run test

# Lint and format
npm run lint
npm run format

# Commit changes
git add .
git commit -m "feat: add new feature description"

# Push and create PR
git push origin feature/my-new-feature
```

### 2. Code Quality
- **Linting**: ESLint configuration enforces code quality
- **Formatting**: Prettier maintains consistent code style
- **Type Safety**: TypeScript provides compile-time error checking
- **Testing**: Jest and React Testing Library for unit tests

### 3. Git Workflow
- **Branching**: Use feature branches for all development
- **Commits**: Follow conventional commit format
- **Pull Requests**: Use the provided PR template
- **Reviews**: All PRs require review before merging

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# All tests
npm test
```

### Writing Tests
```tsx
// Component test example
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## 🗄️ Database Development

### Supabase Integration
- **Client**: Use `@/integrations/supabase/client`
- **Types**: Auto-generated types in `@/integrations/supabase/types`
- **Migrations**: Use Supabase migration tools for schema changes

### Making Database Changes
1. **Plan Changes**: Document schema modifications
2. **Create Migration**: Use Supabase CLI or dashboard
3. **Test Migration**: Verify in development environment
4. **Update Types**: Regenerate TypeScript types
5. **Update Code**: Modify application code as needed

## 🚀 Deployment

### Local Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Development
```bash
# Build and run with Docker
docker-compose up -d

# Development mode
docker-compose --profile dev up -d
```

## 🔍 Debugging

### Available Tools
- **Console Logs**: Use browser dev tools
- **React DevTools**: Install browser extension
- **Network Tab**: Monitor API calls
- **Supabase Dashboard**: Check database and auth

### Common Issues
1. **Build Errors**: Check TypeScript errors and dependencies
2. **API Issues**: Verify Supabase configuration and permissions
3. **Styling Issues**: Ensure proper design system usage
4. **Performance**: Use React DevTools Profiler

## 📚 Learning Resources

### Project-Specific
- **Documentation**: Check `docs/` directory for detailed guides
- **Code Examples**: Review existing components for patterns
- **API Documentation**: Generated at `/api-docs` route

### Technology Stack
- **React**: [Official Documentation](https://react.dev/)
- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **Tailwind CSS**: [Tailwind Documentation](https://tailwindcss.com/docs)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **shadcn/ui**: [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🆘 Getting Help

### Communication Channels
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Code Review**: Pull Request comments for specific code feedback

### Before Asking for Help
1. **Search Existing Issues**: Check if your question has been asked before
2. **Read Documentation**: Review relevant documentation sections
3. **Check Console**: Look for error messages in browser console
4. **Minimal Reproduction**: Create a minimal example of the issue

## 🎯 Contribution Guidelines

### What We're Looking For
- **Bug Fixes**: Issues and improvements to existing functionality
- **Feature Enhancements**: Improvements to existing features
- **New Features**: Well-planned additions that align with project goals
- **Documentation**: Improvements to guides and code comments
- **Performance**: Optimizations and efficiency improvements

### Code Standards
- **TypeScript**: Strong typing for all new code
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Considerate of bundle size and runtime performance
- **Mobile-First**: Responsive design for all screen sizes
- **Design System**: Consistent use of design tokens and components

### Pull Request Process
1. **Fork Repository**: Create your own fork
2. **Create Branch**: Use descriptive branch names
3. **Make Changes**: Follow coding standards and patterns
4. **Test Thoroughly**: Ensure all tests pass
5. **Update Documentation**: Add/update relevant documentation
6. **Submit PR**: Use the provided template
7. **Address Reviews**: Respond to feedback promptly

## 🎉 Welcome to the Team!

Thank you for contributing to PaveMaster Suite! Your contributions help make this tool better for the pavement industry. Don't hesitate to ask questions and share ideas - we're all here to learn and build something amazing together.

Happy coding! 🚀
