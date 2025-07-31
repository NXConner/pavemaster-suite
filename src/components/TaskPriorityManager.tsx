import React, { useState, useEffect } from 'react';
import { 
  Target, Calendar, Clock, Flag, Users, CheckCircle, AlertTriangle, 
  Edit, Save, X, Plus, ArrowUp, ArrowDown, Star, Zap, Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TaskPriority {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'daily' | 'weekly';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assigned_to: string[];
  project_id?: string;
  due_date?: string;
  estimated_hours?: number;
  dependencies: string[];
  order_index: number;
  created_by: string;
  updated_at: string;
  tags: string[];
  urgency_score: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  start_date: string;
}

const TaskPriorityManager: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dailyTasks, setDailyTasks] = useState<TaskPriority[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<TaskPriority[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskPriority | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [militaryJargon, setMilitaryJargon] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'timeline'>('list');

  // Check admin access
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      setUserRole(data?.role);
    };

    checkUserRole();
  }, [user]);

  // Load data when component mounts
  useEffect(() => {
    if (userRole && ['super_admin', 'admin', 'manager'].includes(userRole)) {
      fetchAllData();
    }
  }, [userRole]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchTasks(),
      fetchProjects(),
      fetchEmployees()
    ]);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('project_tasks')
      .select(`
        *,
        project:projects(name),
        assigned_employee:employees(first_name, last_name)
      `)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    const tasks = data?.map(task => ({
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      priority: determinePriority(task.priority),
      type: determineType(task.due_date),
      status: task.status || 'pending',
      assigned_to: task.assigned_to ? [task.assigned_to] : [],
      project_id: task.project_id,
      due_date: task.due_date,
      estimated_hours: task.estimated_hours,
      dependencies: task.dependencies || [],
      order_index: 0, // Will be set based on array position
      created_by: user?.id || '',
      updated_at: task.updated_at || new Date().toISOString(),
      tags: [],
      urgency_score: calculateUrgencyScore(task)
    })) || [];

    // Separate daily and weekly tasks
    const daily = tasks.filter(t => t.type === 'daily');
    const weekly = tasks.filter(t => t.type === 'weekly');

    setDailyTasks(daily.map((task, index) => ({ ...task, order_index: index })));
    setWeeklyTasks(weekly.map((task, index) => ({ ...task, order_index: index })));
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status, start_date')
      .in('status', ['planning', 'active', 'in_progress']);

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    setProjects(data || []);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, role')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching employees:', error);
      return;
    }

    setEmployees(data || []);
  };

  const determinePriority = (priority: string | null): TaskPriority['priority'] => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  const determineType = (dueDate: string | null): 'daily' | 'weekly' => {
    if (!dueDate) return 'weekly';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays <= 1 ? 'daily' : 'weekly';
  };

  const calculateUrgencyScore = (task: any): number => {
    let score = 0;
    
    // Priority weight
    switch (task.priority?.toLowerCase()) {
      case 'critical': score += 100; break;
      case 'high': score += 75; break;
      case 'medium': score += 50; break;
      case 'low': score += 25; break;
    }
    
    // Due date urgency
    if (task.due_date) {
      const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 0) score += 50; // Overdue
      else if (daysUntilDue <= 1) score += 40; // Due today/tomorrow
      else if (daysUntilDue <= 3) score += 30; // Due soon
    }
    
    // Status modifier
    if (task.status === 'blocked') score += 20;
    if (task.status === 'in_progress') score += 10;
    
    return score;
  };

  const createTask = async (taskData: Partial<TaskPriority>) => {
    const newTask: Partial<TaskPriority> = {
      ...taskData,
      id: `task_${Date.now()}`,
      created_by: user?.id,
      updated_at: new Date().toISOString(),
      order_index: taskData.type === 'daily' ? dailyTasks.length : weeklyTasks.length,
      urgency_score: 0
    };

    // Insert into database
    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        assigned_to: newTask.assigned_to?.[0],
        project_id: newTask.project_id,
        due_date: newTask.due_date,
        estimated_hours: newTask.estimated_hours,
        dependencies: newTask.dependencies
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error creating task",
        description: error.message
      });
      return;
    }

    const createdTask = {
      ...newTask,
      id: data.id,
      urgency_score: calculateUrgencyScore(data)
    } as TaskPriority;

    if (taskData.type === 'daily') {
      setDailyTasks(prev => [...prev, createdTask]);
    } else {
      setWeeklyTasks(prev => [...prev, createdTask]);
    }

    toast({
      title: "Task created",
      description: `${newTask.title} has been added to ${taskData.type} priorities`
    });
  };

  const updateTask = async (taskId: string, updates: Partial<TaskPriority>) => {
    const { error } = await supabase
      .from('project_tasks')
      .update({
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        status: updates.status,
        assigned_to: updates.assigned_to?.[0],
        project_id: updates.project_id,
        due_date: updates.due_date,
        estimated_hours: updates.estimated_hours,
        dependencies: updates.dependencies
      })
      .eq('id', taskId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message
      });
      return;
    }

    const updateTaskInState = (tasks: TaskPriority[]) =>
      tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              ...updates, 
              updated_at: new Date().toISOString(),
              urgency_score: calculateUrgencyScore({ ...task, ...updates })
            }
          : task
      );

    setDailyTasks(updateTaskInState);
    setWeeklyTasks(updateTaskInState);

    if (autoSave) {
      toast({
        title: "Task updated",
        description: "Changes saved automatically"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: error.message
      });
      return;
    }

    setDailyTasks(prev => prev.filter(task => task.id !== taskId));
    setWeeklyTasks(prev => prev.filter(task => task.id !== taskId));

    toast({
      title: "Task deleted",
      description: "Task has been removed from priorities"
    });
  };

  const moveTask = (taskId: string, newType: 'daily' | 'weekly') => {
    const findAndRemoveTask = (tasks: TaskPriority[]) => {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return { task: null, remaining: tasks };
      
      const task = tasks[taskIndex];
      const remaining = tasks.filter((_, index) => index !== taskIndex);
      return { task, remaining };
    };

    // Try to find task in daily tasks
    let { task, remaining } = findAndRemoveTask(dailyTasks);
    if (task) {
      setDailyTasks(remaining);
      if (newType === 'weekly') {
        setWeeklyTasks(prev => [...prev, { ...task, type: 'weekly' }]);
      } else {
        setDailyTasks(prev => [...prev, task]);
      }
      return;
    }

    // Try weekly tasks
    ({ task, remaining } = findAndRemoveTask(weeklyTasks));
    if (task) {
      setWeeklyTasks(remaining);
      if (newType === 'daily') {
        setDailyTasks(prev => [...prev, { ...task, type: 'daily' }]);
      } else {
        setWeeklyTasks(prev => [...prev, task]);
      }
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within same list
      const tasks = source.droppableId === 'daily' ? dailyTasks : weeklyTasks;
      const reorderedTasks = Array.from(tasks);
      const [removed] = reorderedTasks.splice(source.index, 1);
      reorderedTasks.splice(destination.index, 0, removed);

      // Update order indices
      const updatedTasks = reorderedTasks.map((task, index) => ({
        ...task,
        order_index: index
      }));

      if (source.droppableId === 'daily') {
        setDailyTasks(updatedTasks);
      } else {
        setWeeklyTasks(updatedTasks);
      }
    } else {
      // Moving between lists
      moveTask(draggableId, destination.droppableId as 'daily' | 'weekly');
    }
  };

  const getPriorityColor = (priority: TaskPriority['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: TaskPriority['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Timer className="h-4 w-4 text-blue-500" />;
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getJargonText = (civilian: string, military: string) => {
    return militaryJargon ? military : civilian;
  };

  const filteredTasks = (tasks: TaskPriority[]) => {
    return tasks.filter(task => {
      const matchesProject = selectedProject === 'all' || task.project_id === selectedProject;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      return matchesProject && matchesStatus;
    });
  };

  const TaskCard: React.FC<{ task: TaskPriority; index: number }> = ({ task, index }) => (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 transition-all ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : 'shadow-sm'
          } ${isEditing ? 'cursor-move' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <h4 className="font-medium text-sm">{task.title}</h4>
              </div>
              <div className="flex items-center space-x-1">
                <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </Badge>
                {isEditing && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTask(task)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {task.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                {task.assigned_to.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{task.assigned_to.length}</span>
                  </div>
                )}
                {task.estimated_hours && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{task.estimated_hours}h</span>
                  </div>
                )}
              </div>
              
              {task.due_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            {task.urgency_score > 80 && (
              <div className="mt-2 flex items-center space-x-1 text-destructive">
                <Zap className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {getJargonText('Urgent', 'Priority Alpha')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const TaskColumn: React.FC<{ 
    title: string; 
    tasks: TaskPriority[]; 
    droppableId: string;
    type: 'daily' | 'weekly';
  }> = ({ title, tasks, droppableId, type }) => (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          {type === 'daily' ? <Target className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
          <span>{title}</span>
          <Badge variant="outline">{filteredTasks(tasks).length}</Badge>
        </h3>
        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingTask({
                id: '',
                title: '',
                description: '',
                priority: 'medium',
                type,
                status: 'pending',
                assigned_to: [],
                dependencies: [],
                order_index: 0,
                created_by: user?.id || '',
                updated_at: new Date().toISOString(),
                tags: [],
                urgency_score: 0
              });
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>
      
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-96 p-2 rounded-lg transition-colors ${
              snapshot.isDraggingOver ? 'bg-muted/50' : 'bg-muted/10'
            }`}
          >
            {filteredTasks(tasks)
              .sort((a, b) => b.urgency_score - a.urgency_score)
              .map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))
            }
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );

  if (!userRole || !['super_admin', 'admin', 'manager'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            {getJargonText(
              'Administrative access required to manage task priorities',
              'Command authorization required for mission planning'
            )}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Flag className="h-6 w-6 text-primary" />
            <span>
              {getJargonText('Task Priority Manager', 'Mission Command Center')}
            </span>
          </h2>
          <Badge variant="outline">
            {getJargonText('Project Start Page', 'Mission Briefing')}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="military-jargon"
              checked={militaryJargon}
              onCheckedChange={setMilitaryJargon}
            />
            <Label htmlFor="military-jargon" className="text-sm">
              {getJargonText('Military Terms', 'Tactical Language')}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
            <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
          </div>
          
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskColumn
            title={getJargonText('Daily Priorities', 'Daily Mission Objectives')}
            tasks={dailyTasks}
            droppableId="daily"
            type="daily"
          />
          <TaskColumn
            title={getJargonText('Weekly Priorities', 'Weekly Strategic Goals')}
            tasks={weeklyTasks}
            droppableId="weekly"
            type="weekly"
          />
        </div>
      </DragDropContext>

      {/* Task Editor Dialog */}
      <Dialog open={showAddDialog || !!editingTask} onOpenChange={() => {
        setShowAddDialog(false);
        setEditingTask(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask?.id ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          
          {editingTask && (
            <TaskEditForm
              task={editingTask}
              projects={projects}
              employees={employees}
              onSave={(taskData) => {
                if (editingTask.id) {
                  updateTask(editingTask.id, taskData);
                } else {
                  createTask(taskData);
                }
                setEditingTask(null);
                setShowAddDialog(false);
              }}
              onCancel={() => {
                setEditingTask(null);
                setShowAddDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Task Edit Form Component
const TaskEditForm: React.FC<{
  task: TaskPriority;
  projects: Project[];
  employees: any[];
  onSave: (task: Partial<TaskPriority>) => void;
  onCancel: () => void;
}> = ({ task, projects, employees, onSave, onCancel }) => {
  const [formData, setFormData] = useState(task);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              priority: value as TaskPriority['priority'] 
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              type: value as 'daily' | 'weekly' 
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              status: value as TaskPriority['status'] 
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="estimated_hours">Estimated Hours</Label>
          <Input
            id="estimated_hours"
            type="number"
            min="0"
            step="0.5"
            value={formData.estimated_hours || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              estimated_hours: parseFloat(e.target.value) || undefined 
            }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="project">Project</Label>
          <Select
            value={formData.project_id || ''}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              project_id: value || undefined 
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No project</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date ? formData.due_date.split('T')[0] : ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              due_date: e.target.value ? `${e.target.value}T23:59:59` : undefined 
            }))}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Task
        </Button>
      </div>
    </form>
  );
};

export default TaskPriorityManager;