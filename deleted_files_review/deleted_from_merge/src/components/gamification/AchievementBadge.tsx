/**
 * Achievement Badge Component
 * Interactive badges with rarity effects, animations, and detailed tooltips
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Achievement, AchievementRarity, AchievementProgress } from '@/types/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  progress?: AchievementProgress;
  isUnlocked?: boolean;
  isNew?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showProgress?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
  glowEffect?: boolean;
  onClick?: () => void;
  className?: string;
}

const rarityConfig = {
  [AchievementRarity.COMMON]: {
    borderColor: 'border-gray-400',
    bgGradient: 'from-gray-100 to-gray-200',
    glowColor: 'shadow-gray-400/50',
    sparkleColor: '#9CA3AF',
    animation: 'pulse'
  },
  [AchievementRarity.UNCOMMON]: {
    borderColor: 'border-green-400',
    bgGradient: 'from-green-100 to-green-200',
    glowColor: 'shadow-green-400/50',
    sparkleColor: '#10B981',
    animation: 'bounce'
  },
  [AchievementRarity.RARE]: {
    borderColor: 'border-blue-400',
    bgGradient: 'from-blue-100 to-blue-200',
    glowColor: 'shadow-blue-400/50',
    sparkleColor: '#3B82F6',
    animation: 'pulse'
  },
  [AchievementRarity.EPIC]: {
    borderColor: 'border-purple-400',
    bgGradient: 'from-purple-100 to-purple-200',
    glowColor: 'shadow-purple-400/50',
    sparkleColor: '#8B5CF6',
    animation: 'bounce'
  },
  [AchievementRarity.LEGENDARY]: {
    borderColor: 'border-yellow-400',
    bgGradient: 'from-yellow-100 via-yellow-200 to-orange-200',
    glowColor: 'shadow-yellow-400/70',
    sparkleColor: '#F59E0B',
    animation: 'pulse'
  }
};

const sizeConfig = {
  sm: {
    container: 'w-12 h-12',
    icon: 'text-lg',
    badge: 'text-xs px-1',
    tooltip: 'text-xs'
  },
  md: {
    container: 'w-16 h-16',
    icon: 'text-xl',
    badge: 'text-xs px-2',
    tooltip: 'text-sm'
  },
  lg: {
    container: 'w-20 h-20',
    icon: 'text-2xl',
    badge: 'text-sm px-2',
    tooltip: 'text-base'
  },
  xl: {
    container: 'w-24 h-24',
    icon: 'text-3xl',
    badge: 'text-sm px-3',
    tooltip: 'text-lg'
  }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  progress,
  isUnlocked = false,
  isNew = false,
  size = 'md',
  showProgress = true,
  showTooltip = true,
  animated = true,
  glowEffect = true,
  onClick,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [celebrationPlaying, setCelebrationPlaying] = useState(false);

  const rarity = rarityConfig[achievement.rarity];
  const sizeStyle = sizeConfig[size];

  useEffect(() => {
    if (isNew && isUnlocked) {
      setCelebrationPlaying(true);
      setShowSparkles(true);
      const timer = setTimeout(() => {
        setCelebrationPlaying(false);
        setShowSparkles(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew, isUnlocked]);

  const badgeVariants = {
    initial: { scale: 0, opacity: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.6
      }
    },
    hover: { 
      scale: 1.1, 
      y: -5,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 },
    celebration: {
      scale: [1, 1.2, 1],
      rotate: [0, 360, 0],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        times: [0, 0.5, 1]
      }
    }
  };

  const sparkleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      x: [0, Math.cos(i * Math.PI / 4) * 30],
      y: [0, Math.sin(i * Math.PI / 4) * 30],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: i * 0.1
      }
    })
  };

  const progressPercentage = progress ? progress.percentage : (isUnlocked ? 100 : 0);

  const BadgeContent = () => (
    <motion.div
      variants={badgeVariants}
      initial={animated ? 'initial' : false}
      animate={celebrationPlaying ? 'celebration' : 'animate'}
      whileHover={animated ? 'hover' : undefined}
      whileTap={animated ? 'tap' : undefined}
      className={cn(
        'relative flex items-center justify-center rounded-full border-2 cursor-pointer transition-all duration-300',
        sizeStyle.container,
        rarity.borderColor,
        `bg-gradient-to-br ${rarity.bgGradient}`,
        {
          [`shadow-lg ${rarity.glowColor}`]: glowEffect && (isUnlocked || isHovered),
          'grayscale opacity-60': !isUnlocked,
          'animate-pulse': !isUnlocked && animated,
          [`animate-${rarity.animation}`]: isUnlocked && animated
        },
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Achievement Icon */}
      <div className={cn('relative z-10', sizeStyle.icon)}>
        {achievement.icon}
      </div>

      {/* Rarity Ring Effect */}
      {isUnlocked && glowEffect && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full border-2',
            rarity.borderColor
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* New Badge Indicator */}
      {isNew && isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 z-20"
        >
          <Badge className={cn('bg-red-500 text-white', sizeStyle.badge)}>
            NEW!
          </Badge>
        </motion.div>
      )}

      {/* Sparkle Effects */}
      <AnimatePresence>
        {showSparkles && (
          <div className="absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                exit="initial"
                className="absolute w-2 h-2 rounded-full left-1/2 top-1/2"
                style={{ backgroundColor: rarity.sparkleColor }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Progress Ring */}
      {showProgress && !isUnlocked && progress && (
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-300"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={achievement.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 45 * (1 - progressPercentage / 100)
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
      )}
    </motion.div>
  );

  if (!showTooltip) {
    return <BadgeContent />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <BadgeContent />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className={cn('max-w-xs', sizeStyle.tooltip)}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg">{achievement.title}</h4>
                  <Badge 
                    className={cn(
                      'text-xs capitalize',
                      rarity.borderColor.replace('border-', 'bg-').replace('-400', '-100'),
                      rarity.borderColor.replace('border-', 'text-').replace('-400', '-800')
                    )}
                  >
                    {achievement.rarity}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>

                {/* Points */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Points:</span>
                  <span className="text-sm font-bold text-yellow-600">
                    {achievement.points}
                  </span>
                </div>

                {/* Progress */}
                {showProgress && progress && !isUnlocked && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress:</span>
                      <span className="text-sm">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress.currentValue} / {progress.targetValue}
                    </p>
                  </div>
                )}

                {/* Unlocked Status */}
                {isUnlocked && (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <span className="text-lg">✓</span>
                    <span className="text-sm font-medium">Unlocked!</span>
                  </div>
                )}

                {/* Category */}
                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground capitalize">
                    {achievement.category.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;