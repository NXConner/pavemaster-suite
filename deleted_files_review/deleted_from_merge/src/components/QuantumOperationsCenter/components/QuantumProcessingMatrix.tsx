/**
 * Quantum Processing Matrix - Optimized Component
 * Extracted from QuantumOperationsCenter for better code splitting
 */

import React, { useState, useEffect, memo, useCallback } from 'react';
import { Cpu, Brain, Zap, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usePerformanceTimer } from '@/lib/performance';

interface QuantumProcessor {
  id: string;
  name: string;
  type: 'quantum_ai' | 'neural_network' | 'decision_tree' | 'pattern_recognition';
  qubits: number;
  coherence_time: number;
  gate_fidelity: number;
  processing_power: number;
  quantum_state: 'superposition' | 'entangled' | 'collapsed' | 'error_corrected';
  current_task: string;
  efficiency: number;
  temperature: number;
}

const QuantumProcessingMatrix: React.FC = memo(() => {
  const timer = usePerformanceTimer('QuantumProcessingMatrix');
  const [processors, setProcessors] = useState<QuantumProcessor[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Initialize quantum processors
  useEffect(() => {
    const initialProcessors: QuantumProcessor[] = [
      {
        id: 'qp-001',
        name: 'Quantum Core Alpha',
        type: 'quantum_ai',
        qubits: 64,
        coherence_time: 100,
        gate_fidelity: 99.97,
        processing_power: 2.5,
        quantum_state: 'superposition',
        current_task: 'Route Optimization',
        efficiency: 94.7,
        temperature: 15.2
      },
      {
        id: 'qp-002',
        name: 'Neural Matrix Beta',
        type: 'neural_network',
        qubits: 32,
        coherence_time: 75,
        gate_fidelity: 99.85,
        processing_power: 1.8,
        quantum_state: 'entangled',
        current_task: 'Pattern Analysis',
        efficiency: 87.3,
        temperature: 12.8
      },
      {
        id: 'qp-003',
        name: 'Decision Engine Gamma',
        type: 'decision_tree',
        qubits: 16,
        coherence_time: 50,
        gate_fidelity: 99.42,
        processing_power: 1.2,
        quantum_state: 'error_corrected',
        current_task: 'Resource Allocation',
        efficiency: 78.9,
        temperature: 18.5
      }
    ];
    setProcessors(initialProcessors);
  }, []);

  const optimizeQuantumStates = useCallback(() => {
    setIsOptimizing(true);
    
    // Simulate quantum optimization
    setTimeout(() => {
      setProcessors(prev => prev.map(processor => ({
        ...processor,
        efficiency: Math.min(processor.efficiency + Math.random() * 5, 100),
        gate_fidelity: Math.min(processor.gate_fidelity + Math.random() * 0.1, 100),
        quantum_state: 'error_corrected' as const
      })));
      setIsOptimizing(false);
    }, 2000);
  }, []);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'superposition': return 'bg-blue-500';
      case 'entangled': return 'bg-purple-500';
      case 'collapsed': return 'bg-red-500';
      case 'error_corrected': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quantum_ai': return <Brain className="h-4 w-4" />;
      case 'neural_network': return <Cpu className="h-4 w-4" />;
      case 'decision_tree': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Quantum Processing Matrix
        </CardTitle>
        <Button 
          onClick={optimizeQuantumStates} 
          disabled={isOptimizing}
          size="sm"
          className="w-fit"
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Quantum States'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processors.map((processor) => (
            <div key={processor.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(processor.type)}
                  <span className="font-medium">{processor.name}</span>
                </div>
                <Badge className={getStateColor(processor.quantum_state)}>
                  {processor.quantum_state}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Qubits:</span>
                  <span className="ml-2 font-medium">{processor.qubits}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Coherence:</span>
                  <span className="ml-2 font-medium">{processor.coherence_time}μs</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fidelity:</span>
                  <span className="ml-2 font-medium">{processor.gate_fidelity.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Temp:</span>
                  <span className="ml-2 font-medium">{processor.temperature.toFixed(1)}mK</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Efficiency</span>
                  <span className="text-sm font-medium">{processor.efficiency.toFixed(1)}%</span>
                </div>
                <Progress value={processor.efficiency} className="h-2" />
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Current Task:</span>
                <span className="ml-2">{processor.current_task}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

QuantumProcessingMatrix.displayName = 'QuantumProcessingMatrix';

export default QuantumProcessingMatrix;