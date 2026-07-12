import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { BarChart3, Activity, PieChart, TrendingUp } from 'lucide-react';

export const ReportsDashboard = () => {
  const { data: dashboardData, isLoading: isLoadingDash } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/dashboard');
      return res.data;
    },
  });

  const { data: lifecycleData, isLoading: isLoadingLife } = useQuery({
    queryKey: ['reports', 'lifecycle'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/lifecycle');
      return res.data;
    },
  });

  const isLoading = isLoadingDash || isLoadingLife;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground flex flex-col items-center">
          <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
          <p>Generating Analytics...</p>
        </div>
      </div>
    );
  }

  const dash = dashboardData?.data || {};
  const life = lifecycleData?.data || {};

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
          <p className="text-muted-foreground mt-1">High-level insights into your asset inventory and lifecycle.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Cards */}
        <div className="glass-panel p-6 rounded-2xl border border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
              <h3 className="text-2xl font-bold">{dash.totalAssets || 0}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <h3 className="text-2xl font-bold">${dash.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Allocated</p>
              <h3 className="text-2xl font-bold">{dash.statusBreakdown?.find((s: any) => s.status === 'ALLOCATED')?._count || 0}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Under Maintenance</p>
              <h3 className="text-2xl font-bold">{dash.statusBreakdown?.find((s: any) => s.status === 'UNDER_MAINTENANCE')?._count || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Status Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-border/50 flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-muted-foreground" />
            Asset Status Distribution
          </h3>
          <div className="flex-1 space-y-4">
            {dash.statusBreakdown?.map((item: any) => {
              const percentage = Math.round((item._count / dash.totalAssets) * 100) || 0;
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">{item.status.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{item._count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary/70 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lifecycle Stats */}
        <div className="glass-panel p-6 rounded-2xl border border-border/50 flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Lifecycle Analysis
          </h3>
          <div className="space-y-6">
            <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Average Asset Age</p>
              <p className="text-2xl font-bold">{Math.round(life.averageAgeDays || 0)} <span className="text-lg font-normal text-muted-foreground">days</span></p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 text-destructive">
              <p className="text-sm font-medium mb-1">Warranty Expiring Soon (30 days)</p>
              <p className="text-2xl font-bold">{life.warrantyExpiringCount || 0}</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500">
              <p className="text-sm font-medium mb-1">Depreciated Assets</p>
              <p className="text-2xl font-bold">{life.depreciatedCount || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
