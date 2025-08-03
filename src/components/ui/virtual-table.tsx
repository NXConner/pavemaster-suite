import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Card } from './card';
import { Input } from './input';
import { Button } from './button';
import { Icon } from './icon';
import { Loading } from './loading';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  Download,
  MoreHorizontal
} from 'lucide-react';

export interface VirtualColumnDef<T> {
  id: string;
  header: string;
  accessorKey: keyof T;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  cell?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right';
  sticky?: 'left' | 'right';
  resizable?: boolean;
}

export interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualColumnDef<T>[];
  height?: number;
  rowHeight?: number;
  overscan?: number;
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  className?: string;
  variant?: 'default' | 'tactical';
  onRowClick?: (row: T, index: number) => void;
  onRowsSelect?: (selectedRows: T[]) => void;
  renderActions?: (row: T, index: number) => React.ReactNode;
  estimatedRowHeight?: number;
  bufferSize?: number;
  enableVirtualization?: boolean;
}

interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

// Virtual scrolling hook
function useVirtualizer({
  count,
  getItemSize,
  containerHeight,
  overscan = 5,
  scrollTop,
}: {
  count: number;
  getItemSize: (index: number) => number;
  containerHeight: number;
  overscan?: number;
  scrollTop: number;
}) {
  return useMemo(() => {
    if (count === 0) return { virtualItems: [], totalSize: 0 };

    const items: VirtualItem[] = [];
    let totalSize = 0;

    // Calculate total size and item positions
    for (let i = 0; i < count; i++) {
      const size = getItemSize(i);
      const start = totalSize;
      const end = start + size;
      
      items.push({
        index: i,
        start,
        size,
        end,
      });
      
      totalSize += size;
    }

    // Find visible range
    const visibleStart = Math.max(0, scrollTop);
    const visibleEnd = scrollTop + containerHeight;

    // Find first and last visible items
    let startIndex = 0;
    let endIndex = count - 1;

    for (let i = 0; i < items.length; i++) {
      if (items[i].end > visibleStart) {
        startIndex = i;
        break;
      }
    }

    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].start < visibleEnd) {
        endIndex = i;
        break;
      }
    }

    // Apply overscan
    const rangeStart = Math.max(0, startIndex - overscan);
    const rangeEnd = Math.min(count - 1, endIndex + overscan);

    const virtualItems = items.slice(rangeStart, rangeEnd + 1);

    return {
      virtualItems,
      totalSize,
      startIndex: rangeStart,
      endIndex: rangeEnd,
    };
  }, [count, getItemSize, containerHeight, overscan, scrollTop]);
}

export function VirtualTable<T extends Record<string, any>>({
  data,
  columns,
  height = 600,
  rowHeight = 52,
  overscan = 10,
  loading = false,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  className,
  variant = 'default',
  onRowClick,
  onRowsSelect,
  renderActions,
  estimatedRowHeight,
  bufferSize = 50,
  enableVirtualization = true,
}: VirtualTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [scrollTop, setScrollTop] = useState(0);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Initialize column widths
  useEffect(() => {
    const initialWidths: Record<string, number> = {};
    columns.forEach(col => {
      initialWidths[col.id] = col.width;
    });
    setColumnWidths(initialWidths);
  }, [columns]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        columns.some(col => {
          const value = item[col.accessorKey];
          return String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = columns.find(col => col.id === columnId);
        if (column) {
          const filterLower = filterValue.toLowerCase();
          filtered = filtered.filter(item => {
            const value = item[column.accessorKey];
            return String(value).toLowerCase().includes(filterLower);
          });
        }
      }
    });

    return filtered;
  }, [data, searchTerm, columnFilters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];

      if (aVal === bVal) return 0;

      const isAsc = sortConfig.direction === 'asc';
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return isAsc ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (aStr < bStr) return isAsc ? -1 : 1;
      if (aStr > bStr) return isAsc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Virtual scrolling calculations
  const getItemSize = useCallback((index: number) => {
    return estimatedRowHeight || rowHeight;
  }, [estimatedRowHeight, rowHeight]);

  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getItemSize,
    containerHeight: height - 120, // Account for header and controls
    overscan,
    scrollTop,
  });

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    
    // Sync header scroll
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  // Handle sort
  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback((index: number, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      
      if (onRowsSelect) {
        const selectedData = Array.from(newSet).map(i => sortedData[i]);
        onRowsSelect(selectedData);
      }
      
      return newSet;
    });
  }, [sortedData, onRowsSelect]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIndices = new Set(sortedData.map((_, index) => index));
      setSelectedRows(allIndices);
      if (onRowsSelect) {
        onRowsSelect(sortedData);
      }
    } else {
      setSelectedRows(new Set());
      if (onRowsSelect) {
        onRowsSelect([]);
      }
    }
  }, [sortedData, onRowsSelect]);

  // Column resize handler
  const handleColumnResize = useCallback((columnId: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [columnId]: width }));
  }, []);

  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + (columnWidths[col.id] || col.width), 0);
  }, [columns, columnWidths]);

  if (loading) {
    return <Loading type="skeleton" className="h-96" />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {searchable && (
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="w-80"
              variant={variant === 'tactical' ? 'tactical' : 'default'}
            />
          )}
          
          {filterable && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="h-4 w-4" />}
            >
              Filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export ({sortedData.length.toLocaleString()})
          </Button>
          
          {selectedRows.size > 0 && (
            <span className={cn(
              'text-sm px-3 py-1 rounded-md',
              variant === 'tactical' 
                ? 'bg-green-400/20 text-green-300' 
                : 'bg-primary/10 text-primary'
            )}>
              {selectedRows.size.toLocaleString()} selected
            </span>
          )}
        </div>
      </div>

      {/* Virtual Table */}
      <Card 
        variant={variant === 'tactical' ? 'tactical' : 'elevated'} 
        className="overflow-hidden"
      >
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            'sticky top-0 z-10 overflow-hidden border-b',
            variant === 'tactical' 
              ? 'bg-slate-900/95 border-green-400/20' 
              : 'bg-background/95 border-border'
          )}
          style={{ width: totalWidth }}
        >
          <div className="flex" style={{ width: totalWidth }}>
            {selectable && (
              <div className="flex items-center justify-center w-12 p-3 border-r border-border">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
              </div>
            )}
            
            {columns.map((column) => (
              <div
                key={column.id}
                className={cn(
                  'flex items-center p-3 border-r border-border last:border-r-0',
                  column.align === 'center' && 'justify-center',
                  column.align === 'right' && 'justify-end',
                  variant === 'tactical' ? 'text-green-300' : 'text-foreground'
                )}
                style={{ 
                  width: columnWidths[column.id] || column.width,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                }}
              >
                {sortable && column.sortable !== false ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(column.accessorKey)}
                    className={cn(
                      'h-auto p-0 font-medium hover:bg-transparent',
                      variant === 'tactical' && 'text-green-300 hover:text-green-200'
                    )}
                    rightIcon={
                      sortConfig.key === column.accessorKey ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )
                    }
                  >
                    {column.header}
                  </Button>
                ) : (
                  <span className="font-medium">{column.header}</span>
                )}
              </div>
            ))}
            
            {renderActions && (
              <div className="flex items-center justify-center w-20 p-3">
                <span className="font-medium">Actions</span>
              </div>
            )}
          </div>
        </div>

        {/* Virtual Table Body */}
        <div
          ref={scrollElementRef}
          className="relative overflow-auto"
          style={{ height: height - 120 }}
          onScroll={handleScroll}
        >
          <div style={{ height: virtualizer.totalSize, width: totalWidth }}>
            {virtualizer.virtualItems.map((virtualItem) => {
              const item = sortedData[virtualItem.index];
              const isSelected = selectedRows.has(virtualItem.index);
              
              return (
                <div
                  key={virtualItem.index}
                  className={cn(
                    'absolute left-0 flex border-b transition-colors hover:bg-muted/50',
                    variant === 'tactical' && 'border-green-400/10 hover:bg-green-400/5',
                    onRowClick && 'cursor-pointer',
                    isSelected && (
                      variant === 'tactical' 
                        ? 'bg-green-400/10' 
                        : 'bg-muted'
                    )
                  )}
                  style={{
                    top: virtualItem.start,
                    height: virtualItem.size,
                    width: totalWidth,
                  }}
                  onClick={() => onRowClick?.(item, virtualItem.index)}
                >
                  {selectable && (
                    <div className="flex items-center justify-center w-12 p-3 border-r border-border">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(virtualItem.index, e.target.checked);
                        }}
                        className="rounded"
                      />
                    </div>
                  )}
                  
                  {columns.map((column) => (
                    <div
                      key={column.id}
                      className={cn(
                        'flex items-center p-3 border-r border-border last:border-r-0 overflow-hidden',
                        column.align === 'center' && 'justify-center',
                        column.align === 'right' && 'justify-end',
                        variant === 'tactical' ? 'text-green-400/90' : 'text-foreground'
                      )}
                      style={{ 
                        width: columnWidths[column.id] || column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                    >
                      <div className="truncate">
                        {column.cell
                          ? column.cell(item[column.accessorKey], item, virtualItem.index)
                          : String(item[column.accessorKey] || '')}
                      </div>
                    </div>
                  ))}
                  
                  {renderActions && (
                    <div className="flex items-center justify-center w-20 p-3">
                      {renderActions(item, virtualItem.index)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with stats */}
        <div className={cn(
          'flex items-center justify-between p-3 border-t text-sm',
          variant === 'tactical' 
            ? 'border-green-400/20 text-green-400/70' 
            : 'border-border text-muted-foreground'
        )}>
          <div>
            Showing {virtualizer.virtualItems.length} of {sortedData.length.toLocaleString()} records
            {data.length !== sortedData.length && (
              <span> (filtered from {data.length.toLocaleString()})</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span>
              Performance: {virtualizer.virtualItems.length} rendered
            </span>
            {enableVirtualization && (
              <Icon
                icon={variant === 'tactical' ? MoreHorizontal : MoreHorizontal}
                size="sm"
                variant={variant === 'tactical' ? 'tactical' : 'muted'}
                className="animate-pulse"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Export additional utilities
export { useVirtualizer };

// Demo data generator for testing
export function generateLargeDataset(count: number = 100000): any[] {
  const statuses = ['Active', 'Pending', 'Completed', 'Cancelled'];
  const companies = ['ABC Construction', 'XYZ Builders', 'Quality Paving', 'Elite Roads'];
  const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `PROJ-${String(index + 1).padStart(6, '0')}`,
    name: `Project ${index + 1}`,
    company: companies[index % companies.length],
    location: locations[index % locations.length],
    status: statuses[index % statuses.length],
    budget: Math.floor(Math.random() * 1000000) + 50000,
    progress: Math.floor(Math.random() * 100),
    startDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
    manager: `Manager ${Math.floor(Math.random() * 100) + 1}`,
    priority: Math.floor(Math.random() * 5) + 1,
    risk: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
    type: Math.random() > 0.5 ? 'Paving' : 'Construction',
    duration: Math.floor(Math.random() * 365) + 30,
  }));
}