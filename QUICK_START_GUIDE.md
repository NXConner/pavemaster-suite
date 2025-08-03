# 🚀 PaveMaster Suite - Quick Start Guide

**Get up and running in under 15 minutes!**

This guide will have you running the PaveMaster Suite locally and ready for production deployment in just a few simple steps.

---

## ⚡ **1-MINUTE OVERVIEW**

The PaveMaster Suite is an AI-powered pavement analysis and performance tracking system designed for asphalt contractors. This quick start gets you:

- ✅ Full development environment running locally
- ✅ Sample data loaded and ready to explore
- ✅ All features accessible immediately
- ✅ Production deployment ready

---

## 📋 **PREREQUISITES (2 minutes)**

### **Required Software**
```bash
# Check if you have these installed:
node --version    # Need v18 or higher
npm --version     # Should be v8 or higher
git --version     # Any recent version
```

### **Install Missing Prerequisites**

**macOS (using Homebrew):**
```bash
brew install node npm git
```

**Windows (using Chocolatey):**
```bash
choco install nodejs npm git
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nodejs npm git
```

**Manual Installation:**
- **Node.js**: https://nodejs.org/ (Download LTS version)
- **Git**: https://git-scm.com/

---

## 🚀 **AUTOMATED SETUP (5 minutes)**

### **Step 1: Clone the Repository**
```bash
git clone [your-repository-url]
cd pavemaster-suite
```

### **Step 2: Run the Automated Setup**
```bash
# Make the setup script executable
chmod +x scripts/setup.sh

# Run the automated setup
./scripts/setup.sh
```

**What the setup script does:**
- ✅ Checks all prerequisites
- ✅ Installs all dependencies
- ✅ Creates environment configuration
- ✅ Fixes code quality issues
- ✅ Builds the application
- ✅ Provides next steps

---

## ⚙️ **MANUAL SETUP (Alternative - 8 minutes)**

If you prefer manual setup or the automated script fails:

### **Step 1: Install Dependencies**
```bash
npm install --legacy-peer-deps
```

### **Step 2: Create Environment File**
```bash
cp .env.example .env
```

### **Step 3: Configure Environment**
Edit the `.env` file with your settings:
```bash
# Edit with your preferred editor
nano .env
# or
code .env
```

**Minimum required changes:**
```env
# Update these with your actual Supabase project details
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
```

### **Step 4: Build and Test**
```bash
# Check for any code issues
npm run lint

# Build the application
npm run build

# Start development server
npm run dev
```

---

## 🗄️ **DATABASE SETUP (3 minutes)**

### **Option A: Quick Demo Mode**
The application works immediately with demo data - no database setup required for testing!

### **Option B: Full Supabase Setup**

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create a new project
   - Copy the URL and anon key

2. **Update Environment:**
   ```bash
   # Add to your .env file
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Run Migrations:**
   ```bash
   # In your Supabase SQL editor, run the migration files from:
   # supabase/migrations/
   ```

---

## 🌐 **START THE APPLICATION (1 minute)**

### **Development Mode**
```bash
npm run dev
```
- Opens at: http://localhost:5173
- Hot reload enabled
- Development tools available

### **Production Mode**
```bash
npm run build
npm run preview
```
- Optimized production build
- Opens at: http://localhost:4173

---

## 🎯 **FIRST STEPS IN THE APPLICATION**

### **1. Authentication**
- Navigate to `/auth`
- Create your admin account
- First registered user gets admin privileges

### **2. Explore Key Features**
- 📊 **Dashboard**: Overview of all operations
- 📈 **Analytics**: Business intelligence and reports
- 🛠️ **Projects**: Manage paving projects
- 📱 **Mobile**: Responsive mobile interface
- ⚙️ **Settings**: Configure your preferences

### **3. Sample Data**
The application comes with demo data to explore:
- Sample projects and estimates
- Equipment tracking data
- Employee records
- Weather information
- Analytics charts

---

## 🔧 **AVAILABLE COMMANDS**

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Quality & Testing
npm run lint            # Check code quality
npm run lint --fix      # Auto-fix linting issues
npm run type-check      # TypeScript compilation check
npm run test:all        # Run all tests (when available)

# Mobile Development
npm run mobile:prepare  # Prepare for mobile build
npm run mobile:android  # Build Android app
npm run mobile:ios      # Build iOS app (macOS only)

# Utilities
npm run analyze         # Analyze bundle size
npm run preview:network # Preview on network
```

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **Quick Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to deploy
```

### **Quick Deploy to Netlify**
```bash
# Build the application
npm run build

# Upload the 'dist' folder to Netlify
# Or connect your Git repository to Netlify for auto-deploy
```

### **Docker Deployment**
```bash
# Build Docker image
docker build -t pavemaster-suite .

# Run container
docker run -p 3000:3000 pavemaster-suite
```

---

## 🛠️ **CUSTOMIZATION QUICK REFERENCE**

### **Branding**
- **Logo**: Replace files in `src/assets/`
- **Colors**: Edit `src/index.css` (CSS variables)
- **Company Info**: Update `src/config/company.ts`

### **Features**
- **Environment Variables**: Edit `.env` file
- **Feature Flags**: Available in `.env` (VITE_FEATURE_*)
- **Settings**: Use the Settings page in the app

### **Data**
- **Demo Data**: Files in `src/data/`
- **Database**: Supabase migrations in `supabase/migrations/`
- **API**: Services in `src/services/`

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues**

**1. Dependencies won't install:**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**2. Build fails:**
```bash
# Check TypeScript errors
npm run type-check

# Fix linting issues
npm run lint --fix
```

**3. Application won't start:**
```bash
# Check environment file exists
ls -la .env

# Verify it has content
cat .env
```

**4. Supabase connection issues:**
- Verify your Supabase URL and keys in `.env`
- Check Supabase project is active
- Ensure RLS policies are set up correctly

### **Get Help**
- 📚 **Documentation**: `docs/` folder
- 🐛 **Issues**: Check existing issues in the repository
- 💬 **Community**: Discussions section
- 📧 **Support**: Contact your development team

---

## 📱 **MOBILE DEVELOPMENT**

### **Test on Mobile**
```bash
# Start dev server with network access
npm run dev -- --host

# Access from mobile device using your IP
# Example: http://192.168.1.100:5173
```

### **Build Native Apps**
```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Prepare mobile build
npm run mobile:prepare

# Open in Android Studio
npm run mobile:android

# Open in Xcode (macOS only)
npm run mobile:ios
```

---

## 🎉 **SUCCESS CHECKLIST**

After following this guide, you should have:

- [ ] ✅ Application running at http://localhost:5173
- [ ] ✅ All features accessible and working
- [ ] ✅ Demo data visible in all sections
- [ ] ✅ Settings page fully functional
- [ ] ✅ Analytics dashboard showing charts
- [ ] ✅ Mobile responsive interface
- [ ] ✅ Production build working
- [ ] ✅ Environment properly configured

**🎯 Total Time: ~15 minutes**

---

## 🚀 **WHAT'S NEXT?**

### **Development**
1. Customize branding and settings
2. Configure your Supabase database
3. Add your actual business data
4. Set up external API integrations
5. Deploy to your production environment

### **Production**
1. Set up monitoring and analytics
2. Configure backup systems
3. Train your team on the features
4. Start gathering user feedback
5. Plan feature enhancements

---

## 📞 **NEED HELP?**

**Quick Solutions:**
- Run `./scripts/setup.sh` for automated setup
- Check `docs/TROUBLESHOOTING_GUIDE.md`
- Review `DEPLOYMENT_GUIDE.md` for production setup

**Support Channels:**
- GitHub Issues for bugs
- Discussions for questions
- Documentation for guides
- Team chat for immediate help

---

**🎊 Welcome to PaveMaster Suite! You're ready to revolutionize your paving operations.**