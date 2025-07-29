import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  EstimationCreation, 
  EstimationCreationSchema,
  EstimationUpdateSchema,
  MaterialCalculation,
  LaborCalculation,
  ParkingLotLayout
} from '../schemas/estimation-schema';

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Estimation Management Hook
export function useEstimationManagement() {
  const [estimations, setEstimations] = useState<EstimationCreation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create new estimation
  const createEstimation = useCallback(async (estimationData: EstimationCreation) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate estimation data
      const validatedData = EstimationCreationSchema.parse(estimationData);

      // Insert estimation into Supabase
      const { data, error } = await supabase
        .from('estimations')
        .insert(validatedData)
        .select();

      if (error) throw error;

      // Update local state
      setEstimations(prev => [...prev, validatedData]);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch estimations with advanced filtering
  const fetchEstimations = useCallback(async (filters: Partial<EstimationCreation> = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from('estimations').select('*');

      // Apply dynamic filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;

      if (error) throw error;

      setEstimations(data || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update existing estimation
  const updateEstimation = useCallback(async (
    estimationId: string, 
    updateData: Partial<EstimationCreation>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate update data
      const validatedData = EstimationUpdateSchema.parse(updateData);

      // Update estimation in Supabase
      const { data, error } = await supabase
        .from('estimations')
        .update(validatedData)
        .eq('id', estimationId)
        .select();

      if (error) throw error;

      // Update local state
      setEstimations(prev => 
        prev.map(estimation => 
          estimation.id === estimationId 
            ? { ...estimation, ...validatedData } 
            : estimation
        )
      );

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete an estimation
  const deleteEstimation = useCallback(async (estimationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('estimations')
        .delete()
        .eq('id', estimationId);

      if (error) throw error;

      // Update local state
      setEstimations(prev => prev.filter(estimation => estimation.id !== estimationId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Advanced estimation search
  const searchEstimations = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('estimations')
        .select('*')
        .or(
          `churchName.ilike.%${searchTerm}%,` +
          `additionalNotes.ilike.%${searchTerm}%`
        );

      if (error) throw error;

      setEstimations(data || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate total project cost
  const calculateTotalCost = useCallback((estimation: EstimationCreation) => {
    const materialCost = estimation.materialEstimates.reduce(
      (total, material) => total + material.totalCost, 
      0
    );
    const laborCost = estimation.laborEstimates.reduce(
      (total, labor) => total + labor.totalCost, 
      0
    );
    const profitAmount = (materialCost + laborCost) * (estimation.profitMargin / 100);

    return {
      materialCost,
      laborCost,
      profitAmount,
      totalCost: materialCost + laborCost + profitAmount
    };
  }, []);

  // Generate parking lot layout visualization
  const generateParkingLotLayout = useCallback((layout: ParkingLotLayout) => {
    // This would typically involve a more complex visualization logic
    // For now, we'll return a simple representation
    return {
      totalSpaces: layout.totalSpaces,
      handicapSpaces: layout.handicapSpaces,
      compactSpaces: layout.compactSpaces,
      layoutType: layout.layoutType,
      specialRequirements: layout.specialRequirements
    };
  }, []);

  return {
    estimations,
    isLoading,
    error,
    createEstimation,
    fetchEstimations,
    updateEstimation,
    deleteEstimation,
    searchEstimations,
    calculateTotalCost,
    generateParkingLotLayout
  };
}

// Specific hook for estimation creation
export function useCreateEstimation() {
  const { createEstimation, isLoading, error } = useEstimationManagement();
  return { createEstimation, isLoading, error };
}

// Specific hook for estimation listing
export function useEstimationList(initialFilters?: Partial<EstimationCreation>) {
  const { 
    estimations, 
    fetchEstimations, 
    isLoading, 
    error 
  } = useEstimationManagement();

  // Fetch estimations on component mount
  useEffect(() => {
    if (initialFilters) {
      fetchEstimations(initialFilters);
    } else {
      fetchEstimations();
    }
  }, [fetchEstimations, initialFilters]);

  return { estimations, fetchEstimations, isLoading, error };
}

// Real-time estimation updates subscription
export function useEstimationSubscription() {
  const [estimations, setEstimations] = useState<EstimationCreation[]>([]);

  useEffect(() => {
    // Subscribe to real-time estimation changes
    const subscription = supabase
      .from('estimations')
      .on('*', (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            setEstimations(prev => [...prev, payload.new]);
            break;
          case 'UPDATE':
            setEstimations(prev => 
              prev.map(estimation => 
                estimation.id === payload.new.id 
                  ? { ...estimation, ...payload.new } 
                  : estimation
              )
            );
            break;
          case 'DELETE':
            setEstimations(prev => 
              prev.filter(estimation => estimation.id !== payload.old.id)
            );
            break;
        }
      })
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  return estimations;
}