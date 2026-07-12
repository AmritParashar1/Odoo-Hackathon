import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { FileCheck, Plus, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuditModal } from './AuditModal';
import { Badge } from '@/components/ui/badge';

export const AuditsList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const res = await apiClient.get('/audits?limit=50');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => 
      apiClient.patch(`/audits/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'CLOSED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const audits = response?.data || [];

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audits</h2>
          <p className="text-muted-foreground mt-1">Manage and track periodic physical asset audits.</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
          <Button 
            className="bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Audit
          </Button>
        )}
      </div>

      <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden border border-border/50">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading audits...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Title & Description</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Created By</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Schedule</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Entries</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {audits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <FileCheck className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p>No audits found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  audits.map((audit: any) => (
                    <tr 
                      key={audit.id} 
                      className="hover:bg-secondary/20 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div>{audit.title}</div>
                        <div className="text-xs text-muted-foreground max-w-xs truncate" title={audit.description}>{audit.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {audit.createdBy?.firstName} {audit.createdBy?.lastName}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        <div className="text-foreground">Start: {new Date(audit.startDate).toLocaleDateString()}</div>
                        {audit.endDate && <div className="text-muted-foreground">End: {new Date(audit.endDate).toLocaleDateString()}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-mono">{audit._count?.entries || 0}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={getStatusColor(audit.status)}>
                          {audit.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {audit.status === 'OPEN' && (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
                          <Button size="sm" variant="outline" className="h-8 border-blue-500/30 text-blue-500 hover:bg-blue-500/10" onClick={() => updateStatusMutation.mutate({ id: audit.id, status: 'IN_PROGRESS' })}>
                            <Clock className="w-4 h-4 mr-1" /> Start Audit
                          </Button>
                        )}
                        {audit.status === 'IN_PROGRESS' && (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
                          <Button size="sm" variant="outline" className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10" onClick={() => updateStatusMutation.mutate({ id: audit.id, status: 'CLOSED' })}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Close Audit
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

      <AuditModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
};
