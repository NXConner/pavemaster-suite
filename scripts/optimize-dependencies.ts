#!/usr/bin/env node
/**
 * Advanced Dependency Optimization Script
 * Analyzes, cleans up, and optimizes dependencies for better performance and security
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  size: number;
  vulnerabilities: number;
  lastUpdated: string;
  isUnused: boolean;
  isDuplicate: boolean;
  alternatives: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
}

interface OptimizationReport {
  totalDependencies: number;
  unusedDependencies: DependencyInfo[];
  duplicateDependencies: DependencyInfo[];
  vulnerableDependencies: DependencyInfo[];
  outdatedDependencies: DependencyInfo[];
  optimizationOpportunities: string[];
  estimatedSavings: {
    size: number;
    vulnerabilities: number;
    dependencies: number;
  };
  recommendations: string[];
}

class DependencyOptimizer {
  private projectPath: string;
  private packageJson: any;
  private lockFile: any;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
  }

  /**
   * Run comprehensive dependency optimization
   */
  async optimize(): Promise<OptimizationReport> {
    console.log('🔧 Starting dependency optimization...\n');

    try {
      await this.loadProjectFiles();
      
      // Analyze dependencies
      const analysis = await this.analyzeDependencies();
      
      // Generate optimization report
      const report = await this.generateOptimizationReport(analysis);
      
      // Apply safe optimizations
      await this.applySafeOptimizations(report);
      
      // Generate final report
      await this.saveReport(report);
      
      return report;
    } catch (error) {
      console.error('❌ Dependency optimization failed:', error);
      throw error;
    }
  }

  /**
   * Load project configuration files
   */
  private async loadProjectFiles(): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    const packageLockPath = path.join(this.projectPath, 'package-lock.json');

    this.packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    try {
      this.lockFile = JSON.parse(await fs.readFile(packageLockPath, 'utf-8'));
    } catch {
      console.warn('⚠️ package-lock.json not found');
    }
  }

  /**
   * Analyze all dependencies
   */
  private async analyzeDependencies(): Promise<DependencyInfo[]> {
    const dependencies = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies
    };

    const analysis: DependencyInfo[] = [];

    for (const [name, version] of Object.entries(dependencies)) {
      try {
        const info = await this.analyzeDependency(name, version as string);
        analysis.push(info);
      } catch (error) {
        console.warn(`⚠️ Could not analyze ${name}:`, error);
      }
    }

    return analysis;
  }

  /**
   * Analyze individual dependency
   */
  private async analyzeDependency(name: string, version: string): Promise<DependencyInfo> {
    const [isUnused, isDuplicate, vulnerabilities, latestVersion, size] = await Promise.all([
      this.checkIfUnused(name),
      this.checkIfDuplicate(name),
      this.checkVulnerabilities(name),
      this.getLatestVersion(name),
      this.getDependencySize(name)
    ]);

    const alternatives = await this.findAlternatives(name);
    const impact = this.calculateImpact(vulnerabilities, isUnused, size);

    return {
      name,
      currentVersion: version,
      latestVersion,
      size,
      vulnerabilities,
      lastUpdated: await this.getLastUpdated(name),
      isUnused,
      isDuplicate,
      alternatives,
      impact
    };
  }

  /**
   * Check if dependency is unused
   */
  private async checkIfUnused(name: string): Promise<boolean> {
    try {
      const srcPath = path.join(this.projectPath, 'src');
      
      // Check for imports
      execSync(`grep -r "from ['\"]${name}['\"]" "${srcPath}" 2>/dev/null`, { stdio: 'pipe' });
      return false;
    } catch {
      try {
        // Check for require statements
        execSync(`grep -r "require(['\"]${name}['\"])" "${srcPath}" 2>/dev/null`, { stdio: 'pipe' });
        return false;
      } catch {
        // Check for any reference
        try {
          execSync(`grep -r "${name}" "${srcPath}" 2>/dev/null`, { stdio: 'pipe' });
          return false;
        } catch {
          return true;
        }
      }
    }
  }

  /**
   * Check if dependency has duplicates
   */
  private async checkIfDuplicate(name: string): Promise<boolean> {
    if (!this.lockFile?.packages) return false;

    const versions = new Set<string>();
    
    Object.keys(this.lockFile.packages).forEach(packagePath => {
      if (packagePath.includes(`node_modules/${name}`) || packagePath === `node_modules/${name}`) {
        const packageInfo = this.lockFile.packages[packagePath];
        if (packageInfo.version) {
          versions.add(packageInfo.version);
        }
      }
    });

    return versions.size > 1;
  }

  /**
   * Check for security vulnerabilities
   */
  private async checkVulnerabilities(name: string): Promise<number> {
    try {
      const auditResult = execSync('npm audit --json 2>/dev/null', { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities && audit.vulnerabilities[name]) {
        const vuln = audit.vulnerabilities[name];
        return vuln.via ? vuln.via.length : 0;
      }
      
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get latest version of dependency
   */
  private async getLatestVersion(name: string): Promise<string> {
    try {
      const result = execSync(`npm view ${name} version 2>/dev/null`, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      return result.trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get dependency size estimate
   */
  private async getDependencySize(name: string): Promise<number> {
    try {
      // Try to get package size from npm
      const result = execSync(`npm view ${name} dist.unpackedSize 2>/dev/null`, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      return parseInt(result.trim()) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get last updated date
   */
  private async getLastUpdated(name: string): Promise<string> {
    try {
      const result = execSync(`npm view ${name} time.modified 2>/dev/null`, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      return result.trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Find alternative packages
   */
  private async findAlternatives(name: string): Promise<string[]> {
    const alternatives: Record<string, string[]> = {
      'lodash': ['ramda', 'radash', 'native-js'],
      'moment': ['date-fns', 'dayjs', 'luxon'],
      'axios': ['fetch', 'ky', 'wretch'],
      'jquery': ['vanilla-js', 'cash-dom'],
      'underscore': ['lodash', 'ramda', 'native-js'],
      'request': ['node-fetch', 'axios', 'got'],
      'bluebird': ['native-promises', 'p-queue'],
      'winston': ['pino', 'console.log', 'bunyan']
    };

    return alternatives[name] || [];
  }

  /**
   * Calculate impact of dependency issues
   */
  private calculateImpact(vulnerabilities: number, isUnused: boolean, size: number): 'low' | 'medium' | 'high' | 'critical' {
    if (vulnerabilities > 0 && isUnused) return 'critical';
    if (vulnerabilities > 0) return 'high';
    if (isUnused && size > 1024 * 1024) return 'high'; // 1MB+
    if (isUnused) return 'medium';
    if (size > 5 * 1024 * 1024) return 'medium'; // 5MB+
    return 'low';
  }

  /**
   * Generate optimization report
   */
  private async generateOptimizationReport(analysis: DependencyInfo[]): Promise<OptimizationReport> {
    const unusedDependencies = analysis.filter(dep => dep.isUnused);
    const duplicateDependencies = analysis.filter(dep => dep.isDuplicate);
    const vulnerableDependencies = analysis.filter(dep => dep.vulnerabilities > 0);
    const outdatedDependencies = analysis.filter(dep => 
      dep.currentVersion !== dep.latestVersion && dep.latestVersion !== 'unknown'
    );

    const estimatedSavings = {
      size: unusedDependencies.reduce((sum, dep) => sum + dep.size, 0),
      vulnerabilities: vulnerableDependencies.reduce((sum, dep) => sum + dep.vulnerabilities, 0),
      dependencies: unusedDependencies.length
    };

    const optimizationOpportunities = this.generateOptimizationOpportunities(analysis);
    const recommendations = this.generateRecommendations(analysis);

    return {
      totalDependencies: analysis.length,
      unusedDependencies,
      duplicateDependencies,
      vulnerableDependencies,
      outdatedDependencies,
      optimizationOpportunities,
      estimatedSavings,
      recommendations
    };
  }

  /**
   * Generate optimization opportunities
   */
  private generateOptimizationOpportunities(analysis: DependencyInfo[]): string[] {
    const opportunities: string[] = [];

    const unused = analysis.filter(dep => dep.isUnused);
    if (unused.length > 0) {
      opportunities.push(`Remove ${unused.length} unused dependencies`);
    }

    const vulnerable = analysis.filter(dep => dep.vulnerabilities > 0);
    if (vulnerable.length > 0) {
      opportunities.push(`Fix ${vulnerable.length} vulnerable dependencies`);
    }

    const large = analysis.filter(dep => dep.size > 1024 * 1024);
    if (large.length > 0) {
      opportunities.push(`Optimize ${large.length} large dependencies (>1MB each)`);
    }

    const duplicates = analysis.filter(dep => dep.isDuplicate);
    if (duplicates.length > 0) {
      opportunities.push(`Resolve ${duplicates.length} duplicate dependencies`);
    }

    return opportunities;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(analysis: DependencyInfo[]): string[] {
    const recommendations: string[] = [];

    // Critical security recommendations
    const criticalVulns = analysis.filter(dep => dep.vulnerabilities > 0 && dep.impact === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push('🚨 URGENT: Update or remove dependencies with critical vulnerabilities');
    }

    // Bundle size recommendations
    const totalSize = analysis.reduce((sum, dep) => sum + dep.size, 0);
    if (totalSize > 50 * 1024 * 1024) { // 50MB
      recommendations.push('📦 Bundle size is large - consider tree shaking and dependency alternatives');
    }

    // Maintenance recommendations
    const outdated = analysis.filter(dep => dep.currentVersion !== dep.latestVersion);
    if (outdated.length > analysis.length * 0.3) {
      recommendations.push('🔄 Many dependencies are outdated - schedule regular updates');
    }

    // Performance recommendations
    recommendations.push('⚡ Use dynamic imports for large, non-critical dependencies');
    recommendations.push('🎯 Consider using lighter alternatives for heavy dependencies');
    recommendations.push('🔍 Regularly audit dependencies with automated tools');

    return recommendations;
  }

  /**
   * Apply safe optimizations automatically
   */
  private async applySafeOptimizations(report: OptimizationReport): Promise<void> {
    console.log('🤖 Applying safe optimizations...\n');

    // Remove unused dependencies (with confirmation)
    const safeToRemove = report.unusedDependencies.filter(dep => 
      dep.impact === 'low' && !this.isEssentialDependency(dep.name)
    );

    if (safeToRemove.length > 0) {
      console.log(`Found ${safeToRemove.length} safe dependencies to remove:`);
      safeToRemove.forEach(dep => console.log(`  - ${dep.name} (${this.formatSize(dep.size)})`));
      
      // In a real implementation, you might want user confirmation here
      // For now, we'll just log what would be removed
      console.log('\n💡 Run "npm uninstall" for the above packages to remove them\n');
    }

    // Update package.json with optimization metadata
    await this.addOptimizationMetadata(report);
  }

  /**
   * Check if dependency is essential and should not be auto-removed
   */
  private isEssentialDependency(name: string): boolean {
    const essential = [
      'react', 'react-dom', 'typescript', 'vite',
      '@types/react', '@types/react-dom', '@vitejs/plugin-react',
      'eslint', 'prettier', 'vitest'
    ];
    
    return essential.some(dep => name.includes(dep));
  }

  /**
   * Add optimization metadata to package.json
   */
  private async addOptimizationMetadata(report: OptimizationReport): Promise<void> {
    const metadata = {
      lastOptimized: new Date().toISOString(),
      optimizationScore: this.calculateOptimizationScore(report),
      recommendations: report.recommendations.slice(0, 3), // Top 3 recommendations
      savings: report.estimatedSavings
    };

    this.packageJson.optimizationMetadata = metadata;

    await fs.writeFile(
      path.join(this.projectPath, 'package.json'),
      JSON.stringify(this.packageJson, null, 2)
    );
  }

  /**
   * Calculate optimization score
   */
  private calculateOptimizationScore(report: OptimizationReport): number {
    let score = 100;

    // Penalize issues
    score -= report.unusedDependencies.length * 5;
    score -= report.vulnerableDependencies.length * 15;
    score -= report.duplicateDependencies.length * 3;
    score -= Math.max(0, report.outdatedDependencies.length - 5) * 2; // Allow some outdated

    return Math.max(0, score);
  }

  /**
   * Save optimization report
   */
  private async saveReport(report: OptimizationReport): Promise<void> {
    const reportContent = this.formatReport(report);
    
    const reportPath = path.join(this.projectPath, 'dependency-optimization-report.md');
    await fs.writeFile(reportPath, reportContent);
    
    console.log(reportContent);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  /**
   * Format optimization report
   */
  private formatReport(report: OptimizationReport): string {
    const formatSize = (bytes: number) => {
      const mb = bytes / (1024 * 1024);
      return mb > 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
    };

    return `# Dependency Optimization Report
Generated: ${new Date().toLocaleString()}

## 📊 Summary

- **Total Dependencies**: ${report.totalDependencies}
- **Optimization Score**: ${this.calculateOptimizationScore(report)}/100
- **Estimated Savings**: ${formatSize(report.estimatedSavings.size)} (${report.estimatedSavings.dependencies} packages)

## 🗑️ Unused Dependencies (${report.unusedDependencies.length})

${report.unusedDependencies.length > 0 ? 
  report.unusedDependencies.map(dep => 
    `- **${dep.name}** (${formatSize(dep.size)}) - Impact: ${dep.impact}`
  ).join('\n') : 
  'No unused dependencies found ✅'
}

## 🔒 Vulnerable Dependencies (${report.vulnerableDependencies.length})

${report.vulnerableDependencies.length > 0 ? 
  report.vulnerableDependencies.map(dep => 
    `- **${dep.name}**: ${dep.vulnerabilities} vulnerabilities - Impact: ${dep.impact}`
  ).join('\n') : 
  'No vulnerable dependencies found ✅'
}

## 🔄 Duplicate Dependencies (${report.duplicateDependencies.length})

${report.duplicateDependencies.length > 0 ? 
  report.duplicateDependencies.map(dep => 
    `- **${dep.name}** - Multiple versions detected`
  ).join('\n') : 
  'No duplicate dependencies found ✅'
}

## 📅 Outdated Dependencies (${report.outdatedDependencies.length})

${report.outdatedDependencies.length > 0 ? 
  report.outdatedDependencies.slice(0, 10).map(dep => 
    `- **${dep.name}**: ${dep.currentVersion} → ${dep.latestVersion}`
  ).join('\n') + (report.outdatedDependencies.length > 10 ? '\n... and more' : '') : 
  'All dependencies are up to date ✅'
}

## 🎯 Optimization Opportunities

${report.optimizationOpportunities.map(opp => `- ${opp}`).join('\n')}

## 💡 Recommendations

${report.recommendations.map(rec => rec).join('\n')}

## 🛠️ Action Items

### Immediate (High Priority)
1. Remove unused dependencies to reduce bundle size
2. Update vulnerable dependencies for security
3. Resolve duplicate dependencies for consistency

### Short-term (Medium Priority)
1. Update outdated dependencies (test thoroughly)
2. Consider lighter alternatives for heavy packages
3. Implement automated dependency monitoring

### Long-term (Ongoing)
1. Regular dependency audits (monthly)
2. Bundle size monitoring in CI/CD
3. Automated security scanning

---
*Report generated by PaveMaster Dependency Optimizer*
`;
  }

  /**
   * Format file size
   */
  private formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    const kb = bytes / 1024;
    
    if (mb > 1) return `${mb.toFixed(2)} MB`;
    if (kb > 1) return `${kb.toFixed(2)} KB`;
    return `${bytes} bytes`;
  }
}

// CLI execution
if (require.main === module) {
  const optimizer = new DependencyOptimizer();
  
  optimizer.optimize()
    .then((report) => {
      const score = optimizer['calculateOptimizationScore'](report);
      console.log(`\n🎯 Optimization Score: ${score}/100`);
      
      if (score < 60) {
        console.log('❌ Dependencies need significant optimization');
        process.exit(1);
      } else if (score < 80) {
        console.log('⚠️ Dependencies have room for improvement');
      } else {
        console.log('✅ Dependencies are well optimized');
      }
    })
    .catch((error) => {
      console.error('Dependency optimization failed:', error);
      process.exit(1);
    });
}

export { DependencyOptimizer, type OptimizationReport };