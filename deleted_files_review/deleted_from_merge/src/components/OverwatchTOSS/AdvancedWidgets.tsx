import React, { useState, useEffect } from 'react';
import { WidgetCategory } from './WidgetSystem';
import * as d3 from 'd3';
import * as tf from '@tensorflow/tfjs';
import { aiModelTrainer, AIModelType } from '../../services/ai/ModelTrainingInfrastructure';
import { financialTracker, TransactionType } from '../../services/financial/FinancialTrackingSystem';

// Advanced Surveillance Widget
export const AdvancedSurveillanceWidget: React.FC<{ terminology?: 'military' | 'civilian' }> = ({ 
  terminology = 'civilian' 
}) => {
  const [trackingData, setTrackingData] = useState({
    vehicles: 0,
    personnel: 0,
    activeAlerts: 0
  });

  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high'>('low');

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        // Simulate tracking data fetch with AI prediction
        const predictionInput = tf.randomNormal([1, 10]);
        const threatPrediction = await aiModelTrainer.predictWithModel(
          AIModelType.ANOMALY_DETECTION, 
          predictionInput
        );

        const threatScore = (await threatPrediction.data())[0];
        
        setTrackingData({
          vehicles: Math.floor(Math.random() * 50),
          personnel: Math.floor(Math.random() * 20),
          activeAlerts: Math.floor(Math.random() * 5)
        });

        // Determine threat level based on AI prediction
        setThreatLevel(
          threatScore > 0.7 ? 'high' : 
          threatScore > 0.3 ? 'medium' : 'low'
        );
      } catch (error) {
        console.error('Tracking data fetch failed', error);
      }
    };

    const intervalId = setInterval(fetchTrackingData, 30000); // Update every 30 seconds
    fetchTrackingData(); // Initial fetch

    return () => clearInterval(intervalId);
  }, []);

  const renderThreatLevelIndicator = () => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red'
    };

    return (
      <div 
        style={{ 
          backgroundColor: colors[threatLevel], 
          color: 'white', 
          padding: '5px', 
          borderRadius: '5px' 
        }}
      >
        {terminology === 'military' 
          ? `DEFCON LEVEL: ${threatLevel.toUpperCase()}` 
          : `Threat Level: ${threatLevel}`}
      </div>
    );
  };

  return (
    <div className="advanced-surveillance-widget">
      {renderThreatLevelIndicator()}
      <div className="tracking-stats">
        <p>
          {terminology === 'military' 
            ? 'TACTICAL ASSETS IN MOTION' 
            : 'Active Tracking'}:
          <br />
          Vehicles: {trackingData.vehicles}
          <br />
          Personnel: {trackingData.personnel}
          <br />
          Active Alerts: {trackingData.activeAlerts}
        </p>
      </div>
    </div>
  );
};

// Advanced Operations Widget
export const AdvancedOperationsWidget: React.FC<{ terminology?: 'military' | 'civilian' }> = ({ 
  terminology = 'civilian' 
}) => {
  const [taskData, setTaskData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    efficiency: 0
  });

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        // Simulate task data with AI-powered productivity optimization
        const predictionInput = tf.randomNormal([1, 15]);
        const efficiencyPrediction = await aiModelTrainer.predictWithModel(
          AIModelType.PRODUCTIVITY_OPTIMIZATION, 
          predictionInput
        );

        const efficiency = (await efficiencyPrediction.data())[0];
        
        setTaskData({
          totalTasks: Math.floor(Math.random() * 100),
          completedTasks: Math.floor(Math.random() * 80),
          inProgressTasks: Math.floor(Math.random() * 20),
          efficiency: efficiency * 100
        });
      } catch (error) {
        console.error('Task data fetch failed', error);
      }
    };

    const intervalId = setInterval(fetchTaskData, 60000); // Update every minute
    fetchTaskData(); // Initial fetch

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="advanced-operations-widget">
      <h3>
        {terminology === 'military' 
          ? 'MISSION TASK MANAGEMENT' 
          : 'Task Management'}
      </h3>
      <div className="task-stats">
        <p>Total Tasks: {taskData.totalTasks}</p>
        <p>Completed Tasks: {taskData.completedTasks}</p>
        <p>In Progress Tasks: {taskData.inProgressTasks}</p>
        <p>
          {terminology === 'military' 
            ? 'OPERATIONAL EFFICIENCY' 
            : 'Efficiency'}: 
          {taskData.efficiency.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

// Advanced Financial Widget
export const AdvancedFinancialWidget: React.FC<{ terminology?: 'military' | 'civilian' }> = ({ 
  terminology = 'civilian' 
}) => {
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    budgetAdherence: 0
  });

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Generate financial report
        const report = financialTracker.generateFinancialReport(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          new Date()
        );

        // Predict future costs
        const costPredictionInput = [
          [100, 200, 300, 400, 500],
          [150, 250, 350, 450, 550]
        ];
        const predictedCost = await financialTracker.predictCosts(costPredictionInput);

        // Simulate budget adherence calculation
        const budgetId = 'sample-budget-id'; // In a real scenario, this would be dynamically fetched
        const budgetAdherence = financialTracker.checkBudgetAdherence(budgetId);

        setFinancialData({
          totalIncome: report.totalIncome,
          totalExpenses: report.totalExpenses,
          netProfit: report.netProfit,
          budgetAdherence: budgetAdherence.isWithinBudget 
            ? (budgetAdherence.currentSpending / budgetAdherence.budgetLimit) * 100 
            : 120 // Over budget
        });
      } catch (error) {
        console.error('Financial data fetch failed', error);
      }
    };

    const intervalId = setInterval(fetchFinancialData, 300000); // Update every 5 minutes
    fetchFinancialData(); // Initial fetch

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="advanced-financial-widget">
      <h3>
        {terminology === 'military' 
          ? 'RESOURCE ALLOCATION METRICS' 
          : 'Financial Overview'}
      </h3>
      <div className="financial-stats">
        <p>
          {terminology === 'military' 
            ? 'TOTAL RESOURCE INCOME' 
            : 'Total Income'}: 
          ${financialData.totalIncome.toFixed(2)}
        </p>
        <p>
          {terminology === 'military' 
            ? 'OPERATIONAL EXPENDITURES' 
            : 'Total Expenses'}: 
          ${financialData.totalExpenses.toFixed(2)}
        </p>
        <p>
          {terminology === 'military' 
            ? 'NET RESOURCE GAIN' 
            : 'Net Profit'}: 
          ${financialData.netProfit.toFixed(2)}
        </p>
        <p>
          {terminology === 'military' 
            ? 'BUDGET ALLOCATION COMPLIANCE' 
            : 'Budget Adherence'}: 
          {financialData.budgetAdherence.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

// Export all advanced widgets
export const AdvancedWidgets = {
  Surveillance: AdvancedSurveillanceWidget,
  Operations: AdvancedOperationsWidget,
  Financial: AdvancedFinancialWidget
};