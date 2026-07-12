import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { ArrowLeftRight } from 'lucide-react';

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransferModal = ({ open, onOpenChange }: TransferModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    assetId: '',
    toDepartmentId: '',
    reason: '',
  });

  const { data: assetsRes } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await apiClient.get('/assets?limit=1000');
      return res.data;
    },
    enabled: open
  });

  const { data: deptsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/departments');
      return res.data;
    },
    enabled: open
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => apiClient.post('/transfers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      setFormData({ assetId: '', toDepartmentId: '', reason: '' });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to submit transfer request');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.toDepartmentId || !formData.reason) return;
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Request Asset Transfer
          </DialogTitle>
          <DialogDescription>
            Submit a request to move an asset to a new department.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                    {asset.name} ({asset.assetTag}) - {asset.department?.name || 'No Dept'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toDepartmentId">Destination Department</Label>
            <Select 
              value={formData.toDepartmentId} 
              onValueChange={(val) => setFormData({ ...formData, toDepartmentId: val })}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {deptsRes?.data?.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Transfer</Label>
            <textarea
              id="reason"
              className="flex min-h-[80px] w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="Explain why this transfer is needed (min 10 characters)..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || formData.reason.length < 10}>
              {mutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
