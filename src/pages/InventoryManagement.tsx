import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Package, Plus, Search, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

type InventoryItem = {
  id: string;
  name: string;
  sku: string | null;
  quantity: number | null;
  location: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    quantity: 0,
    location: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error('Error fetching inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .insert([newItem]);

      if (error) throw error;

      toast.success('Item added successfully');
      setAddDialogOpen(false);
      setNewItem({ name: '', sku: '', quantity: 0, location: '' });
      fetchItems();
    } catch (error: any) {
      toast.error('Error adding item: ' + error.message);
    }
  };

  const updateItem = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          name: selectedItem.name,
          sku: selectedItem.sku,
          quantity: selectedItem.quantity,
          location: selectedItem.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success('Item updated successfully');
      setEditDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (error: any) {
      toast.error('Error updating item: ' + error.message);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error: any) {
      toast.error('Error deleting item: ' + error.message);
    }
  };

  const getStockStatus = (quantity: number | null) => {
    if (quantity === null || quantity === 0) {
      return { status: 'out_of_stock', color: 'destructive', icon: AlertTriangle };
    } else if (quantity < 10) {
      return { status: 'low_stock', color: 'secondary', icon: AlertTriangle };
    } else {
      return { status: 'in_stock', color: 'default', icon: CheckCircle };
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: items.length,
    inStock: items.filter(item => (item.quantity || 0) > 10).length,
    lowStock: items.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) <= 10).length,
    outOfStock: items.filter(item => (item.quantity || 0) === 0).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">
              Track materials, equipment, and supplies
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your inventory
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Asphalt Mix, Safety Cones"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={newItem.sku}
                    onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Stock keeping unit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newItem.location}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Warehouse A, Yard 1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addItem}>
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
                  <p className="text-xs text-muted-foreground">In Stock</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Items List */}
        <div className="grid gap-4">
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item.quantity);
            const StatusIcon = stockStatus.icon;
            
            return (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className="h-4 w-4" />
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge variant={stockStatus.color as any}>
                          {stockStatus.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {item.sku && <p><strong>SKU:</strong> {item.sku}</p>}
                        <p><strong>Quantity:</strong> {item.quantity || 0}</p>
                        {item.location && <p><strong>Location:</strong> {item.location}</p>}
                        {item.updated_at && (
                          <p><strong>Last Updated:</strong> {new Date(item.updated_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>
                Update inventory item details
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Item Name</Label>
                  <Input
                    id="edit_name"
                    value={selectedItem.name}
                    onChange={(e) => setSelectedItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_sku">SKU</Label>
                  <Input
                    id="edit_sku"
                    value={selectedItem.sku || ''}
                    onChange={(e) => setSelectedItem(prev => prev ? { ...prev, sku: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_quantity">Quantity</Label>
                  <Input
                    id="edit_quantity"
                    type="number"
                    value={selectedItem.quantity || 0}
                    onChange={(e) => setSelectedItem(prev => prev ? { ...prev, quantity: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_location">Location</Label>
                  <Input
                    id="edit_location"
                    value={selectedItem.location || ''}
                    onChange={(e) => setSelectedItem(prev => prev ? { ...prev, location: e.target.value } : null)}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateItem}>
                Update Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Add your first inventory item to get started'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}