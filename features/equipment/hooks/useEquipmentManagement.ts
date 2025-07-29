import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  EquipmentCreation, 
  EquipmentCreationSchema,
  EquipmentUpdateSchema,
  MaintenanceRecord,
  IoTSensorDetails
} from '../schemas/equipment-schema';

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Equipment Management Hook
export function useEquipmentManagement() {
  const [equipment, setEquipment] = useState<EquipmentCreation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create new equipment
  const createEquipment = useCallback(async (equipmentData: EquipmentCreation) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate equipment data
      const validatedData = EquipmentCreationSchema.parse(equipmentData);

      // Insert equipment into Supabase
      const { data, error } = await supabase
        .from('equipment')
        .insert(validatedData)
        .select();

      if (error) throw error;

      // Update local state
      setEquipment(prev => [...prev, validatedData]);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch equipment with advanced filtering
  const fetchEquipment = useCallback(async (filters: Partial<EquipmentCreation> = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from('equipment').select('*');

      // Apply dynamic filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;

      if (error) throw error;

      setEquipment(data || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update existing equipment
  const updateEquipment = useCallback(async (
    equipmentId: string, 
    updateData: Partial<EquipmentCreation>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate update data
      const validatedData = EquipmentUpdateSchema.parse(updateData);

      // Update equipment in Supabase
      const { data, error } = await supabase
        .from('equipment')
        .update(validatedData)
        .eq('id', equipmentId)
        .select();

      if (error) throw error;

      // Update local state
      setEquipment(prev => 
        prev.map(item => 
          item.id === equipmentId 
            ? { ...item, ...validatedData } 
            : item
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

  // Delete equipment
  const deleteEquipment = useCallback(async (equipmentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipmentId);

      if (error) throw error;

      // Update local state
      setEquipment(prev => prev.filter(item => item.id !== equipmentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add maintenance record to equipment
  const addMaintenanceRecord = useCallback(async (
    equipmentId: string, 
    record: MaintenanceRecord
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update equipment with new maintenance record
      const { data, error } = await supabase
        .from('equipment')
        .update({ 
          maintenanceRecords: supabase.fn.array_append('maintenanceRecords', record) 
        })
        .eq('id', equipmentId)
        .select();

      if (error) throw error;

      // Update local state
      setEquipment(prev => 
        prev.map(item => 
          item.id === equipmentId 
            ? { 
                ...item, 
                maintenanceRecords: [
                  ...(item.maintenanceRecords || []), 
                  record
                ] 
              } 
            : item
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

  // Update IoT sensor details
  const updateSensorDetails = useCallback(async (
    equipmentId: string, 
    sensorDetails: IoTSensorDetails
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update equipment with sensor details
      const { data, error } = await supabase
        .from('equipment')
        .update({ sensorDetails })
        .eq('id', equipmentId)
        .select();

      if (error) throw error;

      // Update local state
      setEquipment(prev => 
        prev.map(item => 
          item.id === equipmentId 
            ? { ...item, sensorDetails } 
            : item
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

  // Advanced equipment search
  const searchEquipment = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .or(
          `name.ilike.%${searchTerm}%,` +
          `serialNumber.ilike.%${searchTerm}%,` +
          `currentLocation.ilike.%${searchTerm}%`
        );

      if (error) throw error;

      setEquipment(data || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    equipment,
    isLoading,
    error,
    createEquipment,
    fetchEquipment,
    updateEquipment,
    deleteEquipment,
    addMaintenanceRecord,
    updateSensorDetails,
    searchEquipment
  };
}

// Specific hook for equipment creation
export function useCreateEquipment() {
  const { createEquipment, isLoading, error } = useEquipmentManagement();
  return { createEquipment, isLoading, error };
}

// Specific hook for equipment listing
export function useEquipmentList(initialFilters?: Partial<EquipmentCreation>) {
  const { 
    equipment, 
    fetchEquipment, 
    isLoading, 
    error 
  } = useEquipmentManagement();

  // Fetch equipment on component mount
  useEffect(() => {
    if (initialFilters) {
      fetchEquipment(initialFilters);
    } else {
      fetchEquipment();
    }
  }, [fetchEquipment, initialFilters]);

  return { equipment, fetchEquipment, isLoading, error };
}

// Real-time equipment updates subscription
export function useEquipmentSubscription() {
  const [equipment, setEquipment] = useState<EquipmentCreation[]>([]);

  useEffect(() => {
    // Subscribe to real-time equipment changes
    const subscription = supabase
      .from('equipment')
      .on('*', (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            setEquipment(prev => [...prev, payload.new]);
            break;
          case 'UPDATE':
            setEquipment(prev => 
              prev.map(item => 
                item.id === payload.new.id 
                  ? { ...item, ...payload.new } 
                  : item
              )
            );
            break;
          case 'DELETE':
            setEquipment(prev => 
              prev.filter(item => item.id !== payload.old.id)
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

  return equipment;
}