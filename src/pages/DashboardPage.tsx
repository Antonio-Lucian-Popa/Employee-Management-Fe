import { useEffect, useState } from 'react';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { attendanceApi, leavesApi } from '@/api/endpoints';
import { formatApiDate } from '@/utils/format';
import { toast } from 'sonner';
import type { Attendance } from '@/types';

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    pendingLeaves: 0,
    attendanceRate: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = formatApiDate(new Date());
        const [attendanceRes, leavesRes] = await Promise.all([
          attendanceApi.getDaily(today),
          leavesApi.getAll(),
        ]);

        const attendance = attendanceRes.data;
        const leaves = leavesRes.data;

        const present = attendance.filter(a => a.status === 'PRESENT').length;
        const pending = leaves.filter(l => l.status === 'PENDING').length;

        setStats({
          totalEmployees: attendance.length,
          todayPresent: present,
          pendingLeaves: pending,
          attendanceRate: attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0,
        });

        setRecentAttendance(attendance.slice(0, 5));
      } catch (error: any) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          description="Active team members"
        />
        <StatCard
          title="Present Today"
          value={stats.todayPresent}
          icon={Calendar}
          description={`${stats.attendanceRate}% attendance rate`}
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={FileText}
          description="Awaiting approval"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          description="Today's performance"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-muted-foreground text-sm">No attendance data for today</p>
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {record.user?.firstName} {record.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{record.user?.email}</p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        record.status === 'PRESENT'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : record.status === 'ABSENT'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      {record.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/attendance"
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <p className="font-medium">Mark Attendance</p>
                <p className="text-xs text-muted-foreground">Update today's attendance records</p>
              </a>
              <a
                href="/leaves"
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <p className="font-medium">Manage Leaves</p>
                <p className="text-xs text-muted-foreground">View and approve leave requests</p>
              </a>
              <a
                href="/reports/monthly"
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <p className="font-medium">View Reports</p>
                <p className="text-xs text-muted-foreground">Generate monthly analytics</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
