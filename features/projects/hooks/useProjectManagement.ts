import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ProjectCreation, 
  ProjectCreationSchema,
  ProjectUpdateSchema 
} from '../schemas/project-schema';

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Project Management Hook
export function useProjectManagement() {
  const [projects, setProjects] = useState<ProjectCreation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new project
  const createProject = useCallback(async (projectData: ProjectCreation) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate project data
      const validatedData = ProjectCreationSchema.parse(projectData);

      // Insert project into Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert(validatedData)
        .select();

      if (error) throw error;

      // Update local state
      setProjects(prev => [...prev, validatedData]);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch projects with advanced filtering
  const fetchProjects = useCallback(async (filters: Partial<ProjectCreation> = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from('projects').select('*');

      // Apply dynamic filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;

      if (error) throw error;

      setProjects(data || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing project
  const updateProject = useCallback(async (
    projectId: string, 
    updateData: Partial<ProjectCreation>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate update data
      const validatedData = ProjectUpdateSchema.parse(updateData);

      // Update project in Supabase
      const { data, error } = await supabase
        .from('projects')
        .update(validatedData)
        .eq('id', projectId)
        .select();

      if (error) throw error;

      // Update local state
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, ...validatedData } 
            : project
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

  // Delete a project
  const deleteProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Advanced project search
  const searchProjects = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(
          `name.ilike.%${searchTerm}%,` +
          `churchName.ilike.%${searchTerm}%,` +
          `locationAddress.ilike.%${searchTerm}%`
        );

      if (error) throw error;

      setProjects(data || []);
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
    projects,
    isLoading,
    error,
    createProject,
    fetchProjects,
    updateProject,
    deleteProject,
    searchProjects
  };
}

// Specific hook for project creation (simplified)
export function useCreateProject() {
  const { createProject, isLoading, error } = useProjectManagement();
  return { createProject, isLoading, error };
}

// Specific hook for project listing
export function useProjectList(initialFilters?: Partial<ProjectCreation>) {
  const { 
    projects, 
    fetchProjects, 
    isLoading, 
    error 
  } = useProjectManagement();

  // Fetch projects on component mount
  useEffect(() => {
    if (initialFilters) {
      fetchProjects(initialFilters);
    } else {
      fetchProjects();
    }
  }, [fetchProjects, initialFilters]);

  return { projects, fetchProjects, isLoading, error };
}

// Real-time project updates subscription
export function useProjectSubscription() {
  const [projects, setProjects] = useState<ProjectCreation[]>([]);

  useEffect(() => {
    // Subscribe to real-time project changes
    const subscription = supabase
      .from('projects')
      .on('*', (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            setProjects(prev => [...prev, payload.new]);
            break;
          case 'UPDATE':
            setProjects(prev => 
              prev.map(project => 
                project.id === payload.new.id 
                  ? { ...project, ...payload.new } 
                  : project
              )
            );
            break;
          case 'DELETE':
            setProjects(prev => 
              prev.filter(project => project.id !== payload.old.id)
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

  return projects;
}