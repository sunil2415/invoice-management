import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, User, Clock, Plus, Sparkles, MapPin } from "lucide-react";

export default function EventCalendar({ bookings, setActiveTab, setHighlightedBookingId }) {
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

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Find bookings scheduled on a given date (YYYY-MM-DD)
  const getBookingsForDate = (dateStr) => {
    const events = [];
    bookings.forEach(b => {
      // Main wedding ceremony date
      if (b.weddingDate === dateStr) {
        events.push({
          bookingId: b.id,
          clientName: b.clientName,
          venue: b.venue,
          eventName: "Wedding Main Ceremony",
          budget: b.totalBudget,
          notes: b.notes || "Main event"
        });
      }
    });
    return events;
  };

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const selectedDateEvents = getBookingsForDate(selectedDayString);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Wedding Planners Calendar</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Track wedding dates and manage location schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header controls */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600 dark:text-indigo-405" />
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
                const dayEvents = getBookingsForDate(dayStr);
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
                        ${isSelected && !isToday ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-105" : ""}`}
                    >
                      {day}
                    </span>

                    {/* Show rituals count in the day block */}
                    {dayEvents.length > 0 && (
                      <div className="w-full text-left mt-2">
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30 truncate block">
                          {dayEvents.length} Event{dayEvents.length > 1 ? "s" : ""}
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
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-505 tracking-wider">Scheduled Rituals for</span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 text-base">
                {new Date(selectedDayString).toLocaleDateString(undefined, { 
                  weekday: 'short', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h3>
            </div>

            {/* List of sub-events for the day */}
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">No rituals scheduled</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Zero events logged for this date.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {selectedDateEvents.map((evt, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        if (setHighlightedBookingId) setHighlightedBookingId(evt.bookingId);
                        if (setActiveTab) setActiveTab("event_clients");
                      }}
                      className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 text-xs space-y-2.5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30">
                            {evt.eventName}
                          </span>
                          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 mt-2 flex items-center gap-1">
                            <User size={12} className="text-slate-400 shrink-0" />
                            {evt.clientName}
                          </h4>
                        </div>
                      </div>

                      {/* Venue and Budgets */}
                      <div className="space-y-1.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-2.5 shadow-sm text-[11px]">
                        <div className="flex items-center gap-1 text-slate-505">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{evt.venue}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 dark:text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>Allocated budget:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">₹{evt.budget.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {evt.notes && (
                        <p className="text-[10px] text-slate-500 italic mt-1.5 font-medium">
                          Notes: {evt.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              Daily event ledger synchronized automatically.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
