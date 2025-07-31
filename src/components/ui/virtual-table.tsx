/**
 * Virtual Table Component - High Performance Data Tables
 * Implements virtual scrolling for 10,000+ rows without performance degradation
 */

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { performanceMonitor } from '@/lib/performance';

interface VirtualTableColumn<T> {
  id: keyof T;
  header: string;
  width: number;
  sortable?: boolean;
  filterable?: boolean;
  renderer?: (value: any, row: T) => React.ReactNode;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  height?: number;
  itemHeight?: number;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
}

interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

function VirtualTable<T extends Record<string, any>>({
  data,
  columns,
  height = 400,
  itemHeight = 50,
  className = '',
  onRowClick
}: VirtualTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const listRef = useRef<List>(null);

  // Performance tracking
  useEffect(() => {
    const startTime = performance.now();
    performanceMonitor.recordMetric('virtual_table_render', performance.now() - startTime, 'ms', {
      dataLength: data.length,
      columnsCount: columns.length
    });
  }, [data.length, columns.length]);

  // Filter data
  useEffect(() => {
    const startTime = performance.now();
    
    let filtered = data;
    
    if (filter) {
      filtered = data.filter(item =>
        columns.some(column => {
          const value = item[column.id];
          return String(value).toLowerCase().includes(filter.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(filtered);
    
    performanceMonitor.recordMetric('virtual_table_filter_sort', performance.now() - startTime, 'ms', {
      originalLength: data.length,
      filteredLength: filtered.length,
      hasFilter: !!filter,
      hasSorting: !!sortConfig
    });
  }, [data, filter, sortConfig, columns]);

  const handleSort = useCallback((columnId: keyof T) => {
    setSortConfig(current => {
      if (current?.key === columnId) {
        return current.direction === 'asc' 
          ? { key: columnId, direction: 'desc' }
          : null;
      }
      return { key: columnId, direction: 'asc' };
    });
  }, []);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = filteredData[index];
    
    return (
      <div
        style={style}
        className={`flex border-b hover:bg-muted/50 cursor-pointer ${
          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
        }`}
        onClick={() => onRowClick?.(row, index)}
      >
        {columns.map((column) => (
          <div
            key={String(column.id)}
            className="px-4 py-3 flex items-center"
            style={{ width: column.width, minWidth: column.width }}
          >
            {column.renderer 
              ? column.renderer(row[column.id], row)
              : String(row[column.id] || '')
            }
          </div>
        ))}
      </div>
    );
  }, [filteredData, columns, onRowClick]);

  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + col.width, 0), 
    [columns]
  );

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Filter Controls */}
      <div className="p-4 border-b bg-muted/10">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all columns..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredData.length.toLocaleString()} of {data.length.toLocaleString()} rows
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="border-b bg-muted/5">
        <div className="flex" style={{ width: totalWidth }}>
          {columns.map((column) => (
            <div
              key={String(column.id)}
              className="px-4 py-3 font-medium text-left cursor-pointer hover:bg-muted/20 flex items-center gap-2"
              style={{ width: column.width, minWidth: column.width }}
              onClick={() => column.sortable && handleSort(column.id)}
            >
              <span>{column.header}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  <ChevronUp 
                    className={`h-3 w-3 ${
                      sortConfig?.key === column.id && sortConfig.direction === 'asc'
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                  <ChevronDown 
                    className={`h-3 w-3 ${
                      sortConfig?.key === column.id && sortConfig.direction === 'desc'
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Scrollable Content */}
      <div style={{ height }}>
        {filteredData.length > 0 ? (
          <List
            ref={listRef}
            height={height}
            itemCount={filteredData.length}
            itemSize={itemHeight}
            width={totalWidth}
          >
            {Row}
          </List>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data found
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="px-4 py-2 border-t bg-muted/5 text-xs text-muted-foreground">
        Virtual scrolling enabled • {filteredData.length.toLocaleString()} rows • 
        {columns.length} columns • Optimized for 10,000+ records
      </div>
    </div>
  );
}

export { VirtualTable, type VirtualTableColumn, type VirtualTableProps };