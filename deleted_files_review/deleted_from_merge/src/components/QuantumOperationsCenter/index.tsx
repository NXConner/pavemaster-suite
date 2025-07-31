/**
 * Quantum Operations Center - Performance Optimized Entry Point
 * Implements code splitting and lazy loading for better performance
 */

import React, { Suspense, lazy, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformanceTimer } from '@/lib/performance';

// Lazy load heavy components
const QuantumProcessingMatrix = lazy(() => import('./components/QuantumProcessingMatrix'));
const MultidimensionalDataStreams = lazy(() => import('./components/MultidimensionalDataStreams'));
const AdvancedSensorNetwork = lazy(() => import('./components/AdvancedSensorNetwork'));
const PredictiveScenarioModeling = lazy(() => import('./components/PredictiveScenarioModeling'));
const SystemOptimizationEngine = lazy(() => import('./components/SystemOptimizationEngine'));

// Loading fallback component
const ComponentSkeleton = memo(() => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full" />
      </div>
    </CardContent>
  </Card>
));

interface QuantumOperationsCenterProps {
  className?: string;
}

const QuantumOperationsCenter: React.FC<QuantumOperationsCenterProps> = memo(({ className }) => {
  const timer = usePerformanceTimer('QuantumOperationsCenter');

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ComponentSkeleton />}>
          <QuantumProcessingMatrix />
        </Suspense>
        
        <Suspense fallback={<ComponentSkeleton />}>
          <MultidimensionalDataStreams />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Suspense fallback={<ComponentSkeleton />}>
          <AdvancedSensorNetwork />
        </Suspense>
        
        <Suspense fallback={<ComponentSkeleton />}>
          <PredictiveScenarioModeling />
        </Suspense>
        
        <Suspense fallback={<ComponentSkeleton />}>
          <SystemOptimizationEngine />
        </Suspense>
      </div>
    </div>
  );
});

QuantumOperationsCenter.displayName = 'QuantumOperationsCenter';

export default QuantumOperationsCenter;