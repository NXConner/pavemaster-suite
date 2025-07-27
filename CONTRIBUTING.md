# Contributing to Pavement Performance Suite

Thank you for your interest in contributing to the Pavement Performance Suite! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Familiarity with React, TypeScript, and Supabase
- Understanding of asphalt paving industry (helpful but not required)

### Development Setup
1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/pavement-performance-suite.git
   cd pavement-performance-suite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## 📋 How to Contribute

### 🐛 Reporting Bugs
1. **Search existing issues** to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Include detailed information**:
   - Browser/device information
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots or error messages

### 💡 Suggesting Features
1. **Check the roadmap** to see if it's already planned
2. **Use the feature request template**
3. **Provide clear use cases** and business justification
4. **Consider the scope** - start with small, focused features

### 🔧 Code Contributions

#### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/[description]` - New features
- `bugfix/[description]` - Bug fixes
- `hotfix/[description]` - Critical production fixes

#### Pull Request Process
1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add new material calculator feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Fill out PR template** with detailed description

## 📝 Coding Standards

### TypeScript Guidelines
- **Use TypeScript** for all new code
- **Define interfaces** for all data structures
- **Use strict mode** and resolve all type errors
- **Prefer type inference** when possible

```typescript
// ✅ Good
interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed';
  createdAt: Date;
}

// ❌ Avoid
const project: any = { ... };
```

### React Guidelines
- **Use functional components** with hooks
- **Custom hooks** for reusable logic
- **Props interfaces** for all components
- **Meaningful component names**

```typescript
// ✅ Good
interface MaterialCalculatorProps {
  area: number;
  thickness: number;
  onCalculate: (result: CalculationResult) => void;
}

export function MaterialCalculator({ area, thickness, onCalculate }: MaterialCalculatorProps) {
  // Component implementation
}
```

### CSS/Styling Guidelines
- **Use Tailwind CSS** utility classes
- **Semantic design tokens** from index.css
- **Responsive design** by default
- **Dark mode support**

```tsx
// ✅ Good
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Calculate
</button>

// ❌ Avoid
<button className="bg-blue-500 text-white hover:bg-blue-600">
  Calculate
</button>
```

### File Organization
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── pages/               # Route components
├── hooks/               # Custom hooks
├── lib/                 # Utilities and helpers
├── types/               # TypeScript type definitions
└── assets/              # Static assets
```

## 🧪 Testing Guidelines

### Unit Tests
- **Test all business logic**
- **Use Jest and React Testing Library**
- **Mock external dependencies**
- **Aim for 80%+ coverage**

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { MaterialCalculator } from './MaterialCalculator';

describe('MaterialCalculator', () => {
  it('calculates material quantity correctly', () => {
    render(<MaterialCalculator area={1000} thickness={2} onCalculate={jest.fn()} />);
    // Test implementation
  });
});
```

### Integration Tests
- **Test user workflows**
- **Use Cypress for E2E testing**
- **Test critical business paths**

### Performance Testing
- **Monitor bundle size**
- **Test mobile performance**
- **Measure Core Web Vitals**

## 📚 Documentation Guidelines

### Code Documentation
- **JSDoc comments** for functions and classes
- **README files** for complex modules
- **Inline comments** for complex logic

```typescript
/**
 * Calculates the amount of asphalt needed for a given area
 * @param area - Area in square feet
 * @param thickness - Thickness in inches
 * @param density - Asphalt density in lbs/ft³ (default: 150)
 * @returns Material quantity in tons
 */
export function calculateAsphaltQuantity(
  area: number, 
  thickness: number, 
  density = 150
): number {
  // Implementation
}
```

### API Documentation
- **OpenAPI/Swagger specs** for all endpoints
- **Request/response examples**
- **Error handling documentation**

## 🏗️ Industry Knowledge

### Asphalt Paving Basics
Understanding these concepts will help with contributions:
- **Mix temperatures** and application windows
- **Compaction** requirements and equipment
- **Weather dependencies** for operations
- **Quality control** standards and testing

### Business Context
- **Small contractor challenges** (2-10 employees)
- **Project lifecycle** from estimate to completion
- **Equipment management** and maintenance
- **Safety compliance** requirements

## 🚀 Feature Development Process

### 1. Planning Phase
- **Create GitHub issue** with detailed requirements
- **Discuss approach** in issue comments
- **Get approval** from maintainers before starting

### 2. Development Phase
- **Create feature branch** from develop
- **Implement incrementally** with regular commits
- **Add comprehensive tests**
- **Update documentation**

### 3. Review Phase
- **Self-review** your changes
- **Run full test suite**
- **Create detailed PR** with screenshots/videos
- **Address review feedback** promptly

### 4. Release Phase
- **Merge to develop** for integration testing
- **Deploy to staging** for validation
- **Merge to main** for production release

## 🔄 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **Major** (1.0.0) - Breaking changes
- **Minor** (1.1.0) - New features, backwards compatible
- **Patch** (1.1.1) - Bug fixes

### Changelog
Update `CHANGELOG.md` with:
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

## 🎯 Contribution Areas

### High Priority
- **Mobile optimization** and native app features
- **AI/ML improvements** for predictive analytics
- **IoT integrations** for equipment monitoring
- **Performance optimizations**

### Medium Priority
- **Third-party integrations** (QuickBooks, etc.)
- **Advanced reporting** features
- **Workflow automation**
- **User experience improvements**

### Good First Issues
- **UI component improvements**
- **Documentation updates**
- **Test coverage improvements**
- **Accessibility enhancements**

## 🛡️ Security Guidelines

### Reporting Security Issues
- **Do not** create public issues for security vulnerabilities
- **Email** security@pavementperformance.com with details
- **Include** steps to reproduce and potential impact

### Security Best Practices
- **Never commit** secrets or API keys
- **Use environment variables** for configuration
- **Validate all inputs** on client and server
- **Follow OWASP guidelines**

## 📞 Getting Help

### Communication Channels
- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Discord** - Real-time chat and collaboration
- **Email** - development@pavementperformance.com

### Mentorship
New contributors can request mentorship:
- **Pair programming** sessions
- **Code review** guidance
- **Architecture** discussions
- **Industry knowledge** sharing

## 🏆 Recognition

### Contributors
- **Listed** in README.md
- **Featured** in release notes
- **Invited** to contributor events
- **Referral bonuses** for successful hires

### Significant Contributions
- **Co-maintainer** status
- **Speaking opportunities** at conferences
- **Case study** features
- **Professional references**

## 📋 Checklist

Before submitting a PR, ensure:
- [ ] Code follows style guidelines
- [ ] Tests pass and coverage is maintained
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] PR template is filled out
- [ ] No secrets or sensitive data included
- [ ] Breaking changes are clearly documented

## 🙏 Thank You

Your contributions help make the asphalt paving industry more efficient and profitable. Every bug fix, feature addition, and documentation improvement makes a difference for contractors worldwide.

---

**Questions?** Reach out to our team at development@pavementperformance.com or join our Discord community!