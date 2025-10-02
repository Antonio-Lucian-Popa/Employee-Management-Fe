import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { attendanceApi } from '@/api/endpoints';
import { DataTable } from '@/components/DataTable';
import { DatePicker } from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { formatApiDate, formatDate } from '@/utils/format';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import type { Attendance, AttendanceStatus } from '@/types';

export function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await attendanceApi.getDaily(formatApiDate(date));
      setAttendance(response.data);
    } catch (error: any) {
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    try {
      await attendanceApi.markAttendance({
        userId: selectedUser,
        date: formatApiDate(date),
        status,
        notes: notes || undefined,
      });
      toast.success('Attendance marked successfully');
      setDialogOpen(false);
      setSelectedUser('');
      setNotes('');
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const columns: ColumnDef<Attendance>[] = [
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              status === 'PRESENT'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : status === 'ABSENT'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }`}
          >
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.notes || '-'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="user">Employee</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {attendance.map((record) => (
                      <SelectItem key={record.userId} value={record.userId}>
                        {record.user?.firstName} {record.user?.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as AttendanceStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="LEAVE">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleMarkAttendance} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <DatePicker date={date} onDateChange={(d) => d && setDate(d)} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDate(date, 'EEEE, MMMM d, yyyy')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={attendance} searchKey="user.firstName" />
      )}
    </div>
  );
}
