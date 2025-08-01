import { supabase } from '../../integrations/supabase/client';

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error';
}

export class ApiService {
  // Project Management API
  async getProjects(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      return {
        data,
        error: error?.message || null,
        status: error ? 'error' : 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }

  async createProject(project: any): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();
      
      return {
        data,
        error: error?.message || null,
        status: error ? 'error' : 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }

  // Equipment Management API
  async getEquipment(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');
      
      return {
        data,
        error: error?.message || null,
        status: error ? 'error' : 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }

  async updateEquipmentStatus(id: string, status: string): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      return {
        data,
        error: error?.message || null,
        status: error ? 'error' : 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }

  // Fleet Management API
  async getFleetVehicles(): Promise<ApiResponse> {
    try {
      const { data, error } = await supabase
        .from('fleet_vehicles')
        .select('*')
        .order('vehicle_name');
      
      return {
        data,
        error: error?.message || null,
        status: error ? 'error' : 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }

  // Analytics API
  async getDashboardMetrics(): Promise<ApiResponse> {
    try {
      // Mock data for now - would implement real analytics
      const mockData = {
        totalProjects: 42,
        activeProjects: 12,
        completedProjects: 30,
        totalRevenue: 125000,
        equipmentUtilization: 85,
        fuelEfficiency: 12.5
      };
      
      return {
        data: mockData,
        error: null,
        status: 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }
}

export const apiService = new ApiService();