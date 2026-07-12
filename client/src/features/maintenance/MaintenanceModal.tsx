import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Wrench } from 'lucide-react';

interface MaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceToResolve?: any | null;
}

export const MaintenanceModal = ({ open, onOpenChange, maintenanceToResolve }: MaintenanceModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    assetId: '',
    priority: 'MEDIUM',
    issueDescription: '',
    // For resolution:
    resolution: '',
    technicianName: '',
    actualCost: '',
  });

  const { data: assetsRes } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await apiClient.get('/assets?limit=1000');
      return res.data;
    },
    enabled: open && !maintenanceToResolve
  });

  useEffect(() => {
    if (maintenanceToResolve) {
      setFormData(prev => ({ ...prev, resolution: '', technicianName: '', actualCost: '' }));
    } else {
      setFormData({ assetId: '', priority: 'MEDIUM', issueDescription: '', resolution: '', technicianName: '', actualCost: '' });
    }
  }, [maintenanceToResolve, open]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (maintenanceToResolve) {
        return apiClient.patch(`/maintenance/${maintenanceToResolve.id}`, {
          status: 'RESOLVED',
          resolution: data.resolution,
          technicianName: data.technicianName,
          actualCost: data.actualCost ? Number(data.actualCost) : undefined
        });
      }
      return apiClient.post('/maintenance', {
        assetId: data.assetId,
        priority: data.priority,
        issueDescription: data.issueDescription
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to submit maintenance log');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            {maintenanceToResolve ? 'Resolve Maintenance' : 'Log Maintenance'}
          </DialogTitle>
          <DialogDescription>
            {maintenanceToResolve ? 'Enter the resolution details and costs to complete this request.' : 'Report an issue with an asset.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {maintenanceToResolve ? (
            <>
              <div className="space-y-2">
                <Label>Asset</Label>
                <div className="p-2 bg-secondary/50 rounded-md border border-border/50 text-muted-foreground text-sm">
                  {maintenanceToResolve.asset?.name} ({maintenanceToResolve.asset?.assetTag})
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicianName">Technician Name (Optional)</Label>
                <Input
                  id="technicianName"
                  placeholder="e.g. John Doe"
                  value={formData.technicianName}
                  onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualCost">Repair Cost ($)</Label>
                <Input
                  id="actualCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.actualCost}
                  onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution Details</Label>
                <textarea
                  id="resolution"
                  className="flex min-h-[80px] w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  placeholder="Describe what was fixed..."
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="assetId">Asset</Label>
                <Select 
                  value={formData.assetId} 
                  onValueChange={(val) => setFormData({ ...formData, assetId: val })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border/50">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetsRes?.data?.map((asset: any) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.assetTag})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(val) => setFormData({ ...formData, priority: val })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border/50">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDescription">Issue Description</Label>
                <textarea
                  id="issueDescription"
                  className="flex min-h-[80px] w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  placeholder="Describe the issue in detail (min 10 characters)..."
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || (!maintenanceToResolve && formData.issueDescription.length < 10)}>
              {mutation.isPending ? 'Saving...' : (maintenanceToResolve ? 'Resolve' : 'Submit Request')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
