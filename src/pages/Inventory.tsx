import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layouts/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Package, AlertTriangle, TrendingUp, Filter, Truck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  category: 'asphalt' | 'sealcoat' | 'equipment' | 'tools' | 'supplies';
  sku: string;
  quantity: number;
  unit: string;
  unitCost: number;
  supplier: string;
  lastOrderDate: string;
  reorderLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';
}

const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Hot Mix Asphalt',
        category: 'asphalt',
        sku: 'HMA-001',
        quantity: 150,
        unit: 'tons',
        unitCost: 45.00,
        supplier: 'Richmond Asphalt Co.',
        lastOrderDate: '2024-01-15',
        reorderLevel: 50,
        status: 'in_stock'
      },
      {
        id: '2',
        name: 'SealMaster Concentrate',
        category: 'sealcoat',
        sku: 'SM-CONC-001',
        quantity: 25,
        unit: 'gallons',
        unitCost: 12.50,
        supplier: 'SealMaster Products',
        lastOrderDate: '2024-01-10',
        reorderLevel: 30,
        status: 'low_stock'
      },
      {
        id: '3',
        name: 'Crack Sealer - Hot Pour',
        category: 'supplies',
        sku: 'CS-HP-001',
        quantity: 0,
        unit: 'buckets',
        unitCost: 28.00,
        supplier: 'Pavement Technologies',
        lastOrderDate: '2023-12-20',
        reorderLevel: 10,
        status: 'out_of_stock'
      },
      {
        id: '4',
        name: 'Asphalt Paver - CAT AP555F',
        category: 'equipment',
        sku: 'EQ-PAV-001',
        quantity: 1,
        unit: 'unit',
        unitCost: 185000.00,
        supplier: 'Caterpillar',
        lastOrderDate: '2023-06-15',
        reorderLevel: 1,
        status: 'in_stock'
      },
      {
        id: '5',
        name: 'Traffic Paint - Yellow',
        category: 'supplies',
        sku: 'TP-YEL-001',
        quantity: 45,
        unit: 'gallons',
        unitCost: 18.75,
        supplier: 'Road Paint Solutions',
        lastOrderDate: '2024-01-08',
        reorderLevel: 20,
        status: 'on_order'
      }
    ];
    setInventory(mockInventory);
  }, []);

  const getCategoryColor = (category: InventoryItem['category']) => {
    switch (category) {
      case 'asphalt': return 'bg-gray-100 text-gray-800';
      case 'sealcoat': return 'bg-blue-100 text-blue-800';
      case 'equipment': return 'bg-green-100 text-green-800';
      case 'tools': return 'bg-purple-100 text-purple-800';
      case 'supplies': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'on_order': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length;
  const totalItems = inventory.length;

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && item.category === activeTab;
  });

  const handleCreateItem = () => {
    toast({
      title: "Add Inventory Item",
      description: "Item creation form will open here.",
    });
  };

  const handleReorder = (item: InventoryItem) => {
    toast({
      title: "Reorder Item",
      description: `Reordering ${item.name} from ${item.supplier}`,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Inventory Management</h1>
                <p className="text-muted-foreground">Track materials, equipment, and supplies</p>
              </div>
            </div>
            <Button onClick={handleCreateItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  Across all categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Current inventory value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  Items need reordering
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipment Value</CardTitle>
                <Truck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    inventory.filter(item => item.category === 'equipment')
                      .reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Equipment assets
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name, SKU, or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="asphalt">Asphalt</TabsTrigger>
              <TabsTrigger value="sealcoat">Sealcoat</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="supplies">Supplies</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>
                    Manage your pavement materials and equipment inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(item.category)}>
                              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.quantity} {item.unit}
                            {item.quantity <= item.reorderLevel && (
                              <AlertTriangle className="inline-block ml-1 h-3 w-3 text-orange-500" />
                            )}
                          </TableCell>
                          <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                          <TableCell>{formatCurrency(item.quantity * item.unitCost)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              {(item.status === 'low_stock' || item.status === 'out_of_stock') && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleReorder(item)}
                                >
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default InventoryPage;