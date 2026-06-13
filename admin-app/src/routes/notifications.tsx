import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Panel } from "@/components/admin/AdminShell";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, Send, Languages, Sparkles, Smartphone, Gift, 
  Percent, Target, Users, Calendar, ThumbsUp
} from "lucide-react";
import { api } from "../lib/api";

export const Route = createFileRoute("/notifications")({ component: Page });

type Campaign = {
  t: string;
  a: string;
  s: string;
  o: string;
  channel: string;
};

type Coupon = {
  code: string;
  discount: string;
  zone: string;
  cap: string;
  expiry: string;
};

const translations: Record<string, string> = {
  "₹50 off your next bike ride": "நம்மரைடு: உங்களின் அடுத்த சவாரிக்கு ₹50 தள்ளுபடி! 🎉",
  "Beat the Chennai rain. Code RAIN50 - valid today only.": "சென்னை mழையை வெல்லுங்கள். கோட் RAIN50 - இன்று மட்டுமே செல்லுபடியாகும்.",
  "New safety dispatch: Women-safe matching is live.": "புதிய பாதுகாப்பு வசதி: பெண் ஓட்டுநர் சவாரி பொருத்தம் செயல்பாட்டில் உள்ளது."
};

function Page() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Composer States
  const [title, setTitle] = useState("₹50 off your next bike ride");
  const [message, setMessage] = useState("Beat the Chennai rain. Code RAIN50 - valid today only.");
  const [audience, setAudience] = useState("All Chennai Riders");
  const [channel, setChannel] = useState("FCM Push");
  const [tamilSuggest, setTamilSuggest] = useState(false);

  // Coupon Generator States
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [zone, setZone] = useState("All Chennai zones");
  const [cap, setCap] = useState("1,000 uses");
  const [expiry, setExpiry] = useState("Today 23:59");

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedCampaigns = await api.getCampaigns() || [];
        const fetchedCoupons = await api.getCoupons() || [];

        setCampaigns(fetchedCampaigns.map((c: any) => ({
          t: c.title,
          a: c.audience,
          s: c.sent_count,
          o: c.open_rate,
          channel: c.channel
        })));

        setCoupons(fetchedCoupons.map((c: any) => ({
          code: c.code,
          discount: c.discount_type === 'percentage' ? `${c.value}% Off` : `Flat ₹${c.value} Off`,
          zone: "All Chennai zones",
          cap: c.active ? "Active" : "Inactive",
          expiry: "Today 23:59"
        })));
      } catch (err) {
        console.error("Failed to load notifications page data:", err);
      }
    }
    loadData();
  }, []);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const finalTitle = tamilSuggest && translations[title] ? translations[title] : title;
    const finalMsg = tamilSuggest && translations[message] ? translations[message] : message;

    const body = {
      title: finalTitle,
      message: finalMsg,
      audience: audience,
      channel: channel,
      sent_count: "Pending dispatch...",
      open_rate: "0%"
    };

    try {
      const res = await api.createCampaign(body);
      if (res) {
        setCampaigns(prev => [{
          t: res.title,
          a: res.audience,
          s: res.sent_count,
          o: res.open_rate,
          channel: res.channel
        }, ...prev]);
        alert(`🚀 CAMPAIGN BROADCASTED: Notification dispatched successfully to ${audience} via ${channel}!`);
        setTitle("");
        setMessage("");
      }
    } catch (err) {
      console.error("Failed to broadcast campaign:", err);
      alert("❌ Failed to broadcast campaign.");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discount) return;

    let value = parseFloat(discount.replace(/[^\d.]/g, "")) || 10;
    let discountType = discount.includes("%") ? "percentage" : "flat";

    const body = {
      code: code.toUpperCase(),
      discount_type: discountType,
      value: value,
      active: true
    };

    try {
      const res = await api.createCoupon(body);
      if (res) {
        setCoupons(prev => [{
          code: res.code,
          discount: res.discount_type === 'percentage' ? `${res.value}% Off` : `Flat ₹${res.value} Off`,
          zone: zone,
          cap: cap,
          expiry: expiry
        }, ...prev]);
        alert(`🎉 PROMO CAMPAIGN CREATED: Promo Code ${code.toUpperCase()} is now live and geofenced!`);
        setCode("");
        setDiscount("");
      }
    } catch (err) {
      console.error("Failed to create coupon:", err);
      alert("❌ Failed to create coupon.");
    }
  };

  const getPreviewTitle = () => tamilSuggest && translations[title] ? translations[title] : title;
  const getPreviewMsg = () => tamilSuggest && translations[message] ? translations[message] : message;

  return (
    <AdminShell title="Notifications & Campaigns" subtitle="FCM Push, targeted campaigns, and promotional codes">
      <div className="grid gap-3 lg:grid-cols-5 items-start">
        {/* Left Composer */}
        <div className="lg:col-span-3 space-y-3">
          <Panel title="Compose new campaign" description="Broadcast SMS, Push Alerts, or WhatsApp Alerts">
            <form onSubmit={handleSendCampaign} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase block">Target Channel</span>
                <select 
                  value={channel} 
                  onChange={e => setChannel(e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                >
                  <option value="FCM Push">FCM Push Notification</option>
                  <option value="WhatsApp">WhatsApp Business BSP</option>
                  <option value="SMS Broadcast">Standard SMS Broadcast</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase block">Title</span>
                <Input 
                  placeholder="Notification Header..." 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="h-9 bg-background text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase block">Message Body</span>
                <Textarea 
                  placeholder="Type message content..." 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  className="bg-background text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase block">Audience Segment</span>
                  <select 
                    value={audience} 
                    onChange={e => setAudience(e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                  >
                    <option value="All Chennai Riders">All Chennai Riders</option>
                    <option value="Female Customers">Female Customers (Safety)</option>
                    <option value="High-Risk geofences">High-Risk Geofence Accounts</option>
                    <option value="T. Nagar Segment">T. Nagar Geocell Segment</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase block">Schedule Dispatch</span>
                  <Input type="datetime-local" className="h-8 bg-background" />
                </div>
              </div>

              {/* Tamil auto-suggest trigger */}
              <div className="flex items-center justify-between bg-muted/20 border border-border/40 p-2.5 rounded-lg">
                <div className="flex gap-2">
                  <Languages className="h-4.5 w-4.5 text-primary shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground">Tamil Auto-Suggest translation</div>
                    <div className="text-[9px] text-muted-foreground font-normal">Recommend regional Tamil equivalents in preview locks.</div>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant={tamilSuggest ? "secondary" : "outline"} 
                  onClick={() => setTamilSuggest(t => !t)}
                  className="h-7 text-[9px] font-bold border-border/60"
                >
                  {tamilSuggest ? "Active: தமிழ்" : "Toggle Suggest"}
                </Button>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <Button type="button" variant="ghost" className="h-8 text-xs">Save Draft</Button>
                <Button type="submit" className="h-8 bg-gradient-to-r from-primary to-accent text-primary-foreground font-black text-xs gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Broadcast Campaign
                </Button>
              </div>
            </form>
          </Panel>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-2 space-y-3">
          <Panel title="Live Mobile Preview" description="Render iOS lockscreen push card">
            <div className="relative aspect-[3/2] w-full rounded-2xl border border-border bg-[oklch(0.08_0.02_350)] p-4 flex flex-col justify-center items-center shadow-lg">
              <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(oklch(1 0 0 / 6%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 6%) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              
              <div className="relative z-10 w-full max-w-[240px] rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 shadow-2xl space-y-1 select-none animate-fade-in text-white/90">
                <div className="flex items-center justify-between text-[7px] text-white/50 uppercase tracking-widest font-black">
                  <span className="flex items-center gap-1"><Bell className="h-2 w-2 text-primary" /> Rideuu</span>
                  <span>now</span>
                </div>
                <div className="text-[10px] font-bold truncate">{getPreviewTitle() || "Notification Header"}</div>
                <div className="text-[8px] text-white/60 leading-normal line-clamp-2">{getPreviewMsg() || "Message Content..."}</div>
              </div>
              <span className="text-[8px] text-muted-foreground/60 font-mono mt-4 flex items-center gap-1"><Smartphone className="h-3 w-3" /> Chennai cell carrier lock emulation</span>
            </div>
          </Panel>
        </div>
      </div>

      {/* Coupon form and campaigns */}
      <div className="mt-4 grid gap-3 lg:grid-cols-5 items-start">
        {/* Coupon creation form */}
        <div className="lg:col-span-2">
          <Panel title="Promo Code Generator" description="Generate and geofence new discount coupons">
            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase block">Coupon Code</span>
                  <Input 
                    placeholder="e.g. CHENNAI100" 
                    value={code} 
                    onChange={e => setCode(e.target.value)}
                    className="h-8 bg-background uppercase font-mono text-xs font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase block">Discount amount</span>
                  <Input 
                    placeholder="e.g. Flat ₹50 Off or 15%" 
                    value={discount} 
                    onChange={e => setDiscount(e.target.value)}
                    className="h-8 bg-background text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase block">Geofenced zone</span>
                  <select 
                    value={zone} 
                    onChange={e => setZone(e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                  >
                    <option value="All Chennai zones">All Chennai zones</option>
                    <option value="Velachery & T. Nagar">Velachery & T. Nagar geofence</option>
                    <option value="OMR Geocells">OMR IT Corridor</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase block">Usage Cap</span>
                  <Input 
                    value={cap} 
                    onChange={e => setCap(e.target.value)}
                    className="h-8 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase block">Expiry Date</span>
                <Input 
                  value={expiry} 
                  onChange={e => setExpiry(e.target.value)}
                  className="h-8 bg-background"
                />
              </div>

              <Button type="submit" className="w-full h-8 bg-gradient-to-r from-primary to-accent text-primary-foreground font-black text-xs gap-1.5 mt-2">
                <Gift className="h-3.5 w-3.5" /> Generate Promo Code
              </Button>
            </form>
          </Panel>
        </div>

        {/* Campaign and Coupons Lists */}
        <div className="lg:col-span-3 space-y-3">
          <Panel title="Active Promo Codes Geofence" description="Active rewards and discount trackers">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-left">
                <thead>
                  <tr className="border-b border-border/80 text-[8px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5">Code</th>
                    <th>Discount</th>
                    <th>Zone</th>
                    <th>Cap</th>
                    <th>Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {coupons.map((c, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="py-3 font-mono font-bold text-primary">{c.code}</td>
                      <td>{c.discount}</td>
                      <td><Badge variant="outline" className="border-accent/30 text-accent text-[8px] py-0">{c.zone}</Badge></td>
                      <td>{c.cap}</td>
                      <td className="text-muted-foreground font-mono text-[10px]">{c.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Recent Broadcast Campaigns logs" description="Broadcast performance metrics">
            <ul className="divide-y divide-border/60">
              {campaigns.map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                  <div>
                    <div className="font-bold text-foreground truncate">{c.t}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">{c.a} · Channel: {c.channel}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge variant="outline" className="border-primary/40 text-primary text-[8px]">Dispatched {c.s}</Badge>
                    <Badge variant="outline" className="border-accent/40 text-accent text-[8px]">Open rate {c.o}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}