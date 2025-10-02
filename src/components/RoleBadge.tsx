import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';

interface RoleBadgeProps {
  role: UserRole;
}

const roleStyles: Record<UserRole, string> = {
  OWNER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  EMPLOYEE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge variant="outline" className={roleStyles[role]}>
      {role}
    </Badge>
  );
}
