# Contributing to PaveMaster Suite

Thank you for your interest in contributing to PaveMaster Suite! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Git
- A Supabase account
- Familiarity with React, TypeScript, and Tailwind CSS

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pavemaster-suite
   ```

2. **Run the installation script**
   ```bash
   # On macOS/Linux
   chmod +x scripts/install_dependencies.sh
   ./scripts/install_dependencies.sh
   
   # On Windows
   scripts/install_dependencies.bat
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── forms/          # Form components
│   ├── charts/         # Chart components
│   └── modals/         # Modal components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── lib/                # Utility functions and configurations
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type - use specific types or `unknown`
- Use strict mode settings

### React

- Use functional components with hooks
- Follow React best practices for performance
- Use proper dependency arrays in useEffect
- Implement proper error boundaries

### Styling

- Use Tailwind CSS for styling
- Follow the design system defined in `src/index.css`
- Use semantic color tokens, not direct colors
- Ensure responsive design for all components
- Maintain accessibility standards (WCAG 2.1 AA)

### Code Organization

```typescript
// ✅ Good - Proper imports order
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { Project } from '@/types/project';

// ✅ Good - Clear component structure
interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  // Component logic here
}
```

### Database

- Use proper RLS policies for all tables
- Follow naming conventions (snake_case for database, camelCase for TypeScript)
- Include proper indexes for performance
- Write idempotent migrations

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes  
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions/changes

### Commit Messages

Follow conventional commits:

```
type(scope): description

Examples:
feat(auth): add password reset functionality
fix(dashboard): resolve metric calculation error
docs(api): update endpoint documentation
refactor(components): extract common button logic
test(utils): add unit tests for date helpers
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following coding standards
3. Add/update tests as needed
4. Update documentation if required
5. Ensure all checks pass
6. Create a detailed pull request

## Testing

### Types of Tests

1. **Unit Tests** - Test individual functions/components
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test complete user workflows

### Testing Guidelines

- Write tests for all new functionality
- Maintain at least 85% code coverage
- Use descriptive test names
- Test both happy path and error cases
- Mock external dependencies properly

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Documentation

### Code Documentation

- Use JSDoc for functions and complex logic
- Include type information in comments
- Document business logic and algorithms
- Explain "why" not just "what"

### API Documentation

- Document all API endpoints
- Include request/response examples
- Specify error codes and messages
- Update OpenAPI/Swagger specifications

### User Documentation

- Keep README.md up to date
- Include setup instructions
- Document new features and changes
- Provide troubleshooting guides

## Security Guidelines

### Input Validation

- Validate all user inputs
- Use proper sanitization
- Implement rate limiting
- Follow OWASP best practices

### Authentication & Authorization

- Use proper RLS policies
- Implement role-based access control
- Secure API endpoints
- Handle sessions properly

### Data Protection

- Encrypt sensitive data
- Use HTTPS everywhere
- Implement proper logging (no sensitive data)
- Follow data retention policies

## Performance Guidelines

### Frontend Performance

- Implement code splitting
- Use lazy loading for routes
- Optimize images and assets
- Minimize bundle size
- Implement proper caching

### Database Performance

- Use proper indexes
- Optimize queries
- Implement pagination
- Monitor query performance
- Use database functions when appropriate

## Accessibility Guidelines

- Use semantic HTML
- Implement proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Test with screen readers
- Provide alternative text for images

## Business Context

### Church Parking Lot Focus

When contributing features, consider:

- Service time coordination (avoid disruptions)
- Congregation access and safety
- Weather dependencies for outdoor work
- Seasonal considerations
- Visual presentation for approval processes

### Small Business Considerations

- Keep interfaces simple and intuitive
- Minimize training requirements
- Automate repetitive tasks
- Optimize for efficiency
- Consider limited technical expertise

## Code Review Guidelines

### For Reviewers

- Check code quality and standards
- Verify business logic correctness
- Test functionality locally
- Review security implications
- Suggest improvements constructively

### For Contributors

- Respond to feedback promptly
- Ask questions if unclear
- Make requested changes
- Update tests and documentation
- Verify all checks pass

## Release Process

1. **Feature Development** - Development in feature branches
2. **Code Review** - Thorough peer review process
3. **Testing** - Comprehensive testing in staging
4. **Documentation** - Update all relevant documentation
5. **Deployment** - Automated deployment to production
6. **Monitoring** - Post-deployment monitoring and verification

## Getting Help

- Create an issue for bugs or feature requests
- Use discussions for questions and ideas
- Check existing documentation and code
- Reach out to maintainers for guidance

## License

By contributing to PaveMaster Suite, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to PaveMaster Suite! Your efforts help improve asphalt operations management for businesses everywhere.