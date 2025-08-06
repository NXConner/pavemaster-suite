import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card } from './card';
import { Icon } from './icon';
import { LoadingCard } from './loading';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown
} from 'lucide-react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  actions?: {
    view?: (row: T) => void;
    edit?: (row: T) => void;
    delete?: (row: T) => void;
    custom?: Array<{
      label: string;
      icon?: React.ComponentType;
      action: (row: T) => void;
      variant?: 'default' | 'destructive';
    }>;
  };
  onRowClick?: (row: T) => void;
  className?: string;
  variant?: 'default' | 'tactical';
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  filterable = true,
  pagination = true,
  pageSize = 10,
  selectable = false,
  actions,
  onRowClick,
  className,
  variant = 'default',
  emptyStateMessage = 'No data available',
  emptyStateAction
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = columns.find(col => col.id === columnId);
        if (column) {
          filtered = filtered.filter((row) =>
            String(row[column.accessorKey])
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          );
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

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
  };

  if (loading) {
    return <LoadingCard variant={variant} />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
                variant={variant === 'tactical' ? 'tactical' : 'default'}
              />
            </div>
          )}
          
          {filterable && (
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="h-4 w-4" />}
            >
              Filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
            Export
          </Button>
          
          {selectedRows.size > 0 && (
            <span className={cn(
              'text-sm',
              variant === 'tactical' ? 'text-green-400' : 'text-muted-foreground'
            )}>
              {selectedRows.size} selected
            </span>
          )}
        </div>
      </div>

      {/* Column Filters */}
      {showFilters && filterable && (
        <Card variant={variant === 'tactical' ? 'tactical' : 'default'} size="sm">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {columns
              .filter(col => col.filterable !== false)
              .map((column) => (
                <div key={column.id}>
                  <label className={cn(
                    'text-sm font-medium',
                    variant === 'tactical' ? 'text-green-400' : 'text-foreground'
                  )}>
                    {column.header}
                  </label>
                  <Input
                    placeholder={`Filter ${column.header.toLowerCase()}...`}
                    value={columnFilters[column.id] || ''}
                    onChange={(e) =>
                      setColumnFilters(prev => ({
                        ...prev,
                        [column.id]: e.target.value
                      }))
                    }
                    size="sm"
                    variant={variant === 'tactical' ? 'tactical' : 'default'}
                  />
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card variant={variant === 'tactical' ? 'tactical' : 'default'} size="sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={cn(
                'border-b',
                variant === 'tactical' ? 'border-green-400/20' : 'border'
              )}>
                {selectable && (
                  <th className="w-12 p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      'p-3 text-left font-medium',
                      column.width,
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      variant === 'tactical' ? 'text-green-300' : 'text-foreground'
                    )}
                  >
                    {column.sortable !== false ? (
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
                      column.header
                    )}
                  </th>
                ))}
                {actions && <th className="w-20 p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                    className="p-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <p className={cn(
                        'text-muted-foreground',
                        variant === 'tactical' && 'text-green-400/60'
                      )}>
                        {emptyStateMessage}
                      </p>
                      {emptyStateAction}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      'border-b transition-colors hover:bg-muted/50',
                      variant === 'tactical' && 'border-green-400/10 hover:bg-green-400/5',
                      onRowClick && 'cursor-pointer',
                      selectedRows.has(index) && (
                        variant === 'tactical' 
                          ? 'bg-green-400/10' 
                          : 'bg-muted'
                      )
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelect(index, e.target.checked);
                          }}
                          className="rounded"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          'p-3',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          variant === 'tactical' ? 'text-green-400/90' : 'text-foreground'
                        )}
                      >
                        {column.cell
                          ? column.cell(row[column.accessorKey], row)
                          : String(row[column.accessorKey])}
                      </td>
                    ))}
                    {actions && (
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {actions.view && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                actions.view!(row);
                              }}
                            >
                              <Icon icon={Eye} size="xs" />
                            </Button>
                          )}
                          {actions.edit && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                actions.edit!(row);
                              }}
                            >
                              <Icon icon={Edit} size="xs" />
                            </Button>
                          )}
                          {actions.delete && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                actions.delete!(row);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Icon icon={Trash2} size="xs" />
                            </Button>
                          )}
                          {actions.custom?.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                action.action(row);
                              }}
                              className={action.variant === 'destructive' ? 'text-destructive hover:text-destructive' : ''}
                            >
                              {action.icon && <Icon icon={action.icon} size="xs" />}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className={cn(
            'text-sm',
            variant === 'tactical' ? 'text-green-400/70' : 'text-muted-foreground'
          )}>
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <Icon icon={ChevronsLeft} size="sm" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Icon icon={ChevronLeft} size="sm" />
            </Button>
            
            <span className={cn(
              'px-3 py-1 text-sm',
              variant === 'tactical' ? 'text-green-300' : 'text-foreground'
            )}>
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Icon icon={ChevronRight} size="sm" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <Icon icon={ChevronsRight} size="sm" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}