# Installation Guide

This guide will walk you through setting up PaveMaster Suite on your local development environment or production server.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (or **yarn** 1.22.0+, **pnpm** 7.0.0+)
- **Git**: Latest version
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Hardware Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **CPU**: Multi-core processor (Intel i5/AMD Ryzen 5 or better)

## 🚀 Quick Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/pavemaster-suite.git
cd pavemaster-suite
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

Using pnpm:
```bash
pnpm install
```

### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```bash
# Required: Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: API Keys for enhanced features
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🐳 Docker Installation

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/your-org/pavemaster-suite.git
cd pavemaster-suite

# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Docker Setup

```bash
# Build production image
docker build -f Dockerfile.production -t pavemaster-suite:prod .

# Run production container
docker run -d \
  --name pavemaster-suite \
  -p 80:80 \
  -p 443:443 \
  --env-file .env.production \
  pavemaster-suite:prod
```

## 🛠️ Development Setup

### IDE Configuration

**VS Code** (Recommended):
1. Install recommended extensions (see `.vscode/extensions.json`)
2. Configure settings (see `.vscode/settings.json`)

**WebStorm/IntelliJ**:
1. Enable ESLint and Prettier
2. Configure TypeScript support
3. Install recommended plugins

### Git Hooks Setup

```bash
# Install pre-commit hooks
npm run prepare
```

### Database Setup (Optional)

If using local database:
```bash
# Start Supabase locally
npx supabase start

# Run migrations
npx supabase db push
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes | - |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | No | - |
| `VITE_MAPBOX_TOKEN` | Mapbox access token | No | - |
| `VITE_SENTRY_DSN` | Sentry error tracking | No | - |

### Build Configuration

The application uses Vite for building. Configuration can be modified in:
- `vite.config.ts` - Main Vite configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## 🚨 Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Kill process on port 8080
npx kill-port 8080
# Or use a different port
npm run dev -- --port 3000
```

**Node version issues**:
```bash
# Using nvm
nvm install 18
nvm use 18

# Using volta
volta install node@18
```

**Dependencies not installing**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Build errors**:
```bash
# Type check
npm run type-check

# Lint check
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Getting Help

- 📖 [Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/your-org/pavemaster-suite/issues)
- 💬 [Discussions](https://github.com/your-org/pavemaster-suite/discussions)
- 📧 [Support Email](mailto:support@pavemaster.com)

## ✅ Verification

After installation, verify everything works:

1. **Development server starts**: `npm run dev`
2. **Build completes**: `npm run build`
3. **Tests pass**: `npm run test:all`
4. **Linting passes**: `npm run lint`

## 🎉 Next Steps

- [Quick Start Guide](./quick-start.md)
- [Development Guide](./development.md)
- [Configuration Guide](./configuration.md)
- [Deployment Guide](./deployment.md)