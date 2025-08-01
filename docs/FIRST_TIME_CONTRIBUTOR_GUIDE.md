# First-Time Contributor Guide - PaveMaster Suite

## Welcome to PaveMaster Suite! 🚧

This guide will help you get started as a contributor to the most comprehensive asphalt paving and sealing management platform.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Tailwind CSS

## Quick Start (5 minutes)

### 1. Clone and Setup
```bash
git clone https://github.com/your-org/pavemaster-suite.git
cd pavemaster-suite
chmod +x scripts/install_dependencies.sh
./scripts/install_dependencies.sh
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Start Development
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   └── layout/         # Layout components
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── integrations/       # External service integrations
```

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Follow the existing code style
- Use TypeScript for type safety
- Write tests for new functionality
- Update documentation if needed

### 3. Test Your Changes
```bash
npm run test          # Unit tests
npm run type-check    # TypeScript validation
npm run lint          # Code linting
npm run build         # Production build test
```

### 4. Commit and Push
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Use the PR template
- Include screenshots for UI changes
- Link related issues
- Request review from CODEOWNERS

## Coding Standards

### React Components
```typescript
// ✅ Good: Functional component with TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children }) => {
  return (
    <button className={`btn btn-${variant}`}>
      {children}
    </button>
  );
};
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow the design system tokens in `index.css`
- Use semantic color variables (not direct colors)
- Ensure responsive design for all components

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.tsx`
- Utilities: `kebab-case.ts`
- Pages: `PascalCase.tsx`

## Common Tasks

### Adding a New Component
1. Create component file in appropriate directory
2. Export from barrel file if applicable
3. Add to Storybook if it's a UI component
4. Write tests
5. Update documentation

### Working with Supabase
```typescript
import { supabase } from '@/integrations/supabase/client';

// ✅ Good: Type-safe database queries
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active');
```

### Adding Dependencies
```bash
# Use the dependency manager
lov-add-dependency package-name@version
```

## Testing

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test';

test('user can create a project', async ({ page }) => {
  await page.goto('/projects');
  await page.click('[data-testid="create-project"]');
  // ... test steps
});
```

## Debugging

### Console Logs
Use the built-in debugging tools:
```bash
lov-read-console-logs error
```

### Network Requests
Monitor API calls:
```bash
lov-read-network-requests
```

### Performance
Monitor performance with built-in tools in `src/lib/performance-monitor.ts`

## Common Issues & Solutions

### Build Errors
- Check TypeScript errors: `npm run type-check`
- Verify imports and exports
- Ensure all dependencies are installed

### Styling Issues
- Use browser dev tools to inspect elements
- Check Tailwind configuration
- Verify design system tokens

### Database Issues
- Check Supabase connection
- Verify RLS policies
- Review migration files

## Getting Help

1. **Documentation**: Check `docs/` directory
2. **Code Examples**: Look at existing components
3. **Issues**: Create a GitHub issue with details
4. **Discussions**: Use GitHub Discussions for questions
5. **Code Review**: Ask for help in PR comments

## Contributing Guidelines

### Pull Request Checklist
- [ ] Tests pass (`npm run test`)
- [ ] Code is linted (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated
- [ ] Screenshots included (UI changes)
- [ ] Accessibility tested

### Commit Message Format
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: component, page, or feature area
```

### Review Process
1. Automated checks must pass
2. Code review by CODEOWNERS
3. Manual testing if needed
4. Merge after approval

## Project Context

### Business Domain
PaveMaster Suite serves asphalt paving and sealing contractors with:
- Project management and tracking
- Equipment and crew management
- Financial tracking and reporting
- Weather monitoring for operations
- Customer relationship management

### Key Features
- **Dashboard**: Operational overview and metrics
- **Projects**: Complete project lifecycle management
- **Equipment**: Asset tracking and maintenance
- **Employees**: Crew management and scheduling
- **Fleet**: Vehicle tracking and management

### Target Users
- Small to medium asphalt contractors
- Field crews and project managers
- Business owners and administrators
- Church parking lot specialists

## Resources

- [Project Documentation](./README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Guidelines](./SECURITY_IMPLEMENTATION_GUIDE.md)
- [Performance Guide](./QUALITY_PERFORMANCE_REPORT.md)

## Success Tips

1. **Start Small**: Begin with small changes to understand the codebase
2. **Ask Questions**: Don't hesitate to ask for clarification
3. **Follow Patterns**: Look at existing code for patterns to follow
4. **Test Thoroughly**: Always test your changes before submitting
5. **Document Changes**: Update documentation for significant changes

Welcome to the team! 🎉