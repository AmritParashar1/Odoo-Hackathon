import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Box, Wrench, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export const Dashboard = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/dashboard');
      return res.data.data;
    },
  });

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground animate-pulse">Loading metrics...</div>;
  }

  const activeAllocations = metrics?.statusBreakdown?.find((s: any) => s.status === 'ALLOCATED')?.count || 0;
  const underMaintenance = metrics?.statusBreakdown?.find((s: any) => s.status === 'UNDER_MAINTENANCE')?.count || 0;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Organization Overview
        </h2>
        <p className="text-muted-foreground mt-1">Real-time metrics across all departments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Assets</h3>
            <Box className="w-5 h-5 text-primary" />
          </div>
          <p className="text-4xl font-bold mt-4">{metrics?.totalAssets || 0}</p>
          <p className="text-sm text-muted-foreground mt-2">Valued at ${metrics?.totalValue || 0}</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Active Allocations</h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-4xl font-bold mt-4">{activeAllocations}</p>
          <p className="text-sm text-emerald-500/80 mt-2 font-medium">Currently in use</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Active Maintenance</h3>
            <Wrench className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-4xl font-bold mt-4">{metrics?.activeMaintenanceCount || 0}</p>
          <p className="text-sm text-orange-500/80 mt-2 font-medium">Requests pending</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden group hover:border-destructive/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-destructive/10 rounded-full blur-2xl group-hover:bg-destructive/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Under Repair</h3>
            <ArrowLeftRight className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-4xl font-bold mt-4">{underMaintenance}</p>
          <p className="text-sm text-destructive/80 mt-2 font-medium">Assets unavailable</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-panel">
          <h3 className="text-lg font-semibold mb-4">Asset Conditions</h3>
          <div className="space-y-4">
            {metrics?.conditionBreakdown?.map((c: any) => (
              <div key={c.condition} className="flex items-center justify-between">
                <span className="text-sm capitalize">{c.condition.toLowerCase()}</span>
                <span className="font-medium bg-secondary px-3 py-1 rounded-full text-xs">{c.count} assets</span>
              </div>
            ))}
            {!metrics?.conditionBreakdown?.length && <p className="text-muted-foreground text-sm">No data available.</p>}
          </div>
        </div>
        
        <div className="p-6 rounded-2xl glass-panel flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Box className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold">Ready to get started?</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">
            Navigate to the Assets page to begin registering new inventory, or check Transfers for pending requests.
          </p>
        </div>
      </div>
    </div>
  );
};
