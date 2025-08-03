import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Card } from './card';
import { Button } from './button';
import { Icon } from './icon';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Video, 
  Music,
  Archive,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

// File Upload with Drag & Drop
interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  variant?: 'default' | 'tactical';
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = '*/*',
  multiple = true,
  maxSize = 10,
  maxFiles = 5,
  variant = 'default',
  className,
  disabled = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFiles = (newFiles: File[]): string | null => {
    if (newFiles.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    for (const file of newFiles) {
      if (file.size > maxSize * 1024 * 1024) {
        return `File "${file.name}" exceeds ${maxSize}MB limit`;
      }
    }

    return null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (newFiles: File[]) => {
    const validationError = validateFiles(newFiles);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFiles(newFiles);
    onFileSelect(newFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFileSelect(updatedFiles);
  };

  const clearAll = () => {
    setFiles([]);
    setError(null);
    onFileSelect([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        variant={variant === 'tactical' ? 'tactical' : 'default'}
        className={cn(
          'relative border-2 border-dashed transition-all duration-300 cursor-pointer',
          isDragOver && !disabled && (
            variant === 'tactical' 
              ? 'border-green-400 bg-green-400/5 animate-tactical-scan' 
              : 'border-primary bg-primary/5'
          ),
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive bg-destructive/5'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-8 text-center space-y-4">
          <div className={cn(
            'mx-auto w-12 h-12 rounded-full flex items-center justify-center',
            variant === 'tactical' 
              ? 'bg-green-400/20 text-green-400' 
              : 'bg-primary/20 text-primary'
          )}>
            <Icon 
              icon={Upload} 
              size="lg"
              animation={isDragOver ? 'bounce' : 'none'}
              variant={variant === 'tactical' ? 'tactical' : 'primary'}
            />
          </div>
          
          <div>
            <h3 className={cn(
              'text-lg font-semibold',
              variant === 'tactical' && 'text-green-300'
            )}>
              {isDragOver ? 'Drop files here' : 'Upload files'}
            </h3>
            <p className={cn(
              'text-sm mt-1',
              variant === 'tactical' ? 'text-green-400/70' : 'text-muted-foreground'
            )}>
              Drag and drop files here, or click to browse
            </p>
            <p className={cn(
              'text-xs mt-2',
              variant === 'tactical' ? 'text-green-400/50' : 'text-muted-foreground'
            )}>
              Max {maxFiles} files, {maxSize}MB each
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={disabled}
        />
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <Icon icon={AlertCircle} size="sm" variant="destructive" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <Card variant={variant === 'tactical' ? 'tactical' : 'default'}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className={cn(
                'font-medium',
                variant === 'tactical' && 'text-green-300'
              )}>
                Selected Files ({files.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file);
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border animate-slide-up',
                      variant === 'tactical' 
                        ? 'border-green-400/20 bg-green-400/5' 
                        : 'border-border bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon 
                        icon={FileIcon} 
                        size="sm"
                        variant={variant === 'tactical' ? 'tactical' : 'muted'}
                      />
                      <div>
                        <p className={cn(
                          'text-sm font-medium',
                          variant === 'tactical' && 'text-green-300'
                        )}>
                          {file.name}
                        </p>
                        <p className={cn(
                          'text-xs',
                          variant === 'tactical' ? 'text-green-400/60' : 'text-muted-foreground'
                        )}>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Icon icon={X} size="xs" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Sortable List Component
interface SortableItem {
  id: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface SortableListProps {
  items: SortableItem[];
  onReorder: (newOrder: SortableItem[]) => void;
  variant?: 'default' | 'tactical';
  className?: string;
  itemClassName?: string;
}

export function SortableList({
  items,
  onReorder,
  variant = 'default',
  className,
  itemClassName
}: SortableListProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    setDragOverItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, dropItemId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === dropItemId) return;

    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const dropIndex = items.findIndex(item => item.id === dropItemId);

    if (draggedIndex === -1 || dropIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    onReorder(newItems);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <div
          key={item.id}
          draggable={!item.disabled}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, item.id)}
          className={cn(
            'p-4 rounded-lg border transition-all duration-200 cursor-move',
            draggedItem === item.id && 'opacity-50 scale-95',
            dragOverItem === item.id && 'scale-105',
            variant === 'tactical' 
              ? 'border-green-400/20 bg-green-400/5 hover:bg-green-400/10' 
              : 'border-border bg-card hover:bg-muted/50',
            item.disabled && 'opacity-50 cursor-not-allowed',
            itemClassName
          )}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

// Kanban Board Component
interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
  maxItems?: number;
}

interface KanbanItem {
  id: string;
  content: React.ReactNode;
  data?: any;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onMove: (itemId: string, fromColumn: string, toColumn: string, newIndex: number) => void;
  variant?: 'default' | 'tactical';
  className?: string;
}

export function KanbanBoard({
  columns,
  onMove,
  variant = 'default',
  className
}: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<{ itemId: string; columnId: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string, columnId: string) => {
    setDraggedItem({ itemId, columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, toColumnId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.columnId === toColumnId) {
      setDraggedItem(null);
      setDragOverColumn(null);
      return;
    }

    const toColumn = columns.find(col => col.id === toColumnId);
    if (toColumn && toColumn.maxItems && toColumn.items.length >= toColumn.maxItems) {
      setDraggedItem(null);
      setDragOverColumn(null);
      return;
    }

    onMove(draggedItem.itemId, draggedItem.columnId, toColumnId, 0);
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  return (
    <div className={cn('flex gap-6 overflow-x-auto p-4', className)}>
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn(
            'flex-shrink-0 w-80',
            variant === 'tactical' && 'text-green-400'
          )}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <Card variant={variant === 'tactical' ? 'tactical' : 'default'}>
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  'font-semibold',
                  variant === 'tactical' && 'text-green-300'
                )}>
                  {column.title}
                </h3>
                <span className={cn(
                  'text-sm px-2 py-1 rounded-full',
                  variant === 'tactical' 
                    ? 'bg-green-400/20 text-green-300' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  {column.items.length}
                  {column.maxItems && `/${column.maxItems}`}
                </span>
              </div>
            </div>
            
            <div className={cn(
              'p-4 min-h-[400px] space-y-3',
              dragOverColumn === column.id && (
                variant === 'tactical' 
                  ? 'bg-green-400/5' 
                  : 'bg-primary/5'
              )
            )}>
              {column.items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id, column.id)}
                  className={cn(
                    'p-3 rounded-lg border cursor-move transition-all duration-200 hover:shadow-md',
                    draggedItem?.itemId === item.id && 'opacity-50 scale-95',
                    variant === 'tactical' 
                      ? 'border-green-400/20 bg-slate-800 hover:bg-slate-700' 
                      : 'border-border bg-background hover:bg-muted/50'
                  )}
                >
                  {item.content}
                </div>
              ))}
              
              {column.items.length === 0 && (
                <div className={cn(
                  'flex items-center justify-center h-32 border-2 border-dashed rounded-lg',
                  variant === 'tactical' 
                    ? 'border-green-400/20 text-green-400/60' 
                    : 'border-border text-muted-foreground'
                )}>
                  Drop items here
                </div>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}