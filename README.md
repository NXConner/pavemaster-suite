# 🏗️ PaveMaster Suite

> **Enterprise Asphalt Operations Management System**  
> Specialized for church parking lot repair, sealcoating, and line-striping optimization

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/supabase-2.52.1-green.svg)](https://supabase.com/)

## 🌟 Overview

PaveMaster Suite is a comprehensive, AI-assisted enterprise solution designed specifically for asphalt paving operations management. With a special focus on church parking lot services, it streamlines everything from project estimation to crew management, helping small contractors maximize efficiency while maintaining the highest quality standards.

### 🎯 Key Features

- **📊 Project Management** - Complete lifecycle tracking from estimation to completion
- **👥 Customer Relationship Management** - Church-focused CRM with service time coordination
- **🚛 Fleet & Equipment Management** - Real-time asset tracking and maintenance scheduling
- **📱 Mobile-First Design** - Touch-friendly interfaces for field crews
- **🔒 Enterprise Security** - Bank-level security with role-based access control
- **📈 Business Intelligence** - Advanced analytics and performance metrics
- **🌤️ Weather Integration** - Operation planning with weather-aware scheduling
- **💰 Financial Management** - Cost tracking, revenue analysis, and profitability reporting

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pavemaster-suite
   ```

2. **Run the automated setup**
   ```bash
   # macOS/Linux
   chmod +x scripts/install_dependencies.sh
   ./scripts/install_dependencies.sh
   
   # Windows
   scripts/install_dependencies.bat
   ```

3. **Configure your environment**
   ```bash
   # Update .env with your actual configuration
   nano .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Visit the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

## 🔐 Authentication & Getting Started

### Admin Account Setup

1. **Sign up with the super admin email**: `n8ter8@gmail.com`
   - This email is automatically assigned super admin privileges
   - You can also use the password reset feature if needed

2. **Access the dashboard** after successful authentication

3. **Configure your business settings** in the Settings page

### User Management

- Super admins can create additional user accounts
- Role-based access control (super_admin, admin, manager, crew, driver)
- Each user gets appropriate permissions based on their role

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: TanStack Query + React Context
- **Security**: Row Level Security (RLS) + Enterprise-grade validation

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base shadcn/ui components
│   ├── forms/          # Form components
│   ├── charts/         # Data visualization
│   └── modals/         # Modal dialogs
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── services/           # API integrations
├── lib/                # Utilities and configurations
├── contexts/           # React contexts
├── types/              # TypeScript definitions
└── assets/             # Static assets
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking

# Database
npm run db:reset        # Reset local database
npm run db:seed         # Seed database with sample data
npm run db:migrate      # Run pending migrations
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
VITE_WEATHER_API_KEY=your_weather_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## 🏢 Business Focus

### Church Parking Lot Specialization

- **⛪ Service Time Coordination** - Automatic scheduling around worship services
- **👥 Congregation Communication** - Dedicated notification systems
- **📋 Visual Project Approval** - Layout mockups for church approval
- **🎯 Minimal Disruption Planning** - Strategic timing to avoid conflicts

### Small Business Optimization

Designed for teams of **2 full-time + 1 part-time employees**:

- **🚀 Automation-First** - Reduce manual administrative tasks by 30%
- **📱 Mobile-Optimized** - Field crews can work efficiently on any device
- **💡 Intuitive Design** - Minimal training required for new users
- **📈 Scalable Architecture** - Grows with your business

## 📞 Support

- **🐛 Issues**: Use the GitHub Issues tab for bug reports
- **💡 Feature Requests**: Submit feature requests via GitHub Issues
- **📚 Documentation**: Check the docs/ folder for detailed guides

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for the asphalt paving industry**

[Lovable Project](https://lovable.dev/projects/7eb30887-9626-47d4-a66e-506f2cf77df6)

</div>
