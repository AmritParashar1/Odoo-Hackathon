import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DepartmentModal } from './DepartmentModal';
import { Badge } from '@/components/ui/badge';

export const DepartmentsList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get(`/departments`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete department');
    }
  });

  const filteredDepartments = response?.data?.filter((dept: any) => 
    dept.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    dept.code.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground mt-1">Manage organizational units and their resources.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button 
            className="bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20"
            onClick={() => {
              setSelectedDepartment(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        )}
      </div>

      <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden border border-border/50">
        <div className="p-4 border-b border-border/50 flex items-center gap-4 bg-background/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search departments..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading departments...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Department</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Code</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-center">Members</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-center">Assets</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p>No departments found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept: any) => (
                    <tr 
                      key={dept.id} 
                      className="hover:bg-secondary/20 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{dept.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate" title={dept.description}>{dept.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono">{dept.code}</code>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="secondary" className="font-mono">{dept._count?.users || 0}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="secondary" className="font-mono">{dept._count?.assets || 0}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {dept.isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Active</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {user?.role === 'ADMIN' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedDepartment(dept);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this department?')) {
                                  deleteMutation.mutate(dept.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
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

      <DepartmentModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        department={selectedDepartment}
      />
    </div>
  );
};
