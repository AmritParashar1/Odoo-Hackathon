import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Tag, Monitor, CreditCard, Clock, Building2, UserCircle2 } from 'lucide-react';

interface AssetDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: any | null;
  onDelete?: (id: string) => void;
  userRole?: string;
}

export const AssetDetailsModal = ({ open, onOpenChange, asset, onDelete, userRole }: AssetDetailsModalProps) => {
  if (!asset) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'ALLOCATED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'UNDER_MAINTENANCE': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'LOST': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-background/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-secondary/30 p-6 border-b border-border/50">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{asset.name}</h2>
                <Badge variant="outline" className={getStatusColor(asset.status)}>
                  {asset.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4" />
                {asset.assetTag}
              </p>
            </div>
            <div className="bg-background p-2 rounded-lg border border-border/50 shadow-sm">
              <QrCode className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column: Specifications */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Specifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-24">Category:</span>
                    <span className="font-medium">{asset.category?.name || 'Uncategorized'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-24">Serial No:</span>
                    <span className="font-medium">{asset.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-24">Condition:</span>
                    <span className="font-medium capitalize">{asset.condition.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financials</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-24">Purchase Cost:</span>
                    <span className="font-medium">${asset.purchaseCost ? Number(asset.purchaseCost).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-24">Purchased:</span>
                    <span className="font-medium">
                      {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Allocation & Location */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Assignment</h3>
                <div className="bg-secondary/20 p-4 rounded-xl border border-border/50 space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{asset.department?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                  {asset.allocations?.filter((a: any) => a.status === 'ACTIVE').map((allocation: any) => (
                    <div key={allocation.id} className="flex items-start gap-3 pt-3 border-t border-border/50">
                      <UserCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Allocated To</p>
                        <p className="text-sm text-muted-foreground">
                          {allocation.allocatedTo?.firstName} {allocation.allocatedTo?.lastName}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!asset.allocations || asset.allocations.length === 0 || !asset.allocations.find((a: any) => a.status === 'ACTIVE')) && (
                    <div className="flex items-start gap-3 pt-3 border-t border-border/50 opacity-50">
                      <UserCircle2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Allocated To</p>
                        <p className="text-sm text-muted-foreground">No active allocation</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Description</h3>
                <p className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-lg border border-border/30">
                  {asset.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-secondary/30 p-4 border-t border-border/50 flex justify-between gap-3">
          <div>
            {userRole === 'ADMIN' && (
              <Button 
                variant="destructive" 
                className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  if (window.confirm('Are you sure you want to permanently delete this asset and ALL its history?')) {
                    onDelete?.(asset.id);
                    onOpenChange(false);
                  }
                }}
              >
                Delete Asset
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button variant="default" className="bg-primary hover:bg-primary/90">
              Edit Asset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
