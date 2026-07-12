import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Wrench, Plus, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MaintenanceModal } from './MaintenanceModal';
import { Badge } from '@/components/ui/badge';

export const MaintenanceList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['maintenance', activeTab],
    queryFn: async () => {
      let url = '/maintenance?limit=50';
      if (activeTab === 'ACTIVE') {
        // Mock filtering active on frontend
      } else if (activeTab === 'RESOLVED') {
        url += '&status=RESOLVED';
      }
      const res = await apiClient.get(url);
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => 
      apiClient.patch(`/maintenance/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'APPROVED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'TECHNICIAN_ASSIGNED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'IN_PROGRESS': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'REJECTED': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-destructive font-bold';
      case 'HIGH': return 'text-orange-500 font-medium';
      case 'MEDIUM': return 'text-blue-500';
      case 'LOW': return 'text-muted-foreground';
      default: return '';
    }
  };

  const requests = activeTab === 'ACTIVE'
    ? response?.data?.filter((r: any) => r.status !== 'RESOLVED' && r.status !== 'REJECTED')
    : response?.data || [];

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
          <p className="text-muted-foreground mt-1">Track repairs and maintenance logs for assets.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20"
          onClick={() => {
            setSelectedRequest(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Maintenance
        </Button>
      </div>

      <div className="flex gap-2 bg-secondary/30 p-1 rounded-lg w-max border border-border/50">
        {['ALL', 'ACTIVE', 'RESOLVED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden border border-border/50">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading maintenance records...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Asset</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Priority</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Issue Description</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Wrench className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p>No maintenance requests found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req: any) => (
                    <tr 
                      key={req.id} 
                      className="hover:bg-secondary/20 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div>{req.asset?.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{req.asset?.assetTag}</div>
                      </td>
                      <td className={`px-6 py-4 ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground max-w-xs truncate" title={req.issueDescription}>
                        {req.issueDescription}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={getStatusColor(req.status)}>
                          {req.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {req.status === 'PENDING' && (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
                          <Button size="sm" variant="outline" className="h-8 border-blue-500/30 text-blue-500 hover:bg-blue-500/10" onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'APPROVED' })}>
                            Approve
                          </Button>
                        )}
                        {req.status === 'APPROVED' && (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
                          <Button size="sm" variant="outline" className="h-8 border-orange-500/30 text-orange-500 hover:bg-orange-500/10" onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'IN_PROGRESS' })}>
                            <Clock className="w-4 h-4 mr-1" /> Start Work
                          </Button>
                        )}
                        {req.status === 'IN_PROGRESS' && (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
                          <Button size="sm" variant="outline" className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10" onClick={() => {
                            setSelectedRequest(req);
                            setIsModalOpen(true);
                          }}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <MaintenanceModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        maintenanceToResolve={selectedRequest}
      />
    </div>
  );
};
