import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bike, MapPin, Star, ChevronDown, ChevronUp, Receipt,
  Printer, ShieldAlert, Check, RefreshCw, Loader2, ArrowRight, Clipboard
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppStore, store, translate } from "@/lib/store";
import { api } from "../../lib/api";

export const Route = createFileRoute("/app/trips")({
  head: () => ({ meta: [{ title: "Ride history · Rideuu" }] }),
  component: Trips,
});

function Trips() {
  const { language, theme, transactions, ride, token } = useAppStore();
  const navigate = useNavigate();

  // local simulation states
  const [activeTab, setActiveTab] = useState<"completed" | "upcoming" | "cancelled">("completed");
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [dbTrips, setDbTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // GST details form
  const [gstin, setGstin] = useState("");
  const [company, setCompany] = useState("");
  const [gstSubmitted, setGstSubmitted] = useState<string | null>(null);

  // Complaint resolver
  const [complaintText, setComplaintText] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("Overcharged");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState<string | null>(null);
  const [disputeSuccess, setDisputeSuccess] = useState<string | null>(null);
  const [complaintSuccess, setComplaintSuccess] = useState<string | null>(null);

  // Scheduled rides modification states
  const [modifyingTripId, setModifyingTripId] = useState<string | null>(null);
  const [modDate, setModDate] = useState("");
  const [modTime, setModTime] = useState("");
  const [modVehicle, setModVehicle] = useState<"bike" | "auto">("auto");
  const [updatingTrip, setUpdatingTrip] = useState<string | null>(null);

  const t = (key: string) => translate(key, language);

  const handleCancelScheduled = async (id: string) => {
    if (confirm("Are you sure you want to cancel this scheduled ride?")) {
      setUpdatingTrip(id);
      const res = await api.updateRide(id, { status: "CANCELLED" });
      if (res) {
        if (token) {
          const fresh = await api.getRides(token);
          if (fresh) setDbTrips(fresh);
        }
        store.addNotification({
          cat: "rides",
          title: "Scheduled Ride Cancelled",
          tamilTitle: "திட்டமிடப்பட்ட சவாரி ரத்து செய்யப்பட்டது",
          body: `Your scheduled ride (ID: ${id}) has been cancelled successfully.`,
          tamilBody: `உங்கள் திட்டமிடப்பட்ட சவாரி (ID: ${id}) வெற்றிகரமாக ரத்து செய்யப்பட்டது.`
        });
      }
      setUpdatingTrip(null);
    }
  };

  const handleSaveModified = async (id: string) => {
    setUpdatingTrip(id);
    const isBike = modVehicle === "bike";
    const price = isBike ? 45 : 82;
    const res = await api.updateRide(id, {
      scheduled_date: modDate,
      scheduled_time: modTime,
      vehicle_type: modVehicle,
      fare: price
    });
    if (res) {
      if (token) {
        const fresh = await api.getRides(token);
        if (fresh) setDbTrips(fresh);
      }
      store.addNotification({
        cat: "rides",
        title: "Scheduled Ride Modified",
        tamilTitle: "திட்டமிடப்பட்ட சவாரி மாற்றப்பட்டது",
        body: `Your scheduled ride (ID: ${id}) was updated to ${modDate} at ${modTime}.`,
        tamilBody: `உங்கள் திட்டமிடப்பட்ட சவாரி (ID: ${id}) மாற்றப்பட்டது.`
      });
      setModifyingTripId(null);
    }
    setUpdatingTrip(null);
  };

  useEffect(() => {
    if (token) {
      setLoading(true);
      api.getRides(token).then((res) => {
        if (res && Array.isArray(res)) {
          setDbTrips(res);
        }
        setLoading(false);
      });
    }
  }, [token, ride.step]);

  // Format database rides
  const formattedDbTrips = dbTrips.map((tr) => {
    const isBike = tr.vehicle_type === "bike" || tr.fare < 60;
    const vehicle = isBike ? "Bike" : "Auto";
    const dateStr = tr.ride_type === "SCHEDULED"
      ? `${tr.scheduled_date} at ${tr.scheduled_time}`
      : new Date(tr.created_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    return {
      id: String(tr.id),
      from: tr.pickup,
      to: tr.dropoff,
      date: dateStr,
      price: tr.fare,
      vehicle,
      rating: tr.rating_driver || 0,
      driver: tr.driver_name || (tr.ride_type === "SCHEDULED" ? "Assigned soon" : "Driver Partner"),
      base: Math.round(tr.fare * 0.8),
      tax: Math.round(tr.fare * 0.1),
      toll: Math.round(tr.fare * 0.1),
      status: tr.status
    };
  });

  const completedTrips = formattedDbTrips.filter((tr) => tr.status === "completed" || tr.status === "COMPLETED");
  const upcomingTrips = formattedDbTrips.filter((tr) =>
    ["pending", "accepted", "pickup", "otp", "trip", "SCHEDULED", "MATCHING_PENDING", "RIDER_ASSIGNED", "DRIVER_EN_ROUTE", "DRIVER_ARRIVED", "RIDE_STARTED"].includes(tr.status)
  );
  const cancelledTrips = formattedDbTrips.filter((tr) => tr.status === "cancelled" || tr.status === "CANCELLED");

  // Fallback to static data only if user is default guest with no db rides
  const isDefaultGuest = !token || store.getState().profile.name === "Chennai Traveler" || store.getState().profile.name === "";
  const finalCompleted = (completedTrips.length === 0 && isDefaultGuest) ? [
    { id: "trip1", from: "Marina Lighthouse", to: "T. Nagar · Pondy Bazaar", date: "Today · 6:42 PM", price: 82, vehicle: "Auto", rating: 5, driver: "Karthik Raja", base: 65, tax: 6.5, toll: 10.5, status: "completed" },
    { id: "trip2", from: "Chennai Central Station", to: "Anna Nagar · Tower Park", date: "Yesterday · 8:10 AM", price: 56, vehicle: "Bike", rating: 4, driver: "Srinivasan K", base: 45, tax: 4.5, toll: 6.5, status: "completed" },
    { id: "trip3", from: "Velachery Junction", to: "OMR Sholinganallur", date: "May 22 · 10:30 PM", price: 145, vehicle: "Auto", rating: 5, driver: "Selvam M", base: 120, tax: 12, toll: 13, status: "completed" },
    { id: "trip4", from: "Chennai Airport T1", to: "Adyar Flyover Junction", date: "May 18 · 1:15 AM", price: 220, vehicle: "Auto", rating: 5, driver: "Sathish Kumar", base: 180, tax: 18, toll: 22, status: "completed" },
  ] : completedTrips;

  const finalUpcoming = (upcomingTrips.length === 0 && ride.scheduledTime) ? [
    { id: "trip_sch", from: ride.pickup, to: ride.drop, date: ride.scheduledTime, price: ride.negotiatedPrice, vehicle: ride.vehicle === "bike" ? "Bike" : "Auto", rating: 0, driver: "Assigned soon", base: ride.basePrice, tax: 5, toll: 0, status: "pending" }
  ] : upcomingTrips;

  const finalCancelled = (cancelledTrips.length === 0 && ride.step === "cancelled") ? [
    { id: "trip_can", from: ride.pickup, to: ride.drop, date: "Today · Cancelled", price: 0, vehicle: ride.vehicle === "bike" ? "Bike" : "Auto", rating: 0, driver: "None", base: 0, tax: 0, toll: 0, status: "cancelled" }
  ] : (cancelledTrips.length === 0 && isDefaultGuest ? [
    { id: "trip_can_old", from: "T. Nagar Bazaar", to: "Besant Nagar Beach", date: "May 15 · Cancelled", price: 0, vehicle: "Auto", rating: 0, driver: "None", base: 0, tax: 0, toll: 0, status: "cancelled" }
  ] : cancelledTrips);

  const activeTripsList = activeTab === "completed"
    ? finalCompleted
    : activeTab === "upcoming"
      ? finalUpcoming
      : finalCancelled;

  const handleToggleExpand = (id: string) => {
    setExpandedTrip(expandedTrip === id ? null : id);
    setGstSubmitted(null);
    setDisputeSuccess(null);
    setComplaintSuccess(null);
  };

  const handleRebook = (from: string, to: string, vehicle: string) => {
    store.update((s) => {
      s.ride.pickup = from;
      s.ride.drop = to;
      s.ride.vehicle = vehicle.toLowerCase().includes("bike") ? "bike" : "auto";
      s.ride.step = "vehicle";
    });
    navigate({ to: "/app/book" });
  };

  const handlePrintReceipt = (trip: typeof completedTrips[number]) => {
    // Generate beautiful visual browser print mock popup
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Rideuu Official Tax Receipt</title>
            <style>
              body { font-family: sans-serif; padding: 30px; color: #333; line-height: 1.5; }
              .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              .logo span { color: #facc15; }
              .invoice-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
              .totals-table { width: 100%; border-collapse: collapse; margin-top: 25px; }
              .totals-table th, .totals-table td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; font-size: 13px; }
              .totals-table th { background: #f9f9f9; font-weight: bold; }
              .total-due { font-size: 16px; font-weight: bold; text-align: right; margin-top: 20px; }
              .footer { font-size: 10px; color: #777; text-align: center; margin-top: 50px; border-top: 1px solid #eee; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="logo">Namma<span>Ride</span></div>
            <div class="invoice-title">Official Ride Receipt & Tax Invoice</div>
            
            <div class="meta-row"><strong>Receipt No:</strong> NMR-INV-${trip.id.toUpperCase()}</div>
            <div class="meta-row"><strong>Date/Time:</strong> ${trip.date}</div>
            <div class="meta-row"><strong>Rider Partner:</strong> ${trip.driver} (${trip.vehicle})</div>
            <div class="meta-row"><strong>Pickup:</strong> ${trip.from}</div>
            <div class="meta-row"><strong>Dropoff:</strong> ${trip.to}</div>
            
            <table class="totals-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Base Fare Rate</td><td>₹${trip.base.toFixed(2)}</td></tr>
                <tr><td>Convenience Tax (GST 18%)</td><td>₹${trip.tax.toFixed(2)}</td></tr>
                <tr><td>Chennai Toll Charges</td><td>₹${trip.toll.toFixed(2)}</td></tr>
              </tbody>
            </table>
            
            <div class="total-due">TOTAL PAYABLE: ₹${trip.price.toFixed(2)}</div>
            
            <div class="footer">
              Rideuu customer ride invoice (frontend simulation). Thank you for traveling with us in Chennai!
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleSubmitGST = (id: string) => {
    if (!gstin || !company) return;
    setGstSubmitted(id);
    store.addNotification({
      cat: "payments",
      title: "GST Invoice Filed Successfully",
      tamilTitle: "ஜிஎஸ்டி ரசீது வெற்றிகரமாக தாக்கல் செய்யப்பட்டது",
      body: `Company invoice dispatched to ${store.getState().profile.email} for ride ${id.toUpperCase()}`,
      tamilBody: `உங்கள் மின்னஞ்சலுக்கு ஜிஎஸ்டி ரசீது அனுப்பப்பட்டது.`
    });
  };

  const handleDisputeRefund = async (id: string, amount: number) => {
    setIsSubmittingDispute(id);

    try {
      const profile = store.getState().profile;
      const activePhone = profile.phone || "+91 9876543210";
      const activeName = profile.name || "Adhithya";
      const customerObj = await api.getUserByPhone(activePhone, "customer", activeName);
      if (customerObj) {
        // 0. Update ride status to "refunded" in DB
        await api.updateRide(id, { status: "refunded" });

        // 1. Update wallet balance in DB
        const newBalance = customerObj.wallet_balance + amount;
        await api.updateUser(customerObj.id, { wallet_balance: newBalance });

        // 2. Create transaction record in DB
        await api.createTransaction({
          user: customerObj.id,
          title: `Refund: Ride ${id.toUpperCase()}`,
          amount: `+₹${amount.toFixed(2)}`,
          date: new Date().toDateString(),
          positive: true
        });

        // 3. Create Support Ticket in DB for record
        await api.createTicket({
          user: customerObj.id,
          subject: `Refund Request approved for Ride #${id}`,
          status: "resolved",
          date: new Date().toDateString(),
          chat: [{ sender: "customer", message: `Refund requested for ride #${id} due to ${selectedIssue}. Approved.`, time: new Date().toLocaleTimeString() }]
        });
      }

      // Update local store state
      store.update((s) => {
        s.wallet.balance += amount;
        s.transactions.unshift({
          id: "txn_ref_" + Date.now(),
          title: `Refund: Ride ${id.toUpperCase()}`,
          tamilTitle: `திரும்பப்பெறுதல்: சவாரி ${id.toUpperCase()}`,
          date: "Just now",
          amount,
          type: "in"
        });
        s.notifications.unshift({
          id: "notif_" + Date.now(),
          cat: "payments",
          title: "Trip Refund Credited Successfully",
          tamilTitle: "பயணத் தொகை திரும்பப்பெறப்பட்டது",
          body: `₹${amount} credited back to Namma Cash wallet due to '${selectedIssue}' dispute approval.`,
          tamilBody: `உங்கள் வாலட்டிற்கு ₹${amount} திரும்ப செலுத்தப்பட்டது.`,
          time: "now",
          unread: true
        });
      });

      setDisputeSuccess(id);
    } catch (err) {
      console.error("Dispute refund failed", err);
      alert("Failed to process dispute refund. Please check connection.");
    } finally {
      setIsSubmittingDispute(null);
    }
  };

  const handleFileComplaint = async (id: string, trip: any) => {
    if (!complaintText.trim()) return;
    setIsSubmittingDispute(id);
    try {
      const profile = store.getState().profile;
      const activePhone = profile.phone || "+91 9876543210";
      const activeName = profile.name || "Adhithya";
      const customerObj = await api.getUserByPhone(activePhone, "customer", activeName);
      if (customerObj) {
        await api.createTicket({
          user: customerObj.id,
          subject: `Complaint for ride #${id}: ${selectedIssue}`,
          status: "open",
          date: new Date().toDateString(),
          chat: [{ sender: "customer", message: complaintText, time: new Date().toLocaleTimeString() }]
        });

        store.addNotification({
          cat: "alerts",
          title: "Complaint Registered",
          tamilTitle: "புகார் பதிவு செய்யப்பட்டது",
          body: `Your complaint for ride #${id} is registered successfully.`,
          tamilBody: `சவாரி #${id} க்கான உங்கள் புகார் பதிவு செய்யப்பட்டது.`
        });

        setComplaintSuccess(id);
        setComplaintText("");
      }
    } catch (err) {
      console.error("Failed to file complaint", err);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmittingDispute(null);
    }
  };

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">

      {/* Header */}
      <header className="bg-secondary px-5 pt-12 pb-6 text-secondary-foreground">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("Your trips")}</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight">{t("Ride history")}</h1>
      </header>
      <div className="checkered-sm h-1.5 w-full" />

      {/* Tabs selectors completed, upcoming, cancelled */}
      <section className="px-4 pt-4">
        <div className="flex rounded-2xl border border-border bg-card p-1 shadow-sm font-bold text-xs">
          {[
            { id: "completed" as const, label: "Completed", count: finalCompleted.length },
            { id: "upcoming" as const, label: "Upcoming", count: finalUpcoming.length },
            { id: "cancelled" as const, label: "Cancelled", count: finalCancelled.length },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setExpandedTrip(null); }}
                className={`flex-1 rounded-xl py-2.5 text-center transition flex justify-center items-center gap-1 ${active ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black ${active ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Active List */}
      <div className="space-y-3 px-4 pt-4 text-xs font-semibold text-left">
        {activeTripsList.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground mx-auto">
              <Clipboard className="size-5" />
            </div>
            <h3 className="font-extrabold text-sm">No rides found</h3>
            <p className="text-[10px] text-muted-foreground">There are no history records in this category.</p>
          </div>
        ) : (
          activeTripsList.map((trip) => {
            const isExpanded = expandedTrip === trip.id;
            return (
              <article
                key={trip.id}
                className={`rounded-3xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? "border-primary/40 ring-1 ring-primary/10" : ""}`}
              >

                {/* Collapsed Header summary */}
                <div
                  onClick={() => handleToggleExpand(trip.id)}
                  className="p-4 cursor-pointer flex items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground font-black shadow-sm">
                      {trip.vehicle === "Bike" ? <Bike className="size-4.5" /> : <span className="text-xs">A</span>}
                    </div>
                    <div>
                      <div className="font-extrabold flex items-center gap-1.5 text-foreground">
                        {trip.to.split("·")[0]}
                        {trip.rating > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1 rounded">
                            <Star className="size-2 fill-amber-500 text-amber-500" /> {trip.rating}.0
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{trip.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {trip.price > 0 ? (
                        <div className="font-black text-sm text-foreground">₹{trip.price}</div>
                      ) : (
                        <div className="font-bold text-destructive">Cancelled</div>
                      )}
                      <div className="text-[9px] text-muted-foreground">{trip.vehicle}</div>
                    </div>
                    {isExpanded ? <ChevronUp className="size-4.5 text-muted-foreground" /> : <ChevronDown className="size-4.5 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded Invoice & Disputes Panel Details */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 px-4 py-5 space-y-5 animate-slide-up">

                    {/* Map checkpoints */}
                    <div className="space-y-3 rounded-2xl border border-border bg-card p-3 shadow-sm text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500" />
                        <span><strong>Pickup:</strong> {trip.from}</span>
                      </div>
                      <div className="ml-1 h-3 w-px border-l border-dashed border-border" />
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary" />
                        <span><strong>Dropoff:</strong> {trip.to}</span>
                      </div>
                    </div>

                    {/* Cost Invoice Breakdown */}
                    {trip.price > 0 && (
                      <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm space-y-2 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Base Ride Price</span>
                          <span>₹{trip.base.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Convenience Tax (GST 18%)</span>
                          <span>₹{trip.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Chennai City Toll Charges</span>
                          <span>₹{trip.toll.toFixed(2)}</span>
                        </div>

                        <div className="h-px bg-border pt-1" />

                        <div className="flex items-end justify-between font-black text-xs pt-1.5">
                          <span className="text-foreground flex items-center gap-1">
                            <Receipt className="size-3.5 text-primary" />
                            {trip.status === "completed" ? "Total Cost Paid" : "Total Estimated Cost"}
                          </span>
                          <span className="text-sm font-black text-primary">₹{trip.price.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Scheduled Ride controls */}
                    {trip.status.toUpperCase() === "SCHEDULED" && (
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-xs space-y-3">
                        <div className="font-extrabold text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                          <span>Scheduled Ride Management</span>
                          <span className="text-primary font-black animate-pulse">SCHEDULED</span>
                        </div>

                        {modifyingTripId === trip.id ? (
                          <div className="space-y-3 animate-fade-in">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <label className="block text-muted-foreground mb-1 font-bold">DATE</label>
                                <select
                                  value={modDate}
                                  onChange={(e) => setModDate(e.target.value)}
                                  className="w-full rounded-lg border border-border bg-background p-2 font-bold outline-none text-foreground"
                                >
                                  {Array.from({ length: 5 }).map((_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + i);
                                    const dStr = d.toDateString();
                                    return <option key={i} value={dStr}>{dStr}</option>;
                                  })}
                                </select>
                              </div>
                              <div>
                                <label className="block text-muted-foreground mb-1 font-bold">TIME</label>
                                <select
                                  value={modTime}
                                  onChange={(e) => setModTime(e.target.value)}
                                  className="w-full rounded-lg border border-border bg-background p-2 font-bold outline-none text-foreground"
                                >
                                  {["06:00 AM", "07:30 AM", "09:00 AM", "10:30 AM", "02:00 PM", "05:30 PM", "07:00 PM", "09:00 PM"].map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-muted-foreground mb-1 font-bold">VEHICLE</label>
                              <div className="flex gap-2 font-bold">
                                <button
                                  type="button"
                                  onClick={() => setModVehicle("bike")}
                                  className={`flex-1 rounded-lg border py-2 text-center transition ${modVehicle === "bike" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}
                                >
                                  Bike (₹45)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModVehicle("auto")}
                                  className={`flex-1 rounded-lg border py-2 text-center transition ${modVehicle === "auto" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}
                                >
                                  Auto (₹82)
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleSaveModified(trip.id)}
                                disabled={updatingTrip !== null}
                                className="flex-1 rounded-xl bg-primary px-3 py-2 text-[10px] font-black text-primary-foreground shadow flex items-center justify-center gap-1.5"
                              >
                                {updatingTrip === trip.id ? <Loader2 className="size-3.5 animate-spin" /> : "Save Changes"}
                              </button>
                              <button
                                onClick={() => setModifyingTripId(null)}
                                className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-[10px] font-bold text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setModifyingTripId(trip.id);
                                setModDate(trip.date.split(" at ")[0] || "Tomorrow");
                                setModTime(trip.date.split(" at ")[1] || "09:00 AM");
                                setModVehicle(trip.vehicle.toLowerCase().includes("bike") ? "bike" : "auto");
                              }}
                              className="flex-1 rounded-2xl border border-border bg-card py-3.5 shadow-sm hover:border-primary/20 active:scale-95 transition flex items-center justify-center gap-1.5 font-bold text-foreground"
                            >
                              Modify Ride
                            </button>
                            <button
                              onClick={() => handleCancelScheduled(trip.id)}
                              disabled={updatingTrip !== null}
                              className="flex-1 rounded-2xl bg-destructive py-3.5 text-destructive-foreground shadow active:scale-95 transition flex items-center justify-center gap-1.5 font-bold"
                            >
                              {updatingTrip === trip.id ? <Loader2 className="size-3.5 animate-spin" /> : "Cancel Ride"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {trip.status.toUpperCase() !== "SCHEDULED" && (
                      <>
                        {/* GST Invoice Request Form planning */}
                        {trip.price > 0 && (
                          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-xs space-y-2.5">
                            <div className="font-extrabold text-[10px] uppercase tracking-wider text-muted-foreground">GST Business Billing</div>

                            {gstSubmitted === trip.id ? (
                              <div className="rounded bg-emerald-500/10 p-2 text-center text-[10px] font-bold text-emerald-600 animate-scale-in">
                                ✓ Company GST Invoice dispatched to your mail successfully!
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground leading-normal">Enter business details to claim tax invoice credits.</p>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <input
                                    type="text"
                                    placeholder="GSTIN (e.g. 33AAAAA1111A1Z1)"
                                    value={gstin}
                                    onChange={(e) => setGstin(e.target.value)}
                                    className="rounded-lg border border-border bg-background p-2 outline-none text-foreground"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Company Name"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="rounded-lg border border-border bg-background p-2 outline-none text-foreground"
                                  />
                                </div>
                                <button
                                  onClick={() => handleSubmitGST(trip.id)}
                                  disabled={!gstin || !company}
                                  className="w-full rounded-lg bg-secondary py-2 text-[10px] font-black text-secondary-foreground disabled:opacity-50"
                                >
                                  Request Tax Invoice
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Complaint & Refund Resolver portal */}
                        {trip.price > 0 && (
                          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-xs space-y-2.5">
                            <div className="font-extrabold text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <ShieldAlert className="size-4 text-destructive animate-pulse" /> Support & Dispute Resolver
                            </div>

                            {disputeSuccess === trip.id ? (
                              <div className="rounded bg-emerald-500/10 p-2.5 text-center text-[10px] font-bold text-emerald-600 animate-scale-in">
                                ✓ Dispute Approved! ₹{trip.price} refund credited instantly back to your Namma Cash balance.
                              </div>
                            ) : complaintSuccess === trip.id ? (
                              <div className="rounded bg-emerald-500/10 p-2.5 text-center text-[10px] font-bold text-emerald-600 animate-scale-in">
                                ✓ Complaint Filed! Our support team has registered your ticket.
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                <p className="text-[10px] text-muted-foreground leading-normal">
                                  File a dispute or report driver irregularities. Valid dispute audits approve immediate refunds.
                                </p>

                                <label className="block text-[10px]">
                                  <span className="text-[9px] text-muted-foreground block mb-1">Select Issue Category</span>
                                  <select
                                    value={selectedIssue}
                                    onChange={(e) => setSelectedIssue(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background p-2.5 font-bold outline-none text-foreground"
                                  >
                                    <option value="Overcharged">Driver overcharged cash/UPI</option>
                                    <option value="Route">Severe route deviation or safety concern</option>
                                    <option value="Quality">Vehicle hygiene or poor driving</option>
                                  </select>
                                </label>

                                <textarea
                                  placeholder="Describe your dispute details..."
                                  value={complaintText}
                                  onChange={(e) => setComplaintText(e.target.value)}
                                  className="w-full rounded-lg border border-border bg-background p-2.5 h-16 outline-none text-[10px] resize-none text-foreground"
                                />

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDisputeRefund(trip.id, trip.price)}
                                    disabled={isSubmittingDispute !== null || !complaintText}
                                    className="flex-1 rounded-xl bg-destructive px-3 py-2 text-[10px] font-black text-destructive-foreground shadow hover:brightness-105 flex items-center justify-center gap-1.5 disabled:opacity-50"
                                  >
                                    {isSubmittingDispute === trip.id ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <>Request Wallet Refund</>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleFileComplaint(trip.id, trip)}
                                    disabled={!complaintText}
                                    className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-[10px] font-bold text-foreground disabled:opacity-50"
                                  >
                                    File Complaint
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Printable Receipt & Rebook */}
                        <div className="flex gap-2.5 text-xs font-bold pt-2">
                          <button
                            onClick={() => handlePrintReceipt(trip)}
                            className="flex-1 rounded-2xl border border-border bg-card py-3.5 shadow-sm hover:border-primary/20 active:scale-95 transition flex items-center justify-center gap-1.5 text-foreground"
                          >
                            <Printer className="size-4" /> Print Tax Receipt
                          </button>

                          <button
                            onClick={() => handleRebook(trip.from, trip.to, trip.vehicle)}
                            className="flex-1 rounded-2xl bg-secondary py-3.5 text-secondary-foreground shadow active:scale-95 transition flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="size-3.5" /> Rebook Ride
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}