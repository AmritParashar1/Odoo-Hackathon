import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { UserCog } from 'lucide-react';

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: any | null;
}

export const UserModal = ({ open, onOpenChange, userToEdit }: UserModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    role: '',
    departmentId: 'none',
    isActive: true,
  });

  const { data: departmentsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/departments');
      return res.data;
    },
    enabled: open
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        role: userToEdit.role || 'EMPLOYEE',
        departmentId: userToEdit.department?.id || 'none',
        isActive: userToEdit.isActive,
      });
    }
  }, [userToEdit, open]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        departmentId: data.departmentId === 'none' ? null : data.departmentId
      };
      return apiClient.patch(`/users/${userToEdit.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update employee');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    mutation.mutate(formData);
  };

  if (!userToEdit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Edit Employee: {userToEdit.firstName} {userToEdit.lastName}
          </DialogTitle>
          <DialogDescription>
            Update role, department assignment, and active status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="p-2 bg-secondary/50 rounded-md border border-border/50 text-muted-foreground text-sm">
              {userToEdit.email}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">System Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(val) => setFormData({ ...formData, role: val })}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="DEPARTMENT_HEAD">Department Head</SelectItem>
                <SelectItem value="ASSET_MANAGER">Asset Manager</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department Assignment</Label>
            <Select 
              value={formData.departmentId} 
              onValueChange={(val) => setFormData({ ...formData, departmentId: val })}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- No Department --</SelectItem>
                {departmentsRes?.data?.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Account Status</Label>
            <Select 
              value={formData.isActive ? 'active' : 'inactive'} 
              onValueChange={(val) => setFormData({ ...formData, isActive: val === 'active' })}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
