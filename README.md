# PaveMaster Suite

**AI-Assisted Pavement Analysis and Performance Tracking System**

[![Build Status](https://github.com/pavemaster/suite/workflows/CI/badge.svg)](https://github.com/pavemaster/suite/actions)
[![Security Scan](https://github.com/pavemaster/suite/workflows/Security/badge.svg)](https://github.com/pavemaster/suite/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%3E%3D18.3.0-blue.svg)](https://reactjs.org/)

A comprehensive, production-ready web application for asphalt paving and sealing contractors, featuring AI-powered decision support, real-time GPS tracking, IoT integration, and enterprise-grade project management capabilities.

## 🎯 Core Mission
Empower small to medium-sized paving businesses with cutting-edge technology for efficient project management, precise estimations, and data-driven decision-making, with specialized focus on church parking lot optimization.

## 🛠 Technology Stack

### Frontend
- **React 18.3+** - Modern component-based UI framework
- **TypeScript** - Type-safe development and better IDE support
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Radix UI** - Accessible, unstyled UI components
- **React Router** - Client-side routing and navigation
- **React Query** - Server state management and caching
- **Zustand** - Lightweight state management

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Node.js** - JavaScript runtime for build tools and scripts
- **Docker** - Containerization for consistent deployments
- **GitHub Actions** - CI/CD pipeline automation

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit validation
- **Playwright** - End-to-end testing framework
- **Vitest** - Unit testing framework
- **K6 & Artillery** - Performance and load testing

### Mobile Development
- **Capacitor** - Cross-platform mobile app development
- **Android Studio** - Android development environment
- **Xcode** - iOS development environment

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Supabase** account (for backend services)
- **Docker** (optional, for containerized deployment)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/pavemaster/suite.git
cd suite

# Install dependencies
npm install

# Or use the automated installer
chmod +x scripts/install_dependencies.sh
./scripts/install_dependencies.sh
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ENVIRONMENT=development
```

### 3. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Development

```bash
# Start development server
npm run dev

# Application will be available at http://localhost:8080
```

## 🔐 Authentication Roles
- **Super Admin**: Full system access
- **Admin**: Manage users, projects
- **Manager**: Project oversight
- **Field Crew**: Operational tasks
- **Client**: Limited project visibility

## 📊 Key Features

### Project Management
- Complete project lifecycle tracking
- Church-specific workflow optimization
- Resource allocation and scheduling

### Estimation Tools
- Visual parking lot layout design
- Precise material and cost calculations
- Dynamic pricing models

### Equipment Tracking
- Asset management
- Maintenance scheduling
- IoT device integration

### Weather & Environmental Monitoring
- Real-time weather impact predictions
- Temperature tracking for optimal operations

### AI-Powered Insights
- Predictive maintenance
- Performance optimization
- Quality control predictions

## 🧪 Testing
```bash
pnpm test:unit      # Run unit tests
pnpm test:integration  # Run integration tests
pnpm test:e2e       # Run end-to-end tests
```

## 🚢 Deployment
- **Staging**: Automatically deployed on merge to `develop`
- **Production**: Automatically deployed on merge to `main`

### Docker Deployment
```bash
docker-compose up --build
```

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push and create Pull Request

### Contribution Guidelines
- Follow TypeScript best practices
- 100% test coverage for new features
- Update documentation
- Adhere to our Code of Conduct

## 📜 License
MIT License

## 🛡️ Security
- Regular vulnerability scanning
- GDPR compliant
- SOC 2 considerations

## 📞 Support
For issues, feature requests, or support:
- Email: support@pavemastersuit.com
- GitHub Issues

## 🌐 Roadmap
Check our [IMPLEMENTATION_STRATEGY.md](IMPLEMENTATION_STRATEGY.md) for detailed feature roadmap

## 💡 Unique Value Proposition
Transforming church parking lot management through technology, precision, and intelligent design.

---

**Built with ❤️ for the Paving Industry**