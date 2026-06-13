import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, StatCard, Panel } from "@/components/admin/AdminShell";
import { IndianRupee, TrendingUp, Percent, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar, LineChart, Line, Legend } from "recharts";
import { useState, useEffect } from "react";
import { api } from "../lib/api";

export const Route = createFileRoute("/revenue")({ component: Page });

function Page() {
  const [gbv, setGbv] = useState(0);
  const [commission, setCommission] = useState(0);
  const [avgRideValue, setAvgRideValue] = useState(0);
  const [walletFloat, setWalletFloat] = useState(0);

  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [revenueMix, setRevenueMix] = useState<any[]>([]);
  const [hourlyTrend, setHourlyTrend] = useState<any[]>([]);

  useEffect(() => {
    async function loadRevenue() {
      try {
        const rides = await api.getRides() || [];
        const users = await api.getUsers() || [];

        // Filter for completed/paid rides
        const completedRides = rides.filter((r: any) => 
          ["completed", "payment_completed", "payment_success"].includes(r.status)
        );

        // Calculate GBV (total fare)
        const totalGbv = completedRides.reduce((sum: number, r: any) => sum + (r.fare || 0), 0);
        setGbv(totalGbv);

        // Platform fee/commission: 5% for bike, 8% for auto, or exact commission if available
        let totalComm = 0;
        completedRides.forEach((r: any) => {
          if (r.commission !== undefined && r.commission !== null) {
            totalComm += r.commission;
          } else {
            const vType = r.vehicle_type ? r.vehicle_type.toLowerCase() : 'bike';
            const rate = vType.includes('auto') ? 0.08 : 0.05;
            totalComm += Math.round((r.fare || 0) * rate);
          }
        });
        setCommission(totalComm);

        // Average ride value
        setAvgRideValue(completedRides.length > 0 ? Math.round(totalGbv / completedRides.length) : 0);

        // Wallet float: sum of wallet balance of all users
        const totalWalletFloat = users.reduce((sum: number, u: any) => sum + (u.wallet_balance || 0), 0);
        setWalletFloat(totalWalletFloat);

        // Monthly trend computation from real rides
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData: Record<string, { gross: number; commission: number }> = {};
        
        // Populate default months to show clean state
        const currentMonth = new Date().getMonth();
        for (let i = 0; i <= currentMonth; i++) {
          monthlyData[months[i]] = { gross: 0, commission: 0 };
        }

        completedRides.forEach((r: any) => {
          const date = new Date(r.created_at || Date.now());
          const m = months[date.getMonth()];
          if (monthlyData[m]) {
            monthlyData[m].gross += r.fare || 0;
            if (r.commission !== undefined && r.commission !== null) {
              monthlyData[m].commission += r.commission;
            } else {
              const vType = r.vehicle_type ? r.vehicle_type.toLowerCase() : 'bike';
              const rate = vType.includes('auto') ? 0.08 : 0.05;
              monthlyData[m].commission += Math.round((r.fare || 0) * rate);
            }
          }
        });

        const formattedMonthly = Object.entries(monthlyData).map(([m, data]) => ({
          m,
          gross: data.gross,
          commission: data.commission
        }));
        setMonthlyTrend(formattedMonthly);

        // Revenue Mix: grouping by vehicle_type
        const mixCounts: Record<string, number> = { Bike: 0, Auto: 0 };
        completedRides.forEach((r: any) => {
          const type = r.vehicle_type === "bike" ? "Bike" : "Auto";
          mixCounts[type] += r.fare || 0;
        });
        const formattedMix = Object.entries(mixCounts).map(([c, v]) => ({ c, v }));
        setRevenueMix(formattedMix);

        // Hourly trend
        const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
          h: `${i}:00`,
          r: 0
        }));
        completedRides.forEach((r: any) => {
          const date = new Date(r.created_at || Date.now());
          const hour = date.getHours();
          hourlyData[hour].r += r.fare || 0;
        });
        setHourlyTrend(hourlyData);

      } catch (err) {
        console.error("Failed to load revenue analytics:", err);
      }
    }
    loadRevenue();
  }, []);

  return (
    <AdminShell title="Revenue Analytics" subtitle="Gross booking value, commissions, payouts"
      actions={<><Button size="sm" variant="outline">Last 30 days</Button><Button size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">Download report</Button></>}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="GBV (MTD)" value={`₹${gbv.toLocaleString()}`} delta="" icon={IndianRupee} tone="primary" />
        <StatCard label="Net commission (5% / 8%)" value={`₹${commission.toLocaleString()}`} delta="" icon={Percent} tone="accent" />
        <StatCard label="Avg ride value" value={`₹${avgRideValue}`} delta="" icon={TrendingUp} tone="primary" />
        <StatCard label="Wallet float" value={`₹${walletFloat.toLocaleString()}`} delta="" icon={Wallet} tone="accent" />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Monthly revenue trend" description="Gross booking value vs platform commission">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="rv1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.65 0.25 350)" stopOpacity={0.55} /><stop offset="100%" stopColor="oklch(0.65 0.25 350)" stopOpacity={0} /></linearGradient>
                    <linearGradient id="rv2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.72 0.20 55)" stopOpacity={0.55} /><stop offset="100%" stopColor="oklch(0.72 0.20 55)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                  <XAxis dataKey="m" stroke="oklch(0.72 0.04 40)" fontSize={11} />
                  <YAxis stroke="oklch(0.72 0.04 40)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "oklch(0.19 0.04 350)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }} />
                  <Area type="monotone" name="Gross Revenue" dataKey="gross" stroke="oklch(0.65 0.25 350)" fill="url(#rv1)" strokeWidth={2} />
                  <Area type="monotone" name="Platform Commission" dataKey="commission" stroke="oklch(0.72 0.20 55)" fill="url(#rv2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
        <Panel title="Revenue mix" description="By product line">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueMix} layout="vertical">
                <CartesianGrid stroke="oklch(1 0 0 / 6%)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.72 0.04 40)" fontSize={10} />
                <YAxis type="category" dataKey="c" stroke="oklch(0.72 0.04 40)" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: "oklch(0.19 0.04 350)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }} />
                <Bar dataKey="v" fill="oklch(0.65 0.25 350)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <div className="mt-4">
        <Panel title="Hourly revenue - last 24h" description="Spot peak earning windows">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyTrend}>
                <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="h" stroke="oklch(0.72 0.04 40)" fontSize={10} />
                <YAxis stroke="oklch(0.72 0.04 40)" fontSize={10} />
                <Tooltip contentStyle={{ background: "oklch(0.19 0.04 350)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" name="Revenue" dataKey="r" stroke="oklch(0.72 0.20 55)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}