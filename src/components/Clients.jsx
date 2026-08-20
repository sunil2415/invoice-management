import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  UserPlus,
  Sparkles,
  Users
} from "lucide-react";

export default function Clients({ clients, setClients, invoices }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: ""
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      company: client.company || "",
      email: client.email,
      phone: client.phone || "",
      address: client.address || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    // Check if client has active rental invoices
    const activeClientLeases = invoices.some(inv => 
      inv.clientId === id && (inv.status === "active" || inv.status === "overdue")
    );

    if (activeClientLeases) {
      alert("Cannot delete this client because they currently have active or overdue gear rental invoices. Return their items first.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this client?")) {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClient) {
      // Edit
      const updated = clients.map(c => {
        if (c.id === editingClient.id) {
          return {
            ...c,
            name: formData.name,
            company: formData.company,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          };
        }
        return c;
      });
      setClients(updated);
    } else {
      // Add
      const newClient = {
        id: `cli_${Date.now()}`,
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      setClients([...clients, newClient]);
    }
    setIsModalOpen(false);
  };

  // Helper to count invoices for client
  const getClientInvoiceStats = (clientId) => {
    const clientInvoices = invoices.filter(inv => inv.clientId === clientId);
    const active = clientInvoices.filter(inv => inv.status === "active" || inv.status === "overdue").length;
    const completed = clientInvoices.filter(inv => inv.status === "returned").length;
    return { total: clientInvoices.length, active, completed };
  };

  // Filter clients
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Client Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Register new clients and view their rental history and open balances.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer self-start sm:self-auto active:scale-[0.98]"
        >
          <UserPlus size={18} />
          Add Client
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {filteredClients.length} of {clients.length} clients
        </div>
      </div>

      {/* Clients Card List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-16 text-center">
          <Users size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No clients registered</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add details for a customer to begin generating rental invoices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredClients.map(c => {
            const stats = getClientInvoiceStats(c.id);
            return (
              <div 
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md dark:hover:shadow-indigo-950/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Title Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base">{c.name}</h3>
                      {c.company && (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600/80 dark:text-indigo-405 mt-0.5 font-semibold">
                          <Briefcase size={12} />
                          <span>{c.company}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Stats Badges */}
                    <div className="text-right">
                      {stats.active > 0 ? (
                        <span className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/30">
                          {stats.active} Active Leases
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-405 px-2 py-0.5 rounded">
                          No Leases
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

                  {/* Contact Info */}
                  <div className="space-y-2 text-xs text-slate-650 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <a href={`mailto:${c.email}`} className="hover:text-slate-900 dark:hover:text-white truncate hover:underline">{c.email}</a>
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-start gap-2.5">
                        <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{c.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Operations */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-5">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Historic Invoices: <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.total}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all cursor-pointer"
                      title="Delete Profile"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
                {editingClient ? "Modify Client Info" : "Register New Client"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Productions"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. sarah@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Billing / Delivery Address</label>
                <textarea
                  rows="2"
                  placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {editingClient ? "Update Client" : "Register Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
