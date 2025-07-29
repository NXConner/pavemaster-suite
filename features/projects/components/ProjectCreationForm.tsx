import React from 'react';
import { 
  Box, 
  Grid, 
  MenuItem, 
  Typography 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import Form, { 
  FormField, 
  FormSubmitButton 
} from '@/components/ui/Form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

import { 
  ProjectCreationSchema, 
  PROJECT_TYPES, 
  PROJECT_STATUSES,
  ProjectCreation 
} from '../schemas/project-schema';

import { useCreateProject } from '../hooks/useProjectManagement';

export function ProjectCreationForm() {
  const { createProject, isLoading } = useCreateProject();

  const handleSubmit = async (data: ProjectCreation) => {
    try {
      await createProject(data);
      // Optional: Show success toast or redirect
    } catch (error) {
      // Optional: Handle error (show error toast)
      console.error('Project creation failed', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Form
        schema={ProjectCreationSchema}
        onSubmit={handleSubmit}
        title="Create New Church Parking Lot Project"
        description="Carefully plan your church parking lot renovation or maintenance project"
      >
        {(methods) => (
          <>
            <Grid container spacing={2}>
              {/* Basic Project Information */}
              <Grid item xs={12} md={6}>
                <FormField 
                  name="name" 
                  label="Project Name" 
                  placeholder="e.g., First Baptist Church Parking Lot Renovation"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormField 
                  name="churchName" 
                  label="Church Name" 
                  placeholder="Full church name"
                />
              </Grid>

              {/* Client and Location Details */}
              <Grid item xs={12} md={6}>
                <FormField 
                  name="clientName" 
                  label="Contact Person" 
                  placeholder="Name of primary contact"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormField 
                  name="locationAddress" 
                  label="Church Address" 
                  placeholder="Full street address"
                />
              </Grid>

              {/* Project Type and Status */}
              <Grid item xs={12} md={6}>
                <Input
                  select
                  label="Project Type"
                  {...methods.register('type')}
                  fullWidth
                >
                  {PROJECT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Input>
              </Grid>

              <Grid item xs={12} md={6}>
                <Input
                  select
                  label="Project Status"
                  {...methods.register('status')}
                  fullWidth
                  defaultValue="planning"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Input>
              </Grid>

              {/* Scheduling */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  {...methods.register('startDate')}
                  renderInput={(params) => <Input {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date (Optional)"
                  {...methods.register('endDate')}
                  renderInput={(params) => <Input {...params} fullWidth />}
                />
              </Grid>

              {/* Cost and Additional Details */}
              <Grid item xs={12} md={6}>
                <FormField 
                  name="estimatedCost" 
                  label="Estimated Cost" 
                  type="number"
                  placeholder="Project budget estimate"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormField 
                  name="parkingSpaceCount" 
                  label="Number of Parking Spaces" 
                  type="number"
                  placeholder="Total parking spaces"
                />
              </Grid>

              {/* Notes and Special Considerations */}
              <Grid item xs={12}>
                <FormField 
                  name="notes" 
                  label="Additional Notes" 
                  multiline
                  rows={4}
                  placeholder="Any special requirements or considerations"
                />
              </Grid>

              {/* Compliance and Accessibility */}
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <Input
                    type="checkbox"
                    {...methods.register('accessibilityRequirements')}
                    label="Accessibility Requirements"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <Input
                    type="checkbox"
                    {...methods.register('permitRequired')}
                    label="Permit Required"
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Submit and Additional Actions */}
            <Box mt={3} display="flex" gap={2}>
              <FormSubmitButton loading={isLoading}>
                Create Project
              </FormSubmitButton>
              <Button 
                variant="secondary" 
                onClick={() => methods.reset()}
              >
                Reset Form
              </Button>
            </Box>
          </>
        )}
      </Form>
    </LocalizationProvider>
  );
}

export default ProjectCreationForm;