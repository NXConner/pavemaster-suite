#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('⚡ Starting performance monitoring...');

/**
 * Monitor build performance and generate performance report
 */
async function monitorPerformance() {
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  console.log('📈 Analyzing performance metrics...');

  const metrics = {
    timestamp: new Date().toISOString(),
    buildSize: calculateBuildSize(distPath),
    assetOptimization: analyzeAssetOptimization(distPath),
    compressionEfficiency: analyzeCompression(distPath),
    loadingPerformance: estimateLoadingPerformance(distPath),
    recommendations: []
  };

  // Generate performance report
  generatePerformanceReport(metrics);
  
  // Provide performance recommendations
  providePerformanceRecommendations(metrics);
  
  console.log('\n✅ Performance monitoring complete!');
}

function calculateBuildSize(distPath) {
  const files = getAllFiles(distPath);
  let totalSize = 0;
  const fileTypes = {};

  files.forEach(file => {
    const stats = fs.statSync(file);
    const ext = path.extname(file);
    
    totalSize += stats.size;
    
    if (!fileTypes[ext]) {
      fileTypes[ext] = { count: 0, size: 0 };
    }
    fileTypes[ext].count++;
    fileTypes[ext].size += stats.size;
  });

  console.log('\n📊 Build Size Analysis:');
  console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Total files: ${files.length}`);

  // Show breakdown by file type
  Object.entries(fileTypes)
    .sort(([,a], [,b]) => b.size - a.size)
    .forEach(([ext, data]) => {
      const sizeMB = (data.size / 1024 / 1024).toFixed(2);
      console.log(`   ${ext || 'no extension'}: ${data.count} files, ${sizeMB} MB`);
    });

  return {
    totalSize,
    totalFiles: files.length,
    fileTypes
  };
}

function analyzeAssetOptimization(distPath) {
  const files = getAllFiles(distPath);
  const assets = {
    images: files.filter(f => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f)),
    fonts: files.filter(f => /\.(woff|woff2|ttf|otf|eot)$/i.test(f)),
    videos: files.filter(f => /\.(mp4|webm|ogg)$/i.test(f))
  };

  console.log('\n🖼️ Asset Optimization:');
  
  Object.entries(assets).forEach(([type, fileList]) => {
    if (fileList.length > 0) {
      const totalSize = fileList.reduce((sum, file) => {
        return sum + fs.statSync(file).size;
      }, 0);
      console.log(`   ${type}: ${fileList.length} files, ${(totalSize / 1024).toFixed(2)} KB`);
    }
  });

  return assets;
}

function analyzeCompression(distPath) {
  const files = getAllFiles(distPath);
  const compressionAnalysis = {
    brotli: { count: 0, originalSize: 0, compressedSize: 0 },
    gzip: { count: 0, originalSize: 0, compressedSize: 0 },
    uncompressed: { count: 0, size: 0 }
  };

  files.forEach(file => {
    const stats = fs.statSync(file);
    const basename = path.basename(file);
    
    if (basename.endsWith('.br')) {
      compressionAnalysis.brotli.count++;
      compressionAnalysis.brotli.compressedSize += stats.size;
      
      // Try to find original file
      const originalFile = file.replace(/\.br$/, '');
      if (fs.existsSync(originalFile)) {
        compressionAnalysis.brotli.originalSize += fs.statSync(originalFile).size;
      }
    } else if (basename.endsWith('.gz')) {
      compressionAnalysis.gzip.count++;
      compressionAnalysis.gzip.compressedSize += stats.size;
      
      // Try to find original file
      const originalFile = file.replace(/\.gz$/, '');
      if (fs.existsSync(originalFile)) {
        compressionAnalysis.gzip.originalSize += fs.statSync(originalFile).size;
      }
    } else if (!/\.(br|gz)$/.test(basename)) {
      compressionAnalysis.uncompressed.count++;
      compressionAnalysis.uncompressed.size += stats.size;
    }
  });

  console.log('\n🗜️ Compression Analysis:');
  
  if (compressionAnalysis.brotli.count > 0) {
    const ratio = ((1 - compressionAnalysis.brotli.compressedSize / compressionAnalysis.brotli.originalSize) * 100).toFixed(1);
    console.log(`   Brotli: ${compressionAnalysis.brotli.count} files, ${ratio}% compression ratio`);
  }
  
  if (compressionAnalysis.gzip.count > 0) {
    const ratio = ((1 - compressionAnalysis.gzip.compressedSize / compressionAnalysis.gzip.originalSize) * 100).toFixed(1);
    console.log(`   Gzip: ${compressionAnalysis.gzip.count} files, ${ratio}% compression ratio`);
  }
  
  if (compressionAnalysis.uncompressed.count > 0) {
    console.log(`   Uncompressed: ${compressionAnalysis.uncompressed.count} files, ${(compressionAnalysis.uncompressed.size / 1024).toFixed(2)} KB`);
  }

  return compressionAnalysis;
}

function estimateLoadingPerformance(distPath) {
  const files = getAllFiles(distPath);
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.endsWith('.gz') && !f.endsWith('.br'));
  const cssFiles = files.filter(f => f.endsWith('.css') && !f.endsWith('.gz') && !f.endsWith('.br'));
  
  // Estimate loading times for different connection speeds
  const connectionSpeeds = {
    'Fast 3G': 1.6 * 1024 * 1024 / 8, // 1.6 Mbps in bytes per second
    '4G': 4 * 1024 * 1024 / 8, // 4 Mbps
    'Broadband': 10 * 1024 * 1024 / 8 // 10 Mbps
  };

  const totalJSSize = jsFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  const totalCSSSize = cssFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  const totalCriticalSize = totalJSSize + totalCSSSize;

  console.log('\n⏱️ Estimated Loading Performance:');
  
  Object.entries(connectionSpeeds).forEach(([speedName, bytesPerSecond]) => {
    const loadTime = (totalCriticalSize / bytesPerSecond).toFixed(1);
    console.log(`   ${speedName}: ~${loadTime}s`);
  });

  return {
    totalJSSize,
    totalCSSSize,
    totalCriticalSize,
    estimatedLoadTimes: Object.fromEntries(
      Object.entries(connectionSpeeds).map(([name, speed]) => [
        name,
        totalCriticalSize / speed
      ])
    )
  };
}

function providePerformanceRecommendations(metrics) {
  console.log('\n💡 Performance Recommendations:');
  
  const recommendations = [];
  
  // Check bundle size
  if (metrics.buildSize.totalSize > 5 * 1024 * 1024) { // > 5MB
    recommendations.push('📦 Consider implementing code splitting to reduce initial bundle size');
  }
  
  // Check loading times
  const slowestLoadTime = Math.max(...Object.values(metrics.loadingPerformance.estimatedLoadTimes));
  if (slowestLoadTime > 3) { // > 3 seconds
    recommendations.push('⚡ Optimize assets and implement lazy loading for faster initial page load');
  }
  
  // Check compression
  if (metrics.compressionEfficiency.uncompressed.size > 100 * 1024) { // > 100KB uncompressed
    recommendations.push('🗜️ Enable compression for all static assets');
  }
  
  // Check asset optimization
  const imageCount = metrics.assetOptimization.images?.length || 0;
  if (imageCount > 10) {
    recommendations.push('🖼️ Consider implementing image optimization and lazy loading');
  }
  
  if (recommendations.length === 0) {
    console.log('✨ Performance looks good! No critical optimizations needed.');
  } else {
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  metrics.recommendations = recommendations;
}

function generatePerformanceReport(metrics) {
  const reportPath = path.join(process.cwd(), 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
  console.log(`📋 Performance report saved to: ${reportPath}`);
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

// Run the performance monitoring
monitorPerformance().catch(error => {
  console.error('❌ Performance monitoring failed:', error);
  process.exit(1);
});