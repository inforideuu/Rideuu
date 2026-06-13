import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, ShieldCheck, KeyRound, Laptop, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Rideuu Admin — Sign in" }] }),
  component: Login,
});

const roles = [
  { key: "super_admin", label: "Super Admin", desc: "Full root control & emergency commands", name: "Arjun K." },
  { key: "operations", label: "Operations Manager", desc: "Surge settings & live routing dispatch", name: "Divya S." },
  { key: "finance", label: "Financial Controller", desc: "Payout triggers & Razorpay audits", name: "Ravi M." },
  { key: "support", label: "Support Lead", desc: "Conflict resolution & refunds", name: "Lakshmi P." },
];

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("super_admin");
  const [emailAddress, setEmailAddress] = useState("admin@Rideuu.in");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await api.loginEmail(emailAddress, password);
    setLoading(false);
    if (res && res.token) {
      localStorage.setItem("admin_token", res.token);
      localStorage.setItem("admin_role", role);
      localStorage.setItem("admin_name", res.user.name);
      localStorage.setItem("admin_session_start", new Date().toLocaleString());
      localStorage.setItem("admin_ip", "127.0.0.1 (Chennai)");
      navigate({ to: "/" });
      window.location.href = "/";
    } else {
      setError("Invalid administrative email or password.");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[oklch(0.14_0.03_350)] text-foreground">
      {/* Visual branding column */}
      <div className="relative hidden overflow-hidden bg-[oklch(0.10_0.02_350)] border-r border-border/20 lg:flex flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-40 animate-pulse" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.65 0.25 350 / 0.45), transparent 60%), radial-gradient(circle at 80% 70%, oklch(0.72 0.20 55 / 0.45), transparent 60%)",
        }} />
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: "linear-gradient(oklch(1 0 0 / 6%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 6%) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        <div className="relative flex items-center gap-3">
          <div style={{ backgroundColor: "white" }}>
            <img src="./ridu_logo.png" alt="rideuu" className="h-20 w-45" />
          </div>
          {/* <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-black text-lg shadow-lg shadow-primary/20">
            N
          </div> */}
          <div>
            {/* <div className="font-bold text-base tracking-wide">Rideuu</div> */}
            <div className="text-[9px] uppercase tracking-widest text-accent font-semibold">Chennai Admin Center</div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">
            Chennai's <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Command Console</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
            Realtime operations monitoring for over 3,000 Chennai drivers. Dispatch safety protocols, track emergency SOS triggers, and configure active rain surge multipliers live.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs text-primary font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Chennai Core Geofence
            </span>
            <span className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-xs text-accent font-medium flex items-center gap-1.5">
              <Laptop className="h-3 w-3" /> Super Admin Authorized Only
            </span>
          </div>
        </div>

        <div className="relative text-[10px] uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
          <span>v2.5 Pro</span>
          <span>·</span>
          <span>Chennai Central HQ</span>
          <span>·</span>
          <span>ISO 27001 SECURE</span>
        </div>
      </div>

      {/* Interactive Form column */}
      <div className="flex items-center justify-center px-6 py-16 bg-gradient-to-b from-transparent to-background/35">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Admin Sign In</h2>
            <p className="text-sm text-muted-foreground">Access operations, finance and verification controls</p>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@Rideuu.in"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="bg-muted/30 border-border/80 h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pwd">Password</Label>
              <Input
                id="pwd"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/30 border-border/80 h-10"
                required
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Authorized Access Level</Label>
              <div className="grid gap-2">
                {roles.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={`flex flex-col text-left p-3 rounded-lg border transition-all ${role === r.key
                      ? "bg-gradient-to-r from-primary/15 to-accent/5 border-primary shadow-md"
                      : "bg-muted/20 border-border/40 hover:bg-muted/30"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{r.label}</span>
                      {role === r.key && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5">{r.desc}</span>
                    <span className="text-[10px] text-accent/80 font-mono mt-1 font-semibold">User: {r.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex gap-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground font-semibold h-10 mt-6"
              type="submit"
              disabled={loading}
            >
              {loading ? "Verifying Credentials..." : "Authenticate Session"} <ArrowRight className="ml-2 h-4.5 w-4.5" />
            </Button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/80 mt-4">
            <Shield className="h-3.5 w-3.5" />
            <span>Encrypted endpoint. All administrative actions are recorded.</span>
          </div>
        </div>
      </div>
    </div>
  );
}