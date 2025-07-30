#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Starting build optimization...');

/**
 * Analyze bundle sizes and provide optimization recommendations
 */
async function optimizeBuild() {
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  console.log('📊 Analyzing bundle sizes...');

  // Get all files in the dist directory
  const files = getAllFiles(distPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  // Analyze JavaScript bundles
  console.log('\n📦 JavaScript Bundles:');
  const jsBundles = analyzeFiles(jsFiles, distPath);
  
  // Analyze CSS bundles
  console.log('\n🎨 CSS Bundles:');
  const cssBundles = analyzeFiles(cssFiles, distPath);
  
  // Provide optimization recommendations
  console.log('\n💡 Optimization Recommendations:');
  provideRecommendations(jsBundles, cssBundles);
  
  // Generate bundle analysis report
  generateReport(jsBundles, cssBundles);
  
  console.log('\n✅ Build optimization analysis complete!');
}

function getAllFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  
  for (const file of fileList) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, files);
    } else {
      files.push(filePath);
    }
  }
  
  return files;
}

function analyzeFiles(files, distPath) {
  const bundles = [];
  
  for (const file of files) {
    const stats = fs.statSync(file);
    const relativePath = path.relative(distPath, file);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    bundles.push({
      path: relativePath,
      size: stats.size,
      sizeKB: parseFloat(sizeKB),
      sizeMB: parseFloat(sizeMB)
    });
    
    let sizeDisplay = `${sizeKB} KB`;
    if (stats.size > 1024 * 1024) {
      sizeDisplay = `${sizeMB} MB`;
    }
    
    // Color code by size
    let indicator = '🟢';
    if (stats.size > 500 * 1024) indicator = '🟡'; // > 500KB
    if (stats.size > 1024 * 1024) indicator = '🔶'; // > 1MB
    if (stats.size > 2 * 1024 * 1024) indicator = '🔴'; // > 2MB
    
    console.log(`  ${indicator} ${relativePath}: ${sizeDisplay}`);
  }
  
  return bundles.sort((a, b) => b.size - a.size);
}

function provideRecommendations(jsBundles, cssBundles) {
  const recommendations = [];
  
  // Check for large JavaScript bundles
  const largeJSBundles = jsBundles.filter(bundle => bundle.sizeMB > 1);
  if (largeJSBundles.length > 0) {
    recommendations.push('📦 Consider code splitting for large JavaScript bundles');
    largeJSBundles.forEach(bundle => {
      console.log(`   - ${bundle.path} (${bundle.sizeMB} MB)`);
    });
  }
  
  // Check for large CSS bundles
  const largeCSSBundles = cssBundles.filter(bundle => bundle.sizeKB > 200);
  if (largeCSSBundles.length > 0) {
    recommendations.push('🎨 Consider CSS optimization for large stylesheets');
    largeCSSBundles.forEach(bundle => {
      console.log(`   - ${bundle.path} (${bundle.sizeKB} KB)`);
    });
  }
  
  // Check total bundle size
  const totalJSSize = jsBundles.reduce((total, bundle) => total + bundle.size, 0);
  const totalCSSSize = cssBundles.reduce((total, bundle) => total + bundle.size, 0);
  const totalSizeMB = ((totalJSSize + totalCSSSize) / 1024 / 1024).toFixed(2);
  
  console.log(`📏 Total bundle size: ${totalSizeMB} MB`);
  
  if (totalSizeMB > 5) {
    recommendations.push('⚡ Consider implementing lazy loading for non-critical components');
  }
  
  if (recommendations.length === 0) {
    console.log('✨ Bundle sizes look good! No immediate optimizations needed.');
  }
}

function generateReport(jsBundles, cssBundles) {
  const report = {
    timestamp: new Date().toISOString(),
    javascript: {
      bundles: jsBundles,
      totalSize: jsBundles.reduce((total, bundle) => total + bundle.size, 0)
    },
    css: {
      bundles: cssBundles,
      totalSize: cssBundles.reduce((total, bundle) => total + bundle.size, 0)
    }
  };
  
  const reportPath = path.join(process.cwd(), 'bundle-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📋 Bundle analysis report saved to: ${reportPath}`);
}

// Run the optimization
optimizeBuild().catch(error => {
  console.error('❌ Build optimization failed:', error);
  process.exit(1);
});