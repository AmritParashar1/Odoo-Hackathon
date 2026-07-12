import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Box, Plus, Search } from 'lucide-react';
import { AssetRegistrationModal } from './AssetRegistrationModal';
import { AssetDetailsModal } from './AssetDetailsModal';

export const AssetsList = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['assets', debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get(`/assets?limit=50${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`);
      return res.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'ALLOCATED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'UNDER_MAINTENANCE': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'LOST': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asset Directory</h2>
          <p className="text-muted-foreground mt-1">Manage and track all organizational resources.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20"
          onClick={() => setIsRegisterOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Asset
        </Button>
      </div>

      <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden border border-border/50">
        <div className="p-4 border-b border-border/50 flex items-center gap-4 bg-background/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, tag, or serial..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading assets...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Asset</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Tag ID</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Category</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Condition</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {response?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Box className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p>No assets found in the system.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  response?.data?.map((asset: any) => (
                    <tr 
                      key={asset.id} 
                      className="hover:bg-secondary/20 transition-colors group cursor-pointer"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{asset.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{asset.serialNumber || 'No serial'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono">{asset.assetTag}</code>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {asset.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={getStatusColor(asset.status)}>
                          {asset.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground capitalize">
                        {asset.condition.toLowerCase()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAsset(asset);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AssetRegistrationModal 
        open={isRegisterOpen} 
        onOpenChange={setIsRegisterOpen} 
      />
      
      <AssetDetailsModal 
        open={!!selectedAsset} 
        onOpenChange={(open) => !open && setSelectedAsset(null)} 
        asset={selectedAsset} 
      />
    </div>
  );
};
