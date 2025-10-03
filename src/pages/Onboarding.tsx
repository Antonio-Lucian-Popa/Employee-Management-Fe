import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Building2, UserPlus2, ShieldCheck, MailCheck, ArrowRight, ExternalLink } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { onboardingApi } from "@/api/endpoints";
import { apiClient } from "@/api/axios";


function slugify(src: string) {
  return src
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

export default function Onboarding() {
  const nav = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const t = params.get("t") || "";

  const [tab, setTab] = useState<"owner" | "invite">("owner");
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [invitationToken, setInvitationToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!t) nav("/login");
  }, [t, nav]);

  // autopropune slug din nume, dar păstrează editarea manuală
  useEffect(() => {
    if (!slug || slug === slugify(slug)) {
      setSlug((prev) => (prev ? prev : slugify(companyName)));
    }
  }, [companyName]);

  const slugValid = useMemo(() => /^[a-z0-9-]{3,30}$/.test(slug), [slug]);

  async function completeOwner() {
  try {
    setLoading(true); setErr(null);
    const { data } = await onboardingApi.completeOwner(t, companyName, slug);
    if (data?.tenant) {
      localStorage.setItem('tenant', data.tenant);
      apiClient.defaults.headers.common['X-Tenant'] = data.tenant;
    }
    nav('/dashboard');
  } catch (e: any) {
    setErr(e?.response?.data || 'Eroare la creare companie');
  } finally { setLoading(false); }
}

async function completeInvite() {
  try {
    setLoading(true); setErr(null);
    const { data } = await onboardingApi.completeInvite(t, invitationToken);
    if (data?.tenant) {
      localStorage.setItem('tenant', data.tenant);
      apiClient.defaults.headers.common['X-Tenant'] = data.tenant;
    }
    nav('/dashboard');
  } catch (e: any) {
    setErr(e?.response?.data || 'Eroare la acceptare invitație');
  } finally { setLoading(false); }
}

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-muted">
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Google auth reușit — finalizează înregistrarea</span>
            </div>
            <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
              Bine ai venit! Hai să-ți configurăm accesul
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Alege dacă vrei să <strong>creezi o companie</strong> (devii OWNER) sau să te <strong>alături prin invitație</strong>.
            </p>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Opțiuni de continuare</CardTitle>
              <CardDescription>Poți schimba oricând opțiunea de mai jos.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="owner" className="gap-2">
                    <Building2 className="h-4 w-4" /> Creează companie
                  </TabsTrigger>
                  <TabsTrigger value="invite" className="gap-2">
                    <UserPlus2 className="h-4 w-4" /> Am invitație
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="owner" className="mt-6">
                  <div className="space-y-5">
                    <div className="grid gap-3">
                      <Label htmlFor="companyName">Denumire companie</Label>
                      <Input
                        id="companyName"
                        placeholder="Ex: Acme SRL"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-end gap-3 flex-wrap">
                        <div className="grow min-w-[220px]">
                          <Label htmlFor="slug">Slug (subdomeniu)</Label>
                          <Input
                            id="slug"
                            placeholder="ex: acme"
                            value={slug}
                            onChange={(e) => setSlug(slugify(e.target.value))}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground pb-2">
                          Va deveni <code>{slug || "acme"}</code>.app.tld
                        </div>
                      </div>
                      {!slugValid && (
                        <p className="text-xs text-destructive">Doar litere mici, cifre și „-”, 3–30 caractere.</p>
                      )}
                    </div>

                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled={loading || !companyName || !slugValid}
                      onClick={completeOwner}
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se procesează...</>
                      ) : (
                        <>Creează compania <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>

                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground">
                      Prin crearea companiei, accepți rolul de <strong>OWNER</strong> în acest tenant.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="invite" className="mt-6">
                  <div className="space-y-5">
                    <div className="grid gap-3">
                      <Label htmlFor="invitation">Token invitație</Label>
                      <Input
                        id="invitation"
                        placeholder="Lipește tokenul primit pe email"
                        value={invitationToken}
                        onChange={(e) => setInvitationToken(e.target.value.trim())}
                      />
                    </div>

                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled={loading || invitationToken.length < 6}
                      onClick={completeInvite}
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se procesează...</>
                      ) : (
                        <>Mă alătur echipei <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>

                    <Separator className="my-2" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        Nu găsești tokenul? Verifică folderul <strong>Spam</strong> sau cere o nouă invitație
                        administratorului tău.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {err && (
                <Alert variant="destructive" className="mt-6">
                  <MailCheck className="h-4 w-4" />
                  <AlertDescription className="ml-2">{String(err)}</AlertDescription>
                </Alert>
              )}

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Autentificat prin <span className="font-medium">Google</span>. Datele tale sunt în siguranță.
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Ai ajuns aici din greșeală? <a href="/login" className="inline-flex items-center gap-1 underline underline-offset-4">Înapoi la login <ExternalLink className="h-3.5 w-3.5"/></a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
