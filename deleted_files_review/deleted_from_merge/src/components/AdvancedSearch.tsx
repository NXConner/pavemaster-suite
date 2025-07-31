import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  Save,
  History,
  TrendingUp,
  MapPin,
  User,
  Tag,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  BookmarkPlus,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

interface SearchFilter {
  id: string;
  type: 'text' | 'select' | 'multiselect' | 'daterange' | 'number' | 'boolean';
  label: string;
  value: any;
  options?: Array<{ label: string; value: string; count?: number; icon?: React.ReactNode }>;
  placeholder?: string;
  min?: number;
  max?: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter[];
  timestamp: string;
  category: string;
  starred: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'project' | 'employee' | 'equipment' | 'location' | 'document';
  status: string;
  date: string;
  tags: string[];
  score: number;
  metadata: Record<string, any>;
}

interface AdvancedSearchProps {
  data: any[];
  onSearch: (query: string, filters: SearchFilter[]) => void;
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function AdvancedSearch({ 
  data, 
  onSearch, 
  onSelect, 
  placeholder = "Search projects, employees, equipment...",
  className 
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name' | 'status'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter definitions
  const [filters, setFilters] = useState<SearchFilter[]>([
    {
      id: 'type',
      type: 'multiselect',
      label: 'Type',
      value: [],
      options: [
        { label: 'Projects', value: 'project', count: 156, icon: <CheckCircle2 className="h-3 w-3" /> },
        { label: 'Employees', value: 'employee', count: 47, icon: <User className="h-3 w-3" /> },
        { label: 'Equipment', value: 'equipment', count: 89, icon: <AlertCircle className="h-3 w-3" /> },
        { label: 'Locations', value: 'location', count: 23, icon: <MapPin className="h-3 w-3" /> },
        { label: 'Documents', value: 'document', count: 234, icon: <Tag className="h-3 w-3" /> }
      ]
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      value: '',
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'On Hold', value: 'on-hold' },
        { label: 'Planning', value: 'planning' }
      ]
    },
    {
      id: 'dateRange',
      type: 'daterange',
      label: 'Date Range',
      value: { from: null, to: null }
    },
    {
      id: 'priority',
      type: 'select',
      label: 'Priority',
      value: '',
      options: [
        { label: 'All Priorities', value: '' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
      ]
    },
    {
      id: 'budget',
      type: 'number',
      label: 'Budget Range',
      value: { min: '', max: '' },
      min: 0,
      max: 1000000
    },
    {
      id: 'tags',
      type: 'multiselect',
      label: 'Tags',
      value: [],
      options: [
        { label: 'Urgent', value: 'urgent', icon: <AlertCircle className="h-3 w-3 text-red-500" /> },
        { label: 'Commercial', value: 'commercial', icon: <Tag className="h-3 w-3 text-blue-500" /> },
        { label: 'Residential', value: 'residential', icon: <Tag className="h-3 w-3 text-green-500" /> },
        { label: 'Maintenance', value: 'maintenance', icon: <Tag className="h-3 w-3 text-yellow-500" /> },
        { label: 'New Construction', value: 'new-construction', icon: <Tag className="h-3 w-3 text-purple-500" /> }
      ]
    }
  ]);

  // Mock search results
  const mockResults: SearchResult[] = useMemo(() => [
    {
      id: '1',
      title: 'Highway 101 Resurfacing',
      subtitle: 'Major highway resurfacing project',
      type: 'project',
      status: 'active',
      date: '2024-01-15',
      tags: ['urgent', 'commercial'],
      score: 0.95,
      metadata: { budget: 850000, completion: 75 }
    },
    {
      id: '2',
      title: 'John Smith',
      subtitle: 'Senior Equipment Operator',
      type: 'employee',
      status: 'active',
      date: '2024-01-10',
      tags: ['certified', 'experienced'],
      score: 0.88,
      metadata: { department: 'Operations', experience: 8 }
    },
    {
      id: '3',
      title: 'CAT Paver AP655F',
      subtitle: 'Heavy-duty asphalt paver',
      type: 'equipment',
      status: 'operational',
      date: '2024-01-12',
      tags: ['maintenance-due'],
      score: 0.82,
      metadata: { utilization: 87, nextMaintenance: '2024-02-01' }
    }
  ], []);

  // Search suggestions
  const searchSuggestions = useMemo(() => [
    'Highway 101 Resurfacing',
    'Shopping Center Parking',
    'School District Repairs',
    'Equipment maintenance',
    'Safety incidents',
    'Budget reports',
    'Team productivity',
    'Commercial projects'
  ], []);

  useEffect(() => {
    // Load saved searches and search history from localStorage
    const saved = localStorage.getItem('pavemaster_saved_searches');
    const history = localStorage.getItem('pavemaster_search_history');
    
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    // Generate suggestions based on query
    if (query.length > 1) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, searchSuggestions]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('pavemaster_search_history', JSON.stringify(newHistory));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onSearch(searchQuery, filters);
    setIsLoading(false);
    setSuggestions([]);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    const updatedFilters = filters.map(filter =>
      filter.id === filterId ? { ...filter, value } : filter
    );
    setFilters(updatedFilters);
    
    // Auto-search when filters change
    if (query.trim()) {
      onSearch(query, updatedFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = filters.map(filter => ({
      ...filter,
      value: filter.type === 'multiselect' ? [] : 
             filter.type === 'daterange' ? { from: null, to: null } :
             filter.type === 'number' ? { min: '', max: '' } : ''
    }));
    setFilters(clearedFilters);
  };

  const saveCurrentSearch = () => {
    const searchName = prompt('Enter a name for this saved search:');
    if (!searchName) return;

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      query,
      filters: [...filters],
      timestamp: new Date().toISOString(),
      category: 'user',
      starred: false
    };

    const updated = [...savedSearches, newSavedSearch];
    setSavedSearches(updated);
    localStorage.setItem('pavemaster_saved_searches', JSON.stringify(updated));
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    handleSearch(savedSearch.query);
  };

  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('pavemaster_saved_searches', JSON.stringify(updated));
  };

  const getActiveFilterCount = () => {
    return filters.filter(filter => {
      if (filter.type === 'multiselect') return filter.value.length > 0;
      if (filter.type === 'daterange') return filter.value.from || filter.value.to;
      if (filter.type === 'number') return filter.value.min || filter.value.max;
      return filter.value !== '' && filter.value !== null;
    }).length;
  };

  const quickDateFilters = [
    { label: 'Today', value: () => ({ from: new Date(), to: new Date() }) },
    { label: 'Last 7 days', value: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: 'Last 30 days', value: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: 'Last 3 months', value: () => ({ from: subMonths(new Date(), 3), to: new Date() }) }
  ];

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Advanced Search
            </CardTitle>
            <div className="flex items-center space-x-2">
              {query && (
                <Button variant="outline" size="sm" onClick={saveCurrentSearch}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Search
                </Button>
              )}
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Search Filters</h4>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-96 p-4">
                    <div className="space-y-4">
                      {filters.map(filter => (
                        <div key={filter.id} className="space-y-2">
                          <Label className="text-sm font-medium">{filter.label}</Label>
                          
                          {filter.type === 'select' && (
                            <Select 
                              value={filter.value} 
                              onValueChange={(value) => handleFilterChange(filter.id, value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {filter.options?.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center space-x-2">
                                      {option.icon}
                                      <span>{option.label}</span>
                                      {option.count && (
                                        <Badge variant="secondary" className="ml-auto text-xs">
                                          {option.count}
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {filter.type === 'multiselect' && (
                            <div className="space-y-2">
                              {filter.options?.map(option => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${filter.id}-${option.value}`}
                                    checked={filter.value.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...filter.value, option.value]
                                        : filter.value.filter((v: string) => v !== option.value);
                                      handleFilterChange(filter.id, newValue);
                                    }}
                                  />
                                  <Label 
                                    htmlFor={`${filter.id}-${option.value}`}
                                    className="flex items-center space-x-2 cursor-pointer"
                                  >
                                    {option.icon}
                                    <span>{option.label}</span>
                                    {option.count && (
                                      <Badge variant="secondary" className="text-xs">
                                        {option.count}
                                      </Badge>
                                    )}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}

                          {filter.type === 'daterange' && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {quickDateFilters.map(quick => (
                                  <Button
                                    key={quick.label}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6"
                                    onClick={() => handleFilterChange(filter.id, quick.value())}
                                  >
                                    {quick.label}
                                  </Button>
                                ))}
                              </div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filter.value.from ? (
                                      filter.value.to ? (
                                        <>
                                          {format(filter.value.from, "LLL dd, y")} -{" "}
                                          {format(filter.value.to, "LLL dd, y")}
                                        </>
                                      ) : (
                                        format(filter.value.from, "LLL dd, y")
                                      )
                                    ) : (
                                      <span>Pick a date range</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={filter.value.from}
                                    selected={filter.value}
                                    onSelect={(value) => handleFilterChange(filter.id, value)}
                                    numberOfMonths={2}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}

                          {filter.type === 'number' && (
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                placeholder="Min"
                                value={filter.value.min}
                                onChange={(e) => handleFilterChange(filter.id, { ...filter.value, min: e.target.value })}
                                className="h-8"
                              />
                              <Input
                                type="number"
                                placeholder="Max"
                                value={filter.value.max}
                                onChange={(e) => handleFilterChange(filter.id, { ...filter.value, max: e.target.value })}
                                className="h-8"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={placeholder}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-md">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {getActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => {
                if (filter.type === 'multiselect' && filter.value.length > 0) {
                  return filter.value.map((value: string) => {
                    const option = filter.options?.find(opt => opt.value === value);
                    return (
                      <Badge key={`${filter.id}-${value}`} variant="secondary" className="text-xs">
                        {option?.label || value}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-3 w-3 p-0 ml-1"
                          onClick={() => {
                            const newValue = filter.value.filter((v: string) => v !== value);
                            handleFilterChange(filter.id, newValue);
                          }}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    );
                  });
                }
                
                if (filter.value && filter.value !== '' && filter.type !== 'multiselect') {
                  let displayValue = filter.value;
                  if (filter.type === 'daterange' && (filter.value.from || filter.value.to)) {
                    displayValue = filter.value.from && filter.value.to 
                      ? `${format(filter.value.from, "MMM dd")} - ${format(filter.value.to, "MMM dd")}`
                      : filter.value.from 
                        ? `From ${format(filter.value.from, "MMM dd")}`
                        : `Until ${format(filter.value.to, "MMM dd")}`;
                  }
                  
                  return (
                    <Badge key={filter.id} variant="secondary" className="text-xs">
                      {filter.label}: {displayValue}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-3 w-3 p-0 ml-1"
                        onClick={() => {
                          const clearValue = filter.type === 'daterange' ? { from: null, to: null } :
                                           filter.type === 'number' ? { min: '', max: '' } : '';
                          handleFilterChange(filter.id, clearValue);
                        }}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Saved Searches</Label>
              <div className="flex flex-wrap gap-2">
                {savedSearches.slice(0, 5).map(saved => (
                  <Button
                    key={saved.id}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => loadSavedSearch(saved)}
                  >
                    <BookmarkPlus className="h-3 w-3 mr-1" />
                    {saved.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recent Searches</Label>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((historyItem, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setQuery(historyItem);
                      handleSearch(historyItem);
                    }}
                  >
                    <History className="h-3 w-3 mr-1" />
                    {historyItem}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button onClick={() => handleSearch()} disabled={!query.trim() || isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Press Enter to search
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedSearch;