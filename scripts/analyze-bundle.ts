#!/usr/bin/env node
/**
 * Bundle Analysis and Optimization Script
 * Analyzes bundle composition, identifies optimization opportunities, and provides actionable recommendations
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

interface PackageInfo {
  name: string;
  version: string;
  size: number;
  gzippedSize: number;
  dependencies: string[];
  isDevDependency: boolean;
  lastUpdated: string;
  vulnerabilities: number;
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunkCount: number;
  largestChunks: Array<{ name: string; size: number; percentage: number }>;
  duplicateDependencies: string[];
  unusedDependencies: string[];
  optimizationOpportunities: string[];
  securityIssues: string[];
  recommendations: string[];
}

class BundleAnalyzer {
  private projectPath: string;
  private packageJson: any;
  private lockFile: any;
  private distPath: string;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
    this.distPath = path.join(projectPath, 'dist');
  }

  /**
   * Run comprehensive bundle analysis
   */
  async analyze(): Promise<BundleAnalysis> {
    console.log('🔍 Starting bundle analysis...\n');

    try {
      // Load project files
      await this.loadProjectFiles();

      // Analyze bundle composition
      const bundleStats = await this.analyzeBundleStats();
      
      // Analyze dependencies
      const depAnalysis = await this.analyzeDependencies();
      
      // Check for security vulnerabilities
      const securityAnalysis = await this.analyzeSecurityIssues();
      
      // Generate optimization recommendations
      const recommendations = this.generateRecommendations(bundleStats, depAnalysis);

      const analysis: BundleAnalysis = {
        ...bundleStats,
        ...depAnalysis,
        securityIssues: securityAnalysis,
        recommendations
      };

      await this.generateReport(analysis);
      
      return analysis;
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
      throw error;
    }
  }

  /**
   * Load project configuration files
   */
  private async loadProjectFiles(): Promise<void> {
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const packageLockPath = path.join(this.projectPath, 'package-lock.json');

      this.packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      try {
        this.lockFile = JSON.parse(await fs.readFile(packageLockPath, 'utf-8'));
      } catch {
        console.warn('⚠️ package-lock.json not found, some analysis features will be limited');
      }
    } catch (error) {
      throw new Error(`Failed to load project files: ${error}`);
    }
  }

  /**
   * Analyze bundle statistics from dist folder
   */
  private async analyzeBundleStats(): Promise<Partial<BundleAnalysis>> {
    try {
      const stats = await this.getDistStats();
      
      return {
        totalSize: stats.totalSize,
        gzippedSize: stats.gzippedSize,
        chunkCount: stats.chunkCount,
        largestChunks: stats.largestChunks,
        optimizationOpportunities: this.identifyBundleOptimizations(stats)
      };
    } catch (error) {
      console.warn('⚠️ Could not analyze bundle stats, run npm run build first');
      return {
        totalSize: 0,
        gzippedSize: 0,
        chunkCount: 0,
        largestChunks: [],
        optimizationOpportunities: []
      };
    }
  }

  /**
   * Get statistics from dist folder
   */
  private async getDistStats(): Promise<any> {
    const distExists = await fs.access(this.distPath).then(() => true).catch(() => false);
    
    if (!distExists) {
      throw new Error('Dist folder not found');
    }

    const files = await this.getAllFiles(this.distPath);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));
    
    let totalSize = 0;
    const chunks: Array<{ name: string; size: number }> = [];

    for (const file of [...jsFiles, ...cssFiles]) {
      const stats = await fs.stat(file);
      const fileName = path.basename(file);
      const size = stats.size;
      
      totalSize += size;
      chunks.push({ name: fileName, size });
    }

    // Sort chunks by size
    chunks.sort((a, b) => b.size - a.size);

    const largestChunks = chunks.slice(0, 10).map(chunk => ({
      ...chunk,
      percentage: (chunk.size / totalSize) * 100
    }));

    // Estimate gzipped size (roughly 30% of original)
    const gzippedSize = Math.round(totalSize * 0.3);

    return {
      totalSize,
      gzippedSize,
      chunkCount: chunks.length,
      largestChunks,
      chunks
    };
  }

  /**
   * Recursively get all files in directory
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Analyze dependencies for duplicates and unused packages
   */
  private async analyzeDependencies(): Promise<Partial<BundleAnalysis>> {
    const dependencies = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies
    };

    const duplicates = await this.findDuplicateDependencies();
    const unused = await this.findUnusedDependencies();

    return {
      duplicateDependencies: duplicates,
      unusedDependencies: unused
    };
  }

  /**
   * Find duplicate dependencies
   */
  private async findDuplicateDependencies(): Promise<string[]> {
    const duplicates: string[] = [];
    
    if (!this.lockFile?.packages) {
      return duplicates;
    }

    const packageVersions = new Map<string, Set<string>>();
    
    Object.keys(this.lockFile.packages).forEach(packagePath => {
      if (packagePath.startsWith('node_modules/')) {
        const packageName = packagePath.replace('node_modules/', '').split('/')[0];
        const packageInfo = this.lockFile.packages[packagePath];
        
        if (packageInfo.version) {
          if (!packageVersions.has(packageName)) {
            packageVersions.set(packageName, new Set());
          }
          packageVersions.get(packageName)!.add(packageInfo.version);
        }
      }
    });

    packageVersions.forEach((versions, packageName) => {
      if (versions.size > 1) {
        duplicates.push(`${packageName} (${Array.from(versions).join(', ')})`);
      }
    });

    return duplicates;
  }

  /**
   * Find potentially unused dependencies
   */
  private async findUnusedDependencies(): Promise<string[]> {
    const unused: string[] = [];
    const dependencies = Object.keys(this.packageJson.dependencies || {});
    
    try {
      // Use a simple grep-based approach to check if dependencies are imported
      const srcPath = path.join(this.projectPath, 'src');
      
      for (const dep of dependencies) {
        try {
          // Check if dependency is imported in source files
          execSync(`grep -r "from '${dep}'" "${srcPath}" || grep -r "import.*${dep}" "${srcPath}"`, 
            { stdio: 'pipe' });
        } catch {
          // If grep finds nothing, dependency might be unused
          // Additional checks for common patterns
          try {
            execSync(`grep -r "${dep}" "${srcPath}"`, { stdio: 'pipe' });
          } catch {
            unused.push(dep);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not analyze unused dependencies');
    }

    return unused;
  }

  /**
   * Analyze security vulnerabilities
   */
  private async analyzeSecurityIssues(): Promise<string[]> {
    const issues: string[] = [];
    
    try {
      const auditResult = execSync('npm audit --json', { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities) {
        Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]: [string, any]) => {
          if (vuln.severity === 'high' || vuln.severity === 'critical') {
            issues.push(`${pkg}: ${vuln.severity} - ${vuln.title}`);
          }
        });
      }
    } catch (error) {
      console.warn('⚠️ Could not run security audit');
    }

    return issues;
  }

  /**
   * Identify bundle optimization opportunities
   */
  private identifyBundleOptimizations(stats: any): string[] {
    const opportunities: string[] = [];
    
    // Check for large chunks
    const largeChunks = stats.largestChunks?.filter((chunk: any) => chunk.size > 400 * 1024) || [];
    if (largeChunks.length > 0) {
      opportunities.push(`${largeChunks.length} chunks exceed 400KB - consider code splitting`);
    }

    // Check total bundle size
    if (stats.totalSize > 2 * 1024 * 1024) { // 2MB
      opportunities.push('Total bundle size exceeds 2MB - implement aggressive optimization');
    }

    // Check chunk count
    if (stats.chunkCount > 20) {
      opportunities.push('High number of chunks - consider chunk merging for better HTTP/2 performance');
    }

    return opportunities;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(bundleStats: any, depAnalysis: any): string[] {
    const recommendations: string[] = [];

    // Bundle size recommendations
    if (bundleStats.totalSize > 1.5 * 1024 * 1024) {
      recommendations.push('🎯 Implement tree shaking to remove unused code');
      recommendations.push('🎯 Use dynamic imports for route-based code splitting');
      recommendations.push('🎯 Optimize images and convert to WebP/AVIF format');
    }

    // Dependency recommendations
    if (depAnalysis.unusedDependencies?.length > 0) {
      recommendations.push(`🧹 Remove ${depAnalysis.unusedDependencies.length} unused dependencies`);
    }

    if (depAnalysis.duplicateDependencies?.length > 0) {
      recommendations.push(`🔧 Resolve ${depAnalysis.duplicateDependencies.length} duplicate dependencies`);
    }

    // Performance recommendations
    recommendations.push('⚡ Implement Vite bundle analysis plugin for ongoing monitoring');
    recommendations.push('⚡ Add compression middleware (gzip/brotli) to your server');
    recommendations.push('⚡ Use a CDN for static asset delivery');
    
    // Code splitting recommendations
    recommendations.push('📦 Split vendor libraries into separate chunks');
    recommendations.push('📦 Implement lazy loading for non-critical components');
    recommendations.push('📦 Use React.lazy() for route components');

    // Security recommendations
    recommendations.push('🔒 Regularly update dependencies to patch vulnerabilities');
    recommendations.push('🔒 Implement Subresource Integrity (SRI) for external resources');

    return recommendations;
  }

  /**
   * Generate comprehensive analysis report
   */
  private async generateReport(analysis: BundleAnalysis): Promise<void> {
    const report = this.formatReport(analysis);
    
    // Write to file
    const reportPath = path.join(this.projectPath, 'bundle-analysis-report.md');
    await fs.writeFile(reportPath, report);
    
    // Print to console
    console.log(report);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  /**
   * Format analysis results into readable report
   */
  private formatReport(analysis: BundleAnalysis): string {
    const formatSize = (bytes: number) => {
      const kb = bytes / 1024;
      const mb = kb / 1024;
      return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
    };

    return `# Bundle Analysis Report
Generated: ${new Date().toLocaleString()}

## 📊 Bundle Statistics

- **Total Size**: ${formatSize(analysis.totalSize)}
- **Gzipped Size**: ${formatSize(analysis.gzippedSize)}
- **Chunk Count**: ${analysis.chunkCount}

## 🏆 Largest Chunks

${analysis.largestChunks?.map(chunk => 
  `- **${chunk.name}**: ${formatSize(chunk.size)} (${chunk.percentage.toFixed(1)}%)`
).join('\n') || 'No chunk data available'}

## 🔍 Dependency Analysis

### Duplicate Dependencies
${analysis.duplicateDependencies?.length ? 
  analysis.duplicateDependencies.map(dep => `- ${dep}`).join('\n') : 
  'No duplicate dependencies found ✅'}

### Potentially Unused Dependencies
${analysis.unusedDependencies?.length ? 
  analysis.unusedDependencies.map(dep => `- ${dep}`).join('\n') : 
  'No unused dependencies detected ✅'}

## 🚨 Security Issues

${analysis.securityIssues?.length ? 
  analysis.securityIssues.map(issue => `- ⚠️ ${issue}`).join('\n') : 
  'No high/critical security vulnerabilities found ✅'}

## 🎯 Optimization Opportunities

${analysis.optimizationOpportunities?.length ? 
  analysis.optimizationOpportunities.map(opp => `- ${opp}`).join('\n') : 
  'Bundle is well optimized ✅'}

## 💡 Recommendations

${analysis.recommendations.map(rec => `${rec}`).join('\n')}

## 🛠️ Next Steps

1. **Immediate Actions** (High Impact):
   - Fix security vulnerabilities
   - Remove unused dependencies
   - Implement code splitting for large chunks

2. **Performance Optimization** (Medium Impact):
   - Set up bundle size monitoring
   - Implement compression
   - Optimize asset loading

3. **Long-term Improvements** (Ongoing):
   - Regular dependency audits
   - Performance budget enforcement
   - Automated optimization in CI/CD

---
*Report generated by PaveMaster Bundle Analyzer*
`;
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  
  analyzer.analyze()
    .then((analysis) => {
      const score = calculateOptimizationScore(analysis);
      console.log(`\n🎯 Optimization Score: ${score}/100`);
      
      if (score < 70) {
        console.log('❌ Bundle needs significant optimization');
        process.exit(1);
      } else if (score < 85) {
        console.log('⚠️ Bundle has room for improvement');
      } else {
        console.log('✅ Bundle is well optimized');
      }
    })
    .catch((error) => {
      console.error('Bundle analysis failed:', error);
      process.exit(1);
    });
}

/**
 * Calculate optimization score based on analysis results
 */
function calculateOptimizationScore(analysis: BundleAnalysis): number {
  let score = 100;

  // Penalize large bundle size
  if (analysis.totalSize > 2 * 1024 * 1024) score -= 20; // 2MB+
  else if (analysis.totalSize > 1.5 * 1024 * 1024) score -= 10; // 1.5MB+

  // Penalize large chunks
  const largeChunks = analysis.largestChunks?.filter(chunk => chunk.size > 400 * 1024) || [];
  score -= largeChunks.length * 5;

  // Penalize unused dependencies
  score -= (analysis.unusedDependencies?.length || 0) * 3;

  // Penalize duplicate dependencies
  score -= (analysis.duplicateDependencies?.length || 0) * 2;

  // Penalize security issues
  score -= (analysis.securityIssues?.length || 0) * 10;

  return Math.max(0, score);
}

export { BundleAnalyzer, type BundleAnalysis };