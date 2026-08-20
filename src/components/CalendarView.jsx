import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, User, Clock, Plus } from "lucide-react";

export default function CalendarView({ invoices, products, onBookForDate, setActiveTab, setHighlightedInvoiceId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayString, setSelectedDayString] = useState(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to format date YYYY-MM-DD
  const formatDateString = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Find sales invoices for a given date string (YYYY-MM-DD)
  const getSalesForDate = (dateStr) => {
    return invoices.filter(inv => inv.invoiceDate === dateStr);
  };

  // Calculate total revenue generated on a date
  const getRevenueForDate = (dateStr) => {
    const daySales = getSalesForDate(dateStr);
    return daySales.reduce((sum, s) => sum + s.totalAmount, 0);
  };

  // Calendar cells generation
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const selectedDateSales = getSalesForDate(selectedDayString);
  const selectedDateRevenue = getRevenueForDate(selectedDayString);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Sales Calendar</h1>
        <p className="text-slate-500 dark:text-slate-405 mt-1 text-sm">Track daily sales volume, monitor cash flows, and record new client transactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header controls */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                {monthNames[month]} {year}
              </h2>
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 border-t border-l border-slate-200/80 dark:border-slate-800 rounded-lg overflow-hidden">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[75px] md:min-h-[95px] bg-slate-50/50 dark:bg-slate-950/20 border-r border-b border-slate-200/80 dark:border-slate-800"
                    />
                  );
                }

                const dayStr = formatDateString(year, month, day);
                const daySales = getSalesForDate(dayStr);
                const dayRevenue = getRevenueForDate(dayStr);
                const isSelected = selectedDayString === dayStr;
                const isToday = new Date().toISOString().split('T')[0] === dayStr;

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => setSelectedDayString(dayStr)}
                    className={`min-h-[75px] md:min-h-[95px] p-2 border-r border-b border-slate-200/80 dark:border-slate-800 flex flex-col justify-between items-start transition-all relative outline-none cursor-pointer
                      ${isSelected
                        ? "bg-indigo-50/60 dark:bg-indigo-950/30 ring-1 ring-indigo-500/30"
                        : "hover:bg-slate-50/40 dark:hover:bg-slate-800/20 bg-white dark:bg-slate-900"}
                      ${isToday ? "bg-indigo-50/20 dark:bg-indigo-950/15" : ""}`}
                  >
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                        ${isToday ? "bg-indigo-600 text-white font-bold" : "text-slate-800 dark:text-slate-200"}
                        ${isSelected && !isToday ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100" : ""}`}
                    >
                      {day}
                    </span>

                    {/* Sales values right in day cells */}
                    {dayRevenue > 0 && (
                      <div className="w-full text-right mt-1.5">
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-450 block leading-tight">
                          ₹{Math.round(dayRevenue)}
                        </span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">
                          {daySales.length} {daySales.length === 1 ? "sale" : "sales"}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Details Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Sales Ledger for</span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 text-base">
                {new Date(selectedDayString).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
            </div>

            {/* Sales List for date */}
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {selectedDateSales.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">No transactions recorded</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Zero sales logged for this date.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800">
                    <span>Total Day Revenue:</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-450">₹{selectedDateRevenue.toFixed(2)}</span>
                  </div>

                  {selectedDateSales.map(s => {
                    const isPaid = s.status === "paid";
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (setActiveTab && setHighlightedInvoiceId) {
                            setHighlightedInvoiceId(s.id);
                            setActiveTab("invoices");
                          }
                        }}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 text-xs space-y-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 font-bold">{s.invoiceNumber}</span>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1 font-sans">
                              <User size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
                              {s.clientName}
                            </h4>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border
                            ${isPaid
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                              : "bg-amber-50 text-amber-650 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30"}`}
                          >
                            {s.status}
                          </span>
                        </div>

                        {/* Items Sold */}
                        <div className="space-y-1 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-2.5 shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Items Purchased</span>
                          {s.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] text-slate-700 dark:text-slate-400">
                              <span className="font-semibold line-clamp-1">{item.productName}</span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0 ml-2">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between text-[11px] font-bold text-slate-900 dark:text-slate-100 pt-1">
                          <span>Invoice Value:</span>
                          <span>₹{s.totalAmount.toFixed(2)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
