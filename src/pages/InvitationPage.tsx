import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { invitationsApi } from '@/api/endpoints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/Loader';
import { toast } from 'sonner';
import { Loader as Loader2, UserPlus } from 'lucide-react';
import type { Invitation } from '@/types';

const acceptSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type AcceptFormData = z.infer<typeof acceptSchema>;

export function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        toast.error('Invalid invitation link');
        navigate('/login');
        return;
      }

      try {
        const response = await invitationsApi.get(token);
        setInvitation(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Invitation not found or expired');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token, navigate]);

  const onSubmit = async (data: AcceptFormData) => {
    if (!token) return;

    setIsAccepting(true);
    try {
      await invitationsApi.accept(token, data.password, data.firstName, data.lastName);
      toast.success('Invitation accepted! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return <Loader className="py-12" />;
  }

  if (!invitation) {
    return null;
  }

  return (
    <div>
      <div className="text-center mb-6">
        <UserPlus className="h-12 w-12 text-primary mx-auto mb-3" />
        <h2 className="text-2xl font-bold">You've been invited!</h2>
        <p className="text-muted-foreground mt-2">
          Join <span className="font-semibold">{invitation.tenantName}</span> as{' '}
          <span className="font-semibold">{invitation.role}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Invited by {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              {...register('firstName')}
              disabled={isAccepting}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...register('lastName')}
              disabled={isAccepting}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={invitation.email}
            disabled
            className="bg-muted"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isAccepting}
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={isAccepting}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isAccepting}>
          {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Accept Invitation
        </Button>
      </form>
    </div>
  );
}
