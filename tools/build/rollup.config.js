import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import { dts } from 'rollup-plugin-dts';
import pkg from '../../package.json' assert { type: 'json' };

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig([
  // Main build configuration
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      // Handle peer dependencies
      peerDepsExternal(),
      
      // Resolve node modules
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      
      // Handle CommonJS modules
      commonjs(),
      
      // Handle JSON imports
      json(),
      
      // TypeScript compilation
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        exclude: ['**/*.test.*', '**/*.spec.*', '**/tests/**']
      }),
      
      // Minify in production
      isProduction && terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: {
          keep_fnames: true
        }
      })
    ].filter(Boolean),
    
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.dependencies || {}).filter(dep => 
        dep.startsWith('@isac-os/')
      )
    ],
    
    // Suppress warnings
    onwarn: (warning, warn) => {
      // Suppress 'this' has been rewritten to 'undefined' warnings
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      // Suppress circular dependency warnings for known safe cases
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        if (warning.message.includes('node_modules')) return;
      }
      warn(warning);
    }
  },
  
  // Type definitions build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.types,
      format: 'esm'
    },
    plugins: [
      dts({
        compilerOptions: {
          preserveSymlinks: false
        }
      })
    ],
    external: [
      /\.css$/,
      'react',
      'react-dom',
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.dependencies || {}).filter(dep => 
        dep.startsWith('@isac-os/')
      )
    ]
  }
]);