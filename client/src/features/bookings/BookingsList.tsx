import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CalendarDays, Plus, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BookingModal } from './BookingModal';
import { Badge } from '@/components/ui/badge';

export const BookingsList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  const { data: response, isLoading } = useQuery({
    queryKey: ['bookings', activeTab],
    queryFn: async () => {
      let url = '/bookings?limit=50';
      if (activeTab === 'CONFIRMED') {
        url += '&status=CONFIRMED';
      }
      const res = await apiClient.get(url);
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => 
      apiClient.patch(`/bookings/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CANCELLED': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const bookings = response?.data || [];

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asset Bookings</h2>
          <p className="text-muted-foreground mt-1">Manage temporary reservations of shared resources.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex gap-2 bg-secondary/30 p-1 rounded-lg w-max border border-border/50">
        {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
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
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading bookings...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Title</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Asset</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Booked By</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Schedule</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <CalendarDays className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p>No bookings found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking: any) => (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-secondary/20 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {booking.title}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-foreground">{booking.asset?.name}</div>
                        <div className="text-xs text-muted-foreground">{booking.asset?.assetTag}</div>
                      </td>
                      <td className="px-6 py-4">
                        {booking.bookedBy?.firstName} {booking.bookedBy?.lastName}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        <div className="text-foreground">Start: {new Date(booking.startTime).toLocaleString()}</div>
                        <div className="text-muted-foreground">End: {new Date(booking.endTime).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {booking.status === 'CONFIRMED' && (user?.id === booking.bookedById || user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
                          <>
                            <Button size="sm" variant="outline" className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'COMPLETED' })}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Complete
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'CANCELLED' })}>
                              <XCircle className="w-4 h-4 mr-1" /> Cancel
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

      <BookingModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
};
