// src/pages/InvitationPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { invitationsApi } from "@/api/endpoints";
import type { Invitation } from "@/types";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Loader as LoaderIcon,
  UserPlus,
  ShieldCheck,
  Mail,
  Building2,
  Lock,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const acceptSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AcceptFormData = z.infer<typeof acceptSchema>;

function strength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0..4
}

export function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
  });

  // dacă vine ?tenant= în URL, îl păstrăm pt. X-Tenant între refresh-uri
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const tenant = qp.get("tenant");
    if (tenant) localStorage.setItem("tenant", tenant);
  }, [location.search]);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        toast.error("Invalid invitation link");
        navigate("/login");
        return;
      }
      try {
        setLoadErr(null);
        const res = await invitationsApi.get(token);
        setInvitation(res.data);
      } catch (error: any) {
        const msg = error?.response?.data?.message || "Invitation not found or expired";
        setLoadErr(msg);
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
      toast.success("Invitation accepted! Please sign in.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  const pwd = watch("password") || "";
  const score = useMemo(() => strength(pwd), [pwd]);
  const tenantLabel = invitation?.tenantName ?? invitation?.tenantId ?? "your team";

  // ---------- UI ----------
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-gradient-to-b from-background via-background to-muted">
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderIcon className="h-5 w-5 animate-spin" />
          <span>Loading invitation…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-muted">
      <div className="container max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Secure invite — join your team</span>
            </div>
            <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
              You’ve been invited to <span className="text-primary">{tenantLabel}</span>
            </h1>
            {invitation && (
              <p className="mt-2 text-sm text-muted-foreground">
                Role: <span className="font-medium">{invitation.role}</span>{" "}
                {invitation.invitedBy ? (
                  <>
                    · by <span className="font-medium">
                      {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
                    </span>
                  </>
                ) : (
                  <>· invitation sent by an admin</>
                )}
              </p>
            )}
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full grid place-items-center bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Create your account</CardTitle>
                  <CardDescription>Fill in your details to join the workspace.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              {loadErr && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{loadErr}</AlertDescription>
                </Alert>
              )}

              {!invitation ? (
                <div className="flex items-center gap-3 text-muted-foreground py-6">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                  <span>Fetching invitation…</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email (read-only) */}
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input id="email" type="email" value={invitation.email} readOnly className="bg-muted" />
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" placeholder="John" {...register("firstName")} disabled={isAccepting} />
                      {errors.firstName && (
                        <p className="text-xs text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" placeholder="Doe" {...register("lastName")} disabled={isAccepting} />
                      {errors.lastName && (
                        <p className="text-xs text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </Label>
                    <Input id="password" type="password" placeholder="••••••••" {...register("password")} disabled={isAccepting} />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}

                    {/* strength meter */}
                    <div className="mt-1.5 flex items-center gap-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-full rounded ${i < score ? "bg-primary" : "bg-muted"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Use at least 8 characters, mix upper/lowercase, a number and a symbol for a stronger password.
                    </p>
                  </div>

                  {/* Confirm password */}
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      disabled={isAccepting}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isAccepting}>
                    {isAccepting ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> Accepting…
                      </>
                    ) : (
                      <>Accept invitation</>
                    )}
                  </Button>

                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground">
                    By continuing you agree to our{" "}
                    <Link to="/legal/terms" className="underline underline-offset-4">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="/legal/privacy" className="underline underline-offset-4">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium underline underline-offset-4">
              Sign in
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>Tenant</span>
              <span className="px-2 py-0.5 rounded bg-muted text-foreground">{tenantLabel}</span>
            </div>
            {invitation?.expiresAt && (
              <div className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Expires:</span>
                <span className="px-2 py-0.5 rounded bg-muted text-foreground">
                  {new Date(invitation.expiresAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default InvitationPage;
