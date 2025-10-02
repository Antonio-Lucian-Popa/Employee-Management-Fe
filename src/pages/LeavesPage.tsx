import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { leavesApi } from '@/api/endpoints';
import { useAuthStore } from '@/store/authStore';
import { DataTable } from '@/components/DataTable';
import { DatePicker } from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatApiDate } from '@/utils/format';
import { toast } from 'sonner';
import { Plus, Check, X } from 'lucide-react';
import type { Leave } from '@/types';

const leaveSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type LeaveFormData = z.infer<typeof leaveSchema>;

export function LeavesPage() {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const reason = watch('reason');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const response = await leavesApi.getAll();
      setLeaves(response.data);
    } catch (error: any) {
      toast.error('Failed to load leaves');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLeave = async (data: LeaveFormData) => {
    try {
      await leavesApi.create({
        startDate: formatApiDate(data.startDate),
        endDate: formatApiDate(data.endDate),
        reason: data.reason,
      });
      toast.success('Leave request submitted');
      setDialogOpen(false);
      reset();
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create leave request');
    }
  };

  const handleDecision = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!user) return;

    try {
      await leavesApi.updateDecision(leaveId, user.id, status);
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchLeaves();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update leave');
    }
  };

  const canApprove = user && ['OWNER', 'ADMIN'].includes(user.role);

  const columns: ColumnDef<Leave>[] = [
    {
      accessorKey: 'user.firstName',
      header: 'Employee',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.user?.firstName} {row.original.user?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{row.original.user?.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Duration',
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{formatDate(row.original.startDate, 'MMM dd, yyyy')}</p>
          <p className="text-muted-foreground">to {formatDate(row.original.endDate, 'MMM dd, yyyy')}</p>
        </div>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <p className="text-sm max-w-xs truncate">{row.original.reason}</p>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant="outline"
            className={
              status === 'APPROVED'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : status === 'REJECTED'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const leave = row.original;
        if (!canApprove || leave.status !== 'PENDING') return null;

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
              onClick={() => handleDecision(leave.id, 'APPROVED')}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
              onClick={() => handleDecision(leave.id, 'REJECTED')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Leave Requests</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreateLeave)} className="space-y-4 py-4">
              <div>
                <Label>Start Date</Label>
                <DatePicker
                  date={startDate}
                  onDateChange={(date) => setValue('startDate', date as Date)}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <Label>End Date</Label>
                <DatePicker
                  date={endDate}
                  onDateChange={(date) => setValue('endDate', date as Date)}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">{errors.endDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why you need leave..."
                  value={reason || ''}
                  onChange={(e) => setValue('reason', e.target.value)}
                  rows={4}
                />
                {errors.reason && (
                  <p className="text-sm text-destructive mt-1">{errors.reason.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={leaves} searchKey="user.firstName" />
      )}
    </div>
  );
}
