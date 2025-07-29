import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RotateCw, Spinner } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'fade';
  color?: 'primary' | 'secondary' | 'accent' | 'neutral';
  text?: string;
  className?: string;
  fullscreen?: boolean;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  color = 'primary',
  text,
  className,
  fullscreen = false,
  overlay = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    accent: 'text-purple-600 dark:text-purple-400',
    neutral: 'text-current',
  };

  const SpinnerIcon = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full',
                  size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
                  colorClasses[color],
                  'animate-pulse'
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div
            className={cn(
              'rounded-full animate-pulse',
              sizeClasses[size],
              colorClasses[color],
              'bg-current opacity-75'
            )}
          />
        );
      
      case 'bounce':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-current animate-bounce',
                  size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
                  colorClasses[color]
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );
      
      case 'fade':
        return (
          <div className="relative">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className={cn(
                  'absolute rounded-full bg-current',
                  size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
                  colorClasses[color]
                )}
                style={{
                  transform: `rotate(${i * 45}deg) translate(${size === 'sm' ? '8px' : size === 'md' ? '12px' : size === 'lg' ? '16px' : '20px'})`,
                  animationDelay: `${i * 0.1}s`,
                  animation: 'fade 1.2s infinite ease-in-out',
                }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <Loader2
            className={cn(
              sizeClasses[size],
              colorClasses[color],
              'animate-spin'
            )}
          />
        );
    }
  };

  const content = (
    <div className={cn(
      'flex items-center justify-center',
      fullscreen && 'min-h-screen',
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        <SpinnerIcon />
        {text && (
          <p className={cn(
            'text-sm font-medium',
            colorClasses[color]
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;