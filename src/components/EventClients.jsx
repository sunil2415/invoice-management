import React, { useState, useRef, useEffect } from "react";
import qrCodeImage from "../assets/IMG_8423.jpeg";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  Sparkles,
  Users,
  Eye,
  Printer,
  Undo2,
  FileText,
  CreditCard
} from "lucide-react";

export default function EventClients({
  bookings,
  setBookings,
  templates = [],
  businessDetails = {},
  highlightedBookingId,
  setHighlightedBookingId
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  // Invoice view states
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'invoice'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState("classic"); // 'classic'

  // Form State
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    weddingDate: new Date().toISOString().split("T")[0],
    venue: "",
    totalBudget: 0,
    advancePaid: 0,
    notes: "",
    status: "Booked", // Booked, Completed, Cancelled
    subEvents: [] // Array of { name }
  });

  const highlightedRowRef = useRef(null);

  useEffect(() => {
    if (highlightedBookingId) {
      if (highlightedRowRef.current) {
        highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => {
        if (setHighlightedBookingId) setHighlightedBookingId(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [highlightedBookingId, setHighlightedBookingId]);

  const handleOpenAdd = () => {
    setEditingBooking(null);
    setFormData({
      clientName: "",
      email: "",
      phone: "",
      weddingDate: new Date().toISOString().split("T")[0],
      venue: "",
      totalBudget: 150000,
      advancePaid: 30000,
      notes: "",
      status: "Booked",
      subEvents: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({
      clientName: booking.clientName,
      email: booking.email || "",
      phone: booking.phone || "",
      weddingDate: booking.weddingDate,
      venue: booking.venue,
      totalBudget: booking.totalBudget,
      advancePaid: booking.advancePaid,
      notes: booking.notes || "",
      status: booking.status || "Booked",
      subEvents: booking.subEvents || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event booking?")) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      if (selectedBooking && selectedBooking.id === id) {
        setViewMode("list");
      }
    }
  };

  const handleToggleSubEvent = (tplName) => {
    const isChecked = formData.subEvents.some(se => se.name === tplName);
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        subEvents: prev.subEvents.filter(se => se.name !== tplName)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subEvents: [
          ...prev.subEvents,
          { name: tplName, date: prev.weddingDate, budget: 10000, notes: "" }
        ]
      }));
    }
  };

  const handleSubEventChange = (name, field, value) => {
    setFormData(prev => ({
      ...prev,
      subEvents: prev.subEvents.map(se => {
        if (se.name === name) {
          return { ...se, [field]: value };
        }
        return se;
      })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.venue.trim()) return;

    const totalBudgetNum = parseFloat(formData.totalBudget) || 0;
    const advancePaidNum = parseFloat(formData.advancePaid) || 0;

    if (editingBooking) {
      // Edit
      const updated = bookings.map(b => {
        if (b.id === editingBooking.id) {
          const uBooking = {
            ...b,
            clientName: formData.clientName,
            email: formData.email,
            phone: formData.phone,
            weddingDate: formData.weddingDate,
            venue: formData.venue,
            totalBudget: totalBudgetNum,
            advancePaid: advancePaidNum,
            notes: formData.notes,
            status: formData.status,
            subEvents: formData.subEvents
          };
          if (selectedBooking && selectedBooking.id === b.id) {
            setSelectedBooking(uBooking);
          }
          return uBooking;
        }
        return b;
      });
      setBookings(updated);
    } else {
      // Add
      const newBooking = {
        id: `evt_${Date.now()}`,
        clientName: formData.clientName,
        email: formData.email,
        phone: formData.phone,
        weddingDate: formData.weddingDate,
        venue: formData.venue,
        totalBudget: totalBudgetNum,
        advancePaid: advancePaidNum,
        notes: formData.notes,
        status: formData.status,
        subEvents: formData.subEvents
      };
      setBookings([...bookings, newBooking]);
    }
    setIsModalOpen(false);
  };

  const handleTogglePaymentStatus = (bookingId) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        // Fully clear or reset advance depending on budget
        const newAdvance = b.advancePaid === b.totalBudget ? 0 : b.totalBudget;
        const updatedBooking = { ...b, advancePaid: newAdvance };
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking(updatedBooking);
        }
        return updatedBooking;
      }
      return b;
    });
    setBookings(updated);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b =>
    b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* 1. LIST VIEW */}
      {viewMode === "list" && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
            <div>
              <h1 className="text-2xl font-bold text-slate-905 dark:text-slate-100 tracking-tight">Wedding Event Bookings</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Register wedding party details, collect advance deposits, and manage schedules.</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer self-start sm:self-auto active:scale-[0.98]"
            >
              <Plus size={18} />
              Book Wedding Event
            </button>
          </div>

          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
            <div className="relative w-full md:max-w-md">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by bride/groom name, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing {filteredBookings.length} of {bookings.length} wedding events
            </div>
          </div>

          {/* Bookings List Table */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-16 text-center">
              <Users size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-slate-550 dark:text-slate-400 font-bold text-sm">No weddings booked</p>
              <p className="text-xs  dark:text-slate-500 mt-1">Book a wedding party order to begin tracking advances.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405">
                      <th className="px-6 py-4.5">Client / Venue</th>
                      <th className="px-6 py-4.5">Wedding Date</th>
                      <th className="px-6 py-4.5">Rituals</th>
                      <th className="px-6 py-4.5 text-right">Total Deal</th>
                      <th className="px-6 py-4.5 text-right">Advance Paid</th>
                      <th className="px-6 py-4.5 text-right">Outstanding</th>
                      <th className="px-6 py-4.5">Status</th>
                      <th className="px-6 py-4.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-600 dark:text-slate-350 font-medium">
                    {filteredBookings.map((b) => {
                      const outstanding = b.totalBudget - b.advancePaid;
                      const subEventsList = b.subEvents || [];
                      const isHighlighted = b.id === highlightedBookingId;
                      return (
                        <tr
                          key={b.id}
                          ref={isHighlighted ? highlightedRowRef : null}
                          className={`transition-all duration-500 ${isHighlighted
                            ? "bg-indigo-100/60 dark:bg-indigo-900/40 ring-1 ring-indigo-400 dark:ring-indigo-500"
                            : "hover:bg-slate-50/30 dark:hover:bg-slate-850/10"
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-extrabold text-slate-900 dark:text-slate-100">{b.clientName}</div>
                              <div className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                <MapPin size={11} className="text-slate-405" />
                                <span>{b.venue}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar size={13} className="text-slate-400" />
                              <span>{formatDate(b.weddingDate)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {subEventsList.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {subEventsList.map((se, sIdx) => (
                                  <span key={sIdx} className="text-[9px] font-bold bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-605 dark:text-indigo-405 border border-indigo-100/40 dark:border-indigo-900/30 px-1.5 py-0.5 rounded">
                                    {se.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-405 italic">No sub-events</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-slate-150">
                            ₹{b.totalBudget.toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-right font-extrabold text-emerald-600 dark:text-emerald-450">
                            ₹{b.advancePaid.toLocaleString("en-IN")}
                          </td>
                          <td className={`px-6 py-4 text-right font-extrabold ${outstanding > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}`}>
                            ₹{outstanding.toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase
                              ${b.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-955/20 dark:text-emerald-450 dark:border-emerald-900/30"
                                : b.status === "Cancelled"
                                  ? "bg-red-50 text-red-705 border-red-100 dark:bg-red-955/20 dark:text-red-400 dark:border-red-900/30"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                setViewMode("invoice");
                              }}
                              className="p-2 bg-slate-100 dark:bg-slate-805 hover:bg-indigo-55 hover:text-indigo-600 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 rounded-xl transition-all cursor-pointer shadow-sm border border-slate-200/40 dark:border-slate-800"
                              title="View Invoice Sheet"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(b)}
                              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-55 hover:text-indigo-650 dark:hover:bg-indigo-955/40 text-slate-600 dark:text-slate-400 rounded-xl transition-all cursor-pointer shadow-sm border border-slate-200/40 dark:border-slate-800"
                              title="Edit Event Booking"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-400 rounded-xl transition-all cursor-pointer shadow-sm border border-slate-200/40 dark:border-slate-800"
                              title="Delete Event Booking"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. INVOICE VIEW */}
      {viewMode === "invoice" && selectedBooking && (() => {
        const outstandingAmount = selectedBooking.totalBudget - selectedBooking.advancePaid;
        const subEventsList = selectedBooking.subEvents || [];
        const isFullyPaid = outstandingAmount <= 0;

        return (
          <div className="space-y-6">
            {/* Invoice toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
              <button
                onClick={() => setViewMode("list")}
                className="text-xs text-indigo-605 hover:text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Undo2 size={14} /> Back to bookings list
              </button>

              <div className="flex gap-2.5">
                <button
                  onClick={() => handleTogglePaymentStatus(selectedBooking.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm border cursor-pointer active:scale-[0.98]
                    ${isFullyPaid
                      ? "bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/35 hover:bg-amber-100"
                      : "bg-emerald-600 hover:bg-emerald-505 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-emerald-650 dark:border-emerald-700 shadow-md"}`}
                >
                  <CreditCard size={13} />
                  {isFullyPaid ? "Reset Advance Paid" : "Mark as Fully Paid"}
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-205 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-750"
                >
                  <Printer size={13} />
                  Print Invoice
                </button>
              </div>
            </div>

            {/* Printable Container */}
            <div className="w-full">
              {/* CLASSIC TEMPLATE */}
              {activeTemplate === "classic" && (
                <div className="bg-amber-50/10 dark:bg-slate-900 border-2 border-slate-900/60 dark:border-slate-800 rounded p-6 sm:p-8 space-y-8 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 font-serif">
                  <div className="text-center space-y-1.5 pb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">{businessDetails?.name || "Rudra Wedding Solution"}</h2>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Bespoke Wedding Ceremonies & Planner Suite</p>
                    <div className="pt-4">
                      <p className="text-sm font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                        Invoice Number: INV-{100 + bookings.findIndex(b => b.id === selectedBooking.id)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between text-xs gap-10 pb-6 border-b border-double border-slate-900/50">
                    <div className="space-y-1.5 text-left flex-1">
                      <p className="font-bold uppercase tracking-wider mb-2  dark:text-slate-500">From</p>
                      <h4 className="text-lg font-bold uppercase tracking-widest  dark:text-slate-100">{businessDetails?.name || "Rudra Wedding Solution"}</h4>
                      {businessDetails?.phone && <p className="text-xs  font-semibold">{businessDetails.phone}</p>}
                      <p className="text-xs ">{businessDetails?.email || "Ankitch45601@gmail.com"}</p>
                      {businessDetails?.address && <p className="text-xs ">{businessDetails.address}</p>}
                      <div className="pt-4 space-y-1">
                        <p className="">Status: <span className="font-bold uppercase text-slate-900 dark:text-slate-100">{selectedBooking.status}</span></p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left sm:text-right flex-1">
                      <p className="font-bold uppercase tracking-wider mb-2  dark:text-slate-500">Billed To</p>
                      <p className="text-base font-bold  dark:text-slate-100">{selectedBooking.clientName}</p>
                      {selectedBooking.email && <p className="">{selectedBooking.email}</p>}
                      {selectedBooking.phone && <p className="">{selectedBooking.phone}</p>}
                      <div className="pt-2 flex flex-col sm:items-end">
                        <p className=" mt-1">Wedding Date: <span className="font-bold text-sm text-slate-900 dark:text-slate-100 dark:bg-amber-700/50 px-1.5 py-0.5 rounded">{formatDate(selectedBooking.weddingDate)}</span></p>
                        <p className=" mt-1">Venue: <span className="font-bold text-sm text-slate-900 dark:text-slate-100 dark:bg-amber-700/50 px-1.5 py-0.5 rounded">{selectedBooking.venue}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="space-y-2">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-900 dark:border-slate-800 font-bold uppercase text-[10px]">
                          <th className="py-2">Wedding ritual ritual</th>
                          <th className="py-2">Description Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-205 dark:divide-slate-800">
                        {subEventsList.map((se, idx) => (
                          <tr key={idx}>
                            <td className="py-3 font-bold">{se.name}</td>
                            <td className="py-3 italic">{se.notes || selectedBooking.notes || "No extra notes logged"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer: Terms and Calculations */}
                  <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-6 border-t border-double border-slate-900/50">
                    <div className="flex-1 flex gap-8 items-start">
                      <div className="flex-1">
                        <p className="text-sm font-bold uppercase tracking-wider mb-1.5">Terms & Conditions</p>
                        <ul className="text-xs list-disc list-inside space-y-1">
                          <li>Advance payment is non-refundable.</li>
                          <li>Balance amount must be paid before the main event.</li>
                          <li>All disputes are subject to local jurisdiction.</li>
                        </ul>
                      </div>
                      <div className="w-24 h-24 shrink-0 mt-1 bg-white p-1 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
                        <img
                          src={qrCodeImage}
                          alt="Payment QR Code"
                          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                        />
                      </div>
                    </div>

                    <div className="w-80 text-xs space-y-2.5">
                      <div className="flex justify-between">
                        <span className="italic">Contract Total Budget:</span>
                        <span>₹{selectedBooking.totalBudget.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-450">
                        <span className="italic">Advance Payment Paid:</span>
                        <span>₹{selectedBooking.advancePaid.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="border-t border-slate-900/60 dark:border-slate-800 pt-2.5 flex justify-between font-bold text-sm">
                        <span>Balance Due Payment:</span>
                        <span>₹{outstandingAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal dialog for adding/editing bookings */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
                {editingBooking ? "Modify Wedding Event Details" : "Book Wedding Event"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-405 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Client / Bride &amp; Groom Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riya & Amit Wedding"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-850 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500/50 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Wedding Date</label>
                  <input
                    type="date"
                    required
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-202 focus:border-indigo-500/50 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-202 focus:border-indigo-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Event Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="Booked">Booked</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Venue Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radisson Blu Resort, Udaipur"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Budget (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Advance Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalBudget}
                    required
                    value={formData.advancePaid}
                    onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none"
                  />
                </div>
              </div>



              {/* Sub-Events Selection Grid */}
              <div className="border border-slate-250 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-955/20 rounded-2xl p-4.5 space-y-3.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-455">Select rituals / sub-events</h4>
                  <span className="text-[10px] text-slate-400 font-bold">Check rituals to customize details</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {templates.map((tpl, tIdx) => {
                    const isChecked = formData.subEvents.some(se => se.name === tpl);
                    const currentSe = formData.subEvents.find(se => se.name === tpl);

                    return (
                      <div key={tIdx} className={`bg-white dark:bg-slate-900 border ${isChecked ? 'border-indigo-300 dark:border-indigo-600' : 'border-slate-200/80 dark:border-slate-800'} rounded-xl p-3 flex flex-col justify-center shadow-sm space-y-2 transition-colors`}>
                        <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-slate-800 dark:text-slate-200 select-none w-full">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSubEvent(tpl)}
                            className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-505 shrink-0"
                          />
                          <span>{tpl}</span>
                        </label>
                        {isChecked && (
                          <input
                            type="text"
                            placeholder={`Description for ${tpl}...`}
                            value={currentSe?.notes || ""}
                            onChange={(e) => handleSubEventChange(tpl, "notes", e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500/50"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-805 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-350 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {editingBooking ? "Save Changes" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
