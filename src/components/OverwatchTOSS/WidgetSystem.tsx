import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { cn } from '@/lib/utils';

// Widget Categories
export enum WidgetCategory {
  SURVEILLANCE = 'surveillance',
  OPERATIONS = 'operations',
  ANALYTICS = 'analytics',
  COMMUNICATIONS = 'communications',
  SECURITY = 'security',
  RESOURCES = 'resources'
}

// Base Widget Interface
export interface BaseWidgetProps {
  id: string;
  title: string;
  category: WidgetCategory;
  size?: 'small' | 'medium' | 'large';
  content: React.ReactNode;
}

// Widget Configuration
export interface WidgetConfig extends BaseWidgetProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Widget System Component
export const OverwatchWidgetSystem: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    // Initial set of widgets across categories
    {
      id: 'surveillance-map',
      title: 'Real-time Tracking Map',
      category: WidgetCategory.SURVEILLANCE,
      size: 'large',
      x: 0, y: 0, width: 4, height: 3,
      content: <SurveillanceMapWidget />
    },
    {
      id: 'operations-tasks',
      title: 'Task Management',
      category: WidgetCategory.OPERATIONS,
      size: 'medium',
      x: 4, y: 0, width: 2, height: 2,
      content: <TaskManagementWidget />
    },
    // Add more initial widgets...
  ]);

  const [terminology, setTerminology] = useState<'military' | 'civilian'>('civilian');

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const newWidgets = Array.from(widgets);
    const [reorderedItem] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedItem);

    setWidgets(newWidgets);
  }, [widgets]);

  const toggleTerminology = () => {
    setTerminology(prev => prev === 'military' ? 'civilian' : 'military');
  };

  const addWidget = (widget: WidgetConfig) => {
    setWidgets(prev => [...prev, widget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  return (
    <div className="overwatch-widget-system">
      <div className="widget-system-controls">
        <button 
          onClick={toggleTerminology}
          className="terminology-toggle"
        >
          Switch to {terminology === 'military' ? 'Civilian' : 'Military'} Terminology
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="widget-grid" type="WIDGET">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="widget-grid"
            >
              {widgets.map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index}>
                  {(providedDrag) => (
                    <div
                      ref={providedDrag.innerRef}
                      {...providedDrag.draggableProps}
                      {...providedDrag.dragHandleProps}
                      className={cn(
                        "widget", 
                        `widget-${widget.category}`,
                        `widget-size-${widget.size}`
                      )}
                      style={{
                        gridColumn: `${widget.x + 1} / span ${widget.width}`,
                        gridRow: `${widget.y + 1} / span ${widget.height}`
                      }}
                    >
                      <div className="widget-header">
                        <h3>{widget.title}</h3>
                        <button onClick={() => removeWidget(widget.id)}>×</button>
                      </div>
                      <div className="widget-content">
                        {React.cloneElement(widget.content as React.ReactElement, { terminology })}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <WidgetLibrary 
        onAddWidget={addWidget} 
        existingWidgets={widgets} 
      />
    </div>
  );
};

// Widget Library for Adding New Widgets
const WidgetLibrary: React.FC<{
  onAddWidget: (widget: WidgetConfig) => void;
  existingWidgets: WidgetConfig[];
}> = ({ onAddWidget, existingWidgets }) => {
  const availableWidgets: BaseWidgetProps[] = [
    {
      id: 'communications-chat',
      title: 'Team Communication',
      category: WidgetCategory.COMMUNICATIONS,
      content: <CommunicationWidget />
    },
    // More available widgets...
  ];

  return (
    <div className="widget-library">
      <h3>Widget Library</h3>
      {availableWidgets
        .filter(w => !existingWidgets.some(ew => ew.id === w.id))
        .map(widget => (
          <button 
            key={widget.id}
            onClick={() => onAddWidget({
              ...widget,
              x: existingWidgets.length,
              y: 0,
              width: 2,
              height: 2
            })}
          >
            Add {widget.title}
          </button>
        ))
      }
    </div>
  );
};

// Example Widget Components
const SurveillanceMapWidget: React.FC<{ terminology?: 'military' | 'civilian' }> = ({ terminology = 'civilian' }) => {
  return (
    <div>
      {terminology === 'military' 
        ? 'TACTICAL SURVEILLANCE GRID' 
        : 'Real-time Location Tracking'}
      {/* Actual map implementation */}
    </div>
  );
};

const TaskManagementWidget: React.FC<{ terminology?: 'military' | 'civilian' }> = ({ terminology = 'civilian' }) => {
  return (
    <div>
      {terminology === 'military' 
        ? 'MISSION TASK ALLOCATION' 
        : 'Task Management'}
      {/* Task management implementation */}
    </div>
  );
};

const CommunicationWidget: React.FC = () => {
  return (
    <div>
      Team Communication Widget
      {/* Communication implementation */}
    </div>
  );
};

export default OverwatchWidgetSystem;