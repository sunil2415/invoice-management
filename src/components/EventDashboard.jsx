import React, { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Sparkles, 
  TrendingUp, 
  Clock,
  ArrowRight,
  Download,
  Filter
} from "lucide-react";

export default function EventDashboard({ bookings, setActiveTab }) {
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Get unique months list present in bookings for the dropdown filter (Format: YYYY-MM)
  const uniqueMonths = Array.from(
    new Set(
      bookings
        .map(b => b.weddingDate ? b.weddingDate.substring(0, 7) : null)
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a)); // Sort newest months first

  // Helper to format YYYY-MM into "Month Year" (e.g. "August 2026")
  const formatMonthName = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  // Filter bookings based on selectedMonth
  const filteredBookings = selectedMonth === "all"
    ? bookings
    : bookings.filter(b => b.weddingDate && b.weddingDate.startsWith(selectedMonth));

  // Financial calculations for active month/selection
  const totalBookings = filteredBookings.length;
  const totalBudget = filteredBookings.reduce((sum, b) => sum + (b.totalBudget || 0), 0);
  const totalAdvance = filteredBookings.reduce((sum, b) => sum + (b.advancePaid || 0), 0);
  const totalPending = totalBudget - totalAdvance;

  const advancePercentage = totalBudget > 0 
    ? Math.round((totalAdvance / totalBudget) * 100) 
    : 0;

  // Filter for upcoming active bookings (from current selections)
  const upcomingEvents = [...filteredBookings]
    .filter(b => b.status === "Booked")
    .sort((a, b) => new Date(a.weddingDate) - new Date(b.weddingDate))
    .slice(0, 5);

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      "Booking ID", 
      "Client Name", 
      "Wedding Date", 
      "Venue Address", 
      "Total Budget (INR)", 
      "Advance Paid (INR)", 
      "Outstanding Balance (INR)", 
      "Status",
      "Sub-Events Scheduled"
    ];

    const rows = filteredBookings.map(b => {
      const outstanding = b.totalBudget - b.advancePaid;
      const subEventsNames = (b.subEvents || []).map(se => `${se.name} (${se.date})`).join(" | ");
      return [
        b.id,
        b.clientName,
        b.weddingDate,
        b.venue,
        b.totalBudget,
        b.advancePaid,
        outstanding,
        b.status,
        subEventsNames || "None"
      ];
    });

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = selectedMonth === "all" ? "all_time" : selectedMonth;
    link.href = url;
    link.download = `wedding_planner_report_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Event Management Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Overview of wedding project bookings, advanced payments received, and outstanding vendor balances.
          </p>
        </div>
        
        {/* Controls block */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all cursor-pointer"
          >
            <Download size={14} />
            Export CSV Report
          </button>

          {/* Month selector dropdown */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl shadow-sm">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-700 dark:text-slate-200 outline-none border-none cursor-pointer pr-1"
            >
              <option value="all">All Months</option>
              {uniqueMonths.map(m => (
                <option key={m} value={m}>
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Booked Events */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-all">
              <Calendar size={22} />
            </div>
            <span className="text-[10px] font-semibold text-indigo-605 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30">
              Active Bookings
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-4">{totalBookings}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Total weddings booked</p>
        </div>

        {/* Total Budget booked */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 dark:bg-blue-955/30 text-blue-650 dark:text-blue-400 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-all">
              <IndianRupee size={22} />
            </div>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30">
              Contract Value
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-4">
            ₹{totalBudget.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Total revenue on books</p>
        </div>

        {/* Advanced received */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-all">
              <TrendingUp size={22} />
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-1">
              {advancePercentage}% Collected
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-4">
            ₹{totalAdvance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Total advances deposited</p>
        </div>

        {/* Outstanding amount */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group
          ${totalPending > 0 
            ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-955/5" 
            : "border-slate-200 dark:border-slate-800"}`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl transition-all
              ${totalPending > 0 
                ? "bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
            >
              <Clock size={22} />
            </div>
            {totalPending > 0 && (
              <span className="text-[10px] font-bold text-amber-650 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-105/60 dark:bg-amber-950/40 animate-pulse">
                Collect Balance
              </span>
            )}
          </div>
          <p className={`text-2xl font-black mt-4 ${totalPending > 0 ? "text-amber-600 dark:text-amber-455" : "text-slate-900 dark:text-slate-100"}`}>
            ₹{totalPending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Total outstanding to collect</p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Event Ledger (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-650 dark:text-indigo-400" />
              Upcoming Weddings Calendar Schedule
            </h2>
            <button
              onClick={() => setActiveTab("event_clients")}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              Book Wedding event <ArrowRight size={14} />
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No upcoming booked weddings found.</p>
              <button
                onClick={() => setActiveTab("event_clients")}
                className="mt-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Schedule Wedding Order
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingEvents.map((evt) => {
                const pendingAmount = evt.totalBudget - evt.advancePaid;
                return (
                  <div key={evt.id} className="py-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 first:pt-0 last:pb-0 hover:bg-slate-50/10 px-2 rounded-xl transition-all">
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{evt.clientName}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-indigo-600 dark:text-indigo-400" />
                          {new Date(evt.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-indigo-605 dark:text-indigo-400" />
                          {evt.venue}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                          ₹{evt.totalBudget.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                          ₹{evt.advancePaid.toLocaleString("en-IN")} advanced
                        </p>
                      </div>
                      {pendingAmount > 0 ? (
                        <span className="mt-1 text-[9px] font-bold text-amber-705 dark:text-amber-400 bg-amber-50 dark:bg-amber-955/20 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/30">
                          ₹{pendingAmount.toLocaleString("en-IN")} due
                        </span>
                      ) : (
                        <span className="mt-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                          Full Paid
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Advances vs Total Budget Circle (1/3 width) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Advances Payment Collection</h2>
            <p className="text-slate-400 dark:text-slate-400 text-[11px] mt-1">
              Calculates how much advanced amount is collected out of overall deal value.
            </p>
          </div>

          <div className="relative flex items-center justify-center py-6">
            <svg width="140" height="140" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#6366f1"
                strokeWidth="10"
                strokeDasharray="251.3"
                strokeDashoffset={251.3 - (251.3 * advancePercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            {/* Absolute Center Labels */}
            <div className="absolute text-center flex flex-col justify-center items-center">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                {advancePercentage}%
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Collected
              </span>
            </div>
          </div>

          <div className="space-y-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block"></span>
                <span className="text-slate-600 dark:text-slate-400">Total Advance Received</span>
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-bold">
                ₹{totalAdvance.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 block"></span>
                <span className="text-slate-600 dark:text-slate-400">Remaining Balance</span>
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-bold">
                ₹{totalPending.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
