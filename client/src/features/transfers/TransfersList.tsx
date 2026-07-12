import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ArrowLeftRight, Plus, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TransferModal } from './TransferModal';
import { Badge } from '@/components/ui/badge';

export const TransfersList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, COMPLETED

  const { data: response, isLoading } = useQuery({
    queryKey: ['transfers', activeTab],
    queryFn: async () => {
      let url = '/transfers?limit=50';
      if (activeTab === 'PENDING') {
        // Just fetch all and filter in frontend for simplicity in this demo, or use multiple statuses if supported.
      } else if (activeTab === 'COMPLETED') {
        url += '&status=COMPLETED';
      }
      const res = await apiClient.get(url);
      return res.data;
    },
  });

  const approveDeptMutation = useMutation({
    mutationFn: async (id: string) => apiClient.patch(`/transfers/${id}/approve-dept`, { notes: 'Approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });

  const approveManagerMutation = useMutation({
    mutationFn: async (id: string) => apiClient.patch(`/transfers/${id}/approve-manager`, { notes: 'Approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => apiClient.patch(`/transfers/${id}/reject`, { reason: 'Rejected by admin/manager' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'DEPT_HEAD_APPROVED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'MANAGER_APPROVED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'REJECTED': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const transfers = activeTab === 'PENDING' 
    ? response?.data?.filter((t: any) => t.status !== 'COMPLETED' && t.status !== 'REJECTED')
    : response?.data || [];

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asset Transfers</h2>
          <p className="text-muted-foreground mt-1">Manage inter-departmental asset movements.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Request Transfer
        </Button>
      </div>

      <div className="flex gap-2 bg-secondary/30 p-1 rounded-lg w-max border border-border/50">
        {['ALL', 'PENDING', 'COMPLETED'].map((tab) => (
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
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading transfers...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Asset</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">From Department</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">To Department</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Requested By</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <ArrowLeftRight className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p>No transfers found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer: any) => (
                    <tr 
                      key={transfer.id} 
                      className="hover:bg-secondary/20 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{transfer.asset?.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{transfer.asset?.assetTag}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {transfer.fromDepartment?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {transfer.toDepartment?.name}
                      </td>
                      <td className="px-6 py-4">
                        {transfer.requestedBy?.firstName} {transfer.requestedBy?.lastName}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={getStatusColor(transfer.status)}>
                          {transfer.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {transfer.status === 'REQUESTED' && (user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_HEAD') && (
                          <Button size="sm" variant="outline" className="h-8 border-blue-500/30 text-blue-500 hover:bg-blue-500/10" onClick={() => approveDeptMutation.mutate(transfer.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Dept Approve
                          </Button>
                        )}
                        {transfer.status === 'DEPT_HEAD_APPROVED' && (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
                          <Button size="sm" variant="outline" className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10" onClick={() => approveManagerMutation.mutate(transfer.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Final Approve
                          </Button>
                        )}
                        {['REQUESTED', 'DEPT_HEAD_APPROVED'].includes(transfer.status) && (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER' || user?.role === 'DEPARTMENT_HEAD') && (
                          <Button size="sm" variant="outline" className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => rejectMutation.mutate(transfer.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
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

      <TransferModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
};
