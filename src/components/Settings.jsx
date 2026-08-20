import React, { useRef, useState, useEffect } from "react";
import { Download, Upload, FileSpreadsheet, ShieldAlert, Sparkles, Building } from "lucide-react";

export default function Settings({ 
  products, 
  setProducts, 
  clients, 
  setClients, 
  invoices, 
  setInvoices,
  bookings,
  setBookings,
  templates,
  setTemplates,
  businessDetails,
  setBusinessDetails,
  userRole
}) {
  const fileInputRef = useRef(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (businessDetails) {
      setProfileForm({
        name: businessDetails.name || "",
        email: businessDetails.email || "",
        phone: businessDetails.phone || "",
        address: businessDetails.address || ""
      });
    }
  }, [businessDetails]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setBusinessDetails(profileForm);
    alert("Business profile details successfully updated!");
  };

  // Helper to trigger download of string content
  const triggerDownload = (content, mimeType, filename) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export entire DB as JSON
  const handleExportJSON = () => {
    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      products,
      clients,
      invoices,
      bookings: bookings || [],
      templates: templates || [],
      businessDetails
    };
    const content = JSON.stringify(backupData, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    triggerDownload(content, "application/json", `stockflow_backup_${timestamp}.json`);
  };

  // Import JSON DB
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        if (!parsed.products || !parsed.clients || !parsed.invoices) {
          throw new Error("Invalid backup format. Missing core tables.");
        }

        const confirmRestore = window.confirm(
          "Warning: Importing this backup will overwrite your current inventory, clients, and invoice database. Do you wish to proceed?"
        );
        if (!confirmRestore) return;

        setProducts(parsed.products);
        setClients(parsed.clients);
        setInvoices(parsed.invoices);
        if (parsed.bookings && setBookings) setBookings(parsed.bookings);
        if (parsed.templates && setTemplates) setTemplates(parsed.templates);
        if (parsed.businessDetails) {
          setBusinessDetails(parsed.businessDetails);
        }

        alert("Database successfully restored from JSON backup!");
      } catch (err) {
        alert(`Failed to parse backup file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Helper to escape CSV fields
  const escapeCSV = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Export Products to CSV
  const handleExportProductsCSV = () => {
    const headers = ["ID", "Name", "SKU", "Condition", "Stock Quantity", "Selling Price", "Purchase Cost", "Description"];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.sku,
      p.condition || "Excellent",
      p.totalStock,
      p.sellingPrice,
      p.purchasePrice,
      p.description || ""
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    triggerDownload(csvContent, "text/csv;charset=utf-8;", "products_inventory.csv");
  };

  // Export Clients to CSV
  const handleExportClientsCSV = () => {
    const headers = ["ID", "Name", "Company", "Email", "Phone", "Address"];
    const rows = clients.map(c => [
      c.id,
      c.name,
      c.company || "",
      c.email,
      c.phone || "",
      c.address || ""
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    triggerDownload(csvContent, "text/csv;charset=utf-8;", "clients_directory.csv");
  };

  // Export Invoices to CSV
  const handleExportInvoicesCSV = () => {
    const headers = ["ID", "Invoice Number", "Client Name", "Client Company", "Invoice Date", "Total Value (INR)", "Payment Status", "Notes"];
    const rows = invoices.map(inv => [
      inv.id,
      inv.invoiceNumber,
      inv.clientName,
      inv.clientCompany || "",
      inv.invoiceDate,
      inv.totalAmount,
      inv.status,
      inv.notes || ""
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    triggerDownload(csvContent, "text/csv;charset=utf-8;", "sales_invoices_report.csv");
  };

  // Export Event Bookings to CSV
  const handleExportBookingsCSV = () => {
    if (!bookings) return;
    const headers = ["ID", "Client Name", "Email", "Phone", "Wedding Date", "Venue", "Status", "Total Budget (INR)", "Advance Paid (INR)"];
    const rows = bookings.map(b => [
      b.id,
      b.clientName,
      b.email || "",
      b.phone || "",
      b.weddingDate,
      b.venue,
      b.status,
      b.totalBudget,
      b.advancePaid
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    triggerDownload(csvContent, "text/csv;charset=utf-8;", "event_bookings_report.csv");
  };

  const handleResetToDefault = () => {
    const confirmReset = window.confirm(
      "Danger: This will delete all your local storage edits and restore the system to factory mock details. Continue?"
    );
    if (!confirmReset) return;
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Settings & Backups</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Backup database layers, customize invoice header info, and import backups.</p>
      </div>

      {/* 1. Custom Business Profile (Seller Details) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
          <Building size={18} className="text-indigo-600 dark:text-indigo-400" />
          Business Profile (Seller details on invoices)
        </h2>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company Name / Owner Name</label>
            <input
              type="text"
              required
              placeholder="e.g. StockFlow Solutions Ltd."
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. contact@business.com"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company Phone Number</label>
            <input
              type="text"
              required
              placeholder="e.g. +1 (555) 019-2834"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company Address</label>
            <input
              type="text"
              required
              placeholder="e.g. 100 Innovation Way, Tech District, New York, NY 10001"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none font-medium"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-3">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
              <Sparkles size={14} />
              Update Business Profile
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Upload size={18} className="text-indigo-600 dark:text-indigo-400" />
              JSON Database Backup
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Export all local records (stock counts, customer folders, and transaction logs) into a JSON backup. Import it later to restore data.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Download size={14} />
                Export Database
              </button>

              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-750 cursor-pointer transition-all">
                <Upload size={14} />
                Import Database
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Spreadsheets Exporter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <FileSpreadsheet size={18} className="text-emerald-600 dark:text-emerald-450" />
              Spreadsheet CSV Reports
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Download separate spreadsheet files for custom inventory accounting or sales report analysis.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {userRole !== "events" ? (
                <>
                  <button
                    onClick={handleExportProductsCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 dark:hover:border-emerald-900/30 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-750 transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    Products CSV
                  </button>
                  <button
                    onClick={handleExportClientsCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 dark:hover:border-emerald-900/30 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    Clients CSV
                  </button>
                  <button
                    onClick={handleExportInvoicesCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 dark:hover:border-emerald-900/30 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    Invoices CSV
                  </button>
                </>
              ) : (
                <button
                  onClick={handleExportBookingsCSV}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 dark:hover:border-emerald-900/30 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <Download size={13} />
                  Event Bookings CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger zone reset */}
        <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950/30 rounded-2xl p-6 shadow-sm md:col-span-2 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-red-750 dark:text-red-400 flex items-center gap-2 mb-1.5">
              <ShieldAlert size={16} />
              System Factory Reset
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Permanently wipe browser database buffers and load default direct sales mock details. This is irreversible.
            </p>
          </div>
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white font-semibold text-xs rounded-xl border border-red-200 dark:border-red-900/30 hover:border-red-600 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            Clear Database
          </button>
        </div>
      </div>
    </div>
  );
}
