import React, { useState, useEffect, useRef } from "react";
import qrCodeImage from "../assets/IMG_8423.jpeg";
import {
  Plus,
  Search,
  Eye,
  Printer,
  X,
  Trash2,
  Calendar,
  Sparkles,
  Undo2,
  FileText,
  CreditCard,
  ShoppingCart
} from "lucide-react";

export default function Invoices({
  invoices,
  setInvoices,
  products,
  setProducts,
  clients,
  businessDetails,
  invoiceViewConfig,
  setInvoiceViewConfig,
  highlightedInvoiceId,
  setHighlightedInvoiceId
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'view'
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const listRefs = useRef({});

  useEffect(() => {
    if (highlightedInvoiceId) {
      setViewMode("list");

      const scrollTimer = setTimeout(() => {
        if (listRefs.current[highlightedInvoiceId]) {
          listRefs.current[highlightedInvoiceId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      const clearTimer = setTimeout(() => {
        if (setHighlightedInvoiceId) setHighlightedInvoiceId(null);
      }, 10000); // 10 seconds highlight

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [highlightedInvoiceId, setHighlightedInvoiceId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Creation Form State
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    status: "paid", // "paid" or "unpaid"
    items: [], // { productId, productName, quantity, unitPrice }
    notes: ""
  });

  // Listen to shared routing configurations (like from calendar selections)
  useEffect(() => {
    if (invoiceViewConfig && invoiceViewConfig.viewMode === "create") {
      setViewMode("create");

      const newInvoiceDate = invoiceViewConfig.invoiceDate || new Date().toISOString().split('T')[0];

      setInvoiceForm(prev => ({
        ...prev,
        invoiceDate: newInvoiceDate,
        items: [] // Clear items draft for new bookings
      }));

      // Consume the shared view config
      setInvoiceViewConfig({ viewMode: "list", invoiceDate: "" });
    }
  }, [invoiceViewConfig, setInvoiceViewConfig]);

  // Handle product quantity change directly from list
  const isWeightUnit = (u) => ["kg", "g", "L", "mL", "m"].includes(u);

  const handleQtyChange = (product, valString) => {
    const useFloat = isWeightUnit(product.unit);
    const val = useFloat ? parseFloat(valString) : parseInt(valString, 10);
    let updatedItems = [...invoiceForm.items];
    const existingIdx = updatedItems.findIndex(item => item.productId === product.id);

    if (isNaN(val) || val <= 0) {
      // Remove from invoice items
      updatedItems = updatedItems.filter(item => item.productId !== product.id);
    } else {
      const quantity = Math.min(val, product.totalStock);
      if (existingIdx >= 0) {
        updatedItems[existingIdx].quantity = quantity;
        updatedItems[existingIdx].unit = product.unit || "pcs";
      } else {
        updatedItems.push({
          productId: product.id,
          productName: product.name,
          unit: product.unit || "pcs",
          quantity: quantity,
          unitPrice: product.sellingPrice || 0
        });
      }
    }

    setInvoiceForm(prev => ({ ...prev, items: updatedItems }));
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!invoiceForm.clientId) {
      alert("Please select a customer.");
      return;
    }
    if (invoiceForm.items.length === 0) {
      alert("Please specify a quantity for at least one product in the list below to sell.");
      return;
    }

    const client = clients.find(c => c.id === invoiceForm.clientId);
    const totalAmount = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Calculate sequential invoice number in ascending order starting from 100 (e.g., INV-0100, INV-0101...)
    const getNextInvoiceNumber = () => {
      if (!invoices || invoices.length === 0) return "INV-0100";
      const nums = invoices.map(inv => {
        const parts = (inv.invoiceNumber || "").split("-");
        const lastPart = parts[parts.length - 1];
        const parsed = parseInt(lastPart, 10);
        return isNaN(parsed) ? 0 : parsed;
      });
      const maxNum = Math.max(...nums, 99);
      return `INV-${String(maxNum + 1).padStart(4, "0")}`;
    };

    const newInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: getNextInvoiceNumber(),
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company || "Individual",
      invoiceDate: invoiceForm.invoiceDate,
      items: invoiceForm.items,
      totalAmount: totalAmount,
      status: invoiceForm.status,
      notes: invoiceForm.notes
    };

    // Deduct stock levels in products state permanently
    const updatedProducts = products.map(prod => {
      const lineItem = invoiceForm.items.find(item => item.productId === prod.id);
      if (lineItem) {
        return {
          ...prod,
          totalStock: prod.totalStock - lineItem.quantity
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    setInvoices([newInvoice, ...invoices]);
    setViewMode("list");

    setInvoiceForm({
      clientId: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      status: "paid",
      items: [],
      notes: ""
    });
  };

  const handleDeleteInvoice = (invoiceId) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const confirmRestore = window.confirm(
      "Deleting this invoice will restore the sold quantities back to product stock. Proceed?"
    );
    if (!confirmRestore) return;

    // Restore stock counts
    const updatedProducts = products.map(prod => {
      const lineItem = inv.items.find(item => item.productId === prod.id);
      if (lineItem) {
        return {
          ...prod,
          totalStock: prod.totalStock + lineItem.quantity
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    setInvoices(invoices.filter(i => i.id !== invoiceId));
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setViewMode("list");
    }
  };

  const handleTogglePaymentStatus = (invoiceId) => {
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const newStatus = inv.status === "paid" ? "unpaid" : "paid";
        const updated = { ...inv, status: newStatus };
        if (selectedInvoice && selectedInvoice.id === invoiceId) {
          setSelectedInvoice(updated);
        }
        return updated;
      }
      return inv;
    });
    setInvoices(updatedInvoices);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.clientCompany && inv.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Tab Header Toggle */}
      {viewMode === "list" && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Sales Invoices</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Issue new customer sales receipts, log payments, and track outstanding invoices.</p>
          </div>
          <button
            onClick={() => setViewMode("create")}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer self-start sm:self-auto"
          >
            <Plus size={18} />
            Sell Product
          </button>
        </div>
      )}

      {/* Mode Views */}
      {viewMode === "list" && (
        <>
          {/* List Search and Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:max-w-md">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by customer or invoice #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {["all", "paid", "unpaid"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl border capitalize transition-all cursor-pointer
                    ${statusFilter === st
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-900/55 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/40 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices List table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-20">
                <FileText size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-3.5" />
                <p className="text-slate-600 dark:text-slate-400 font-bold text-sm">No sales invoices found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create a new sale invoice to begin billing clients.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="px-6 py-4.5">Invoice #</th>
                      <th className="px-6 py-4.5">Client / Company</th>
                      <th className="px-6 py-4.5">Invoice Date</th>
                      <th className="px-6 py-4.5">Total Amount</th>
                      <th className="px-6 py-4.5">Payment Status</th>
                      <th className="px-6 py-4.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {filteredInvoices.map((inv) => {
                      const totalItems = inv.items.reduce((s, i) => s + i.quantity, 0);
                      const isPaid = inv.status === "paid";

                      return (
                        <tr
                          key={inv.id}
                          ref={(el) => (listRefs.current[inv.id] = el)}
                          className={`transition-colors ${highlightedInvoiceId === inv.id
                            ? "bg-indigo-50 dark:bg-indigo-900/40 ring-1 ring-indigo-500/50 shadow-inner"
                            : "hover:bg-slate-50/30 dark:hover:bg-slate-800/10"
                            }`}
                        >
                          <td className="px-6 py-4.5 font-mono font-bold text-slate-900 dark:text-slate-200 text-xs">{inv.invoiceNumber}</td>
                          <td className="px-6 py-4.5">
                            <div>
                              <div className="font-extrabold text-slate-900 dark:text-slate-100">{inv.clientName}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{inv.clientCompany}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                              <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                              <span>{formatDate(inv.invoiceDate)}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-1.5 font-semibold">
                              {totalItems} items sold
                            </div>
                          </td>
                          <td className="px-6 py-4.5 font-extrabold text-slate-950 dark:text-slate-100 text-base">
                            ₹{inv.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4.5">
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border
                              ${isPaid
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30 animate-pulse"}`}
                            >
                              {isPaid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setViewMode("view");
                              }}
                              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-55 hover:text-indigo-600 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 rounded-xl transition-all cursor-pointer shadow-sm border border-slate-200/40 dark:border-slate-800"
                              title="View Invoice Sheet"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-slate-605 dark:text-slate-400 rounded-xl transition-all cursor-pointer shadow-sm border border-slate-200/40 dark:border-slate-800"
                              title="Delete Invoice"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Creation Mode View */}
      {viewMode === "create" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
              Sell Product / Log Sales Invoice
            </h2>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-750 cursor-pointer transition-all shadow-sm"
            >
              View Sales History & Invoices
            </button>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Client Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Customer</label>
                <select
                  required
                  value={invoiceForm.clientId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none transition-all shadow-sm font-medium"
                >
                  <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Invoice Date</label>
                <input
                  type="date"
                  required
                  value={invoiceForm.invoiceDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none transition-all shadow-sm font-medium"
                />
              </div>

              {/* Payment Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Payment Status</label>
                <select
                  required
                  value={invoiceForm.status}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none transition-all shadow-sm font-medium"
                >
                  <option value="paid" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Paid</option>
                  <option value="unpaid" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Unpaid / Outstanding</option>
                </select>
              </div>
            </div>

            {/* Direct Product Table List with Quantities inputs */}
            <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Products List & Quantity Sold</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Type direct quantities below to add to bill</span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-x-auto border border-slate-200/80 dark:border-slate-800 shadow-sm">
                {products.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    No products available in stock. Add products under Stock Inventory first.
                  </div>
                ) : (
                  <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-extrabold uppercase tracking-wider text-[9px]">
                        <th className="px-5 py-3">Product Name</th>
                        <th className="px-5 py-3">SKU</th>
                        <th className="px-5 py-3 text-center">Available Stock</th>
                        <th className="px-5 py-3">Unit Price</th>
                        <th className="px-5 py-3 text-center w-36">Quantity to Sell</th>
                        <th className="px-5 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {products.map((p) => {
                        const lineItem = invoiceForm.items.find(item => item.productId === p.id);
                        const quantity = lineItem ? lineItem.quantity : 0;
                        const subtotal = quantity * (p.sellingPrice || 0);

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                            <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">{p.sku}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                                ${p.totalStock === 0
                                  ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                                  : p.totalStock <= (p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5)
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-transparent"}`}
                              >
                                {p.totalStock} {p.unit || "pcs"}
                              </span>
                              {p.totalStock <= (p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5) && p.totalStock > 0 && (
                                <span className="block text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                                  ⚠️ Low Stock
                                </span>
                              )}
                              {p.totalStock === 0 && (
                                <span className="block text-[9px] text-red-600 dark:text-red-400 font-bold mt-1">
                                  🚫 Out of Stock
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">₹{(p.sellingPrice || 0).toFixed(2)}/{p.unit || "pcs"}</td>
                            <td className="px-5 py-3.5 text-center">
                              <input
                                type="number"
                                min="0"
                                max={p.totalStock}
                                step={isWeightUnit(p.unit) ? "0.001" : "1"}
                                value={quantity || ""}
                                onChange={(e) => handleQtyChange(p, e.target.value)}
                                placeholder="0"
                                disabled={p.totalStock <= 0}
                                className="w-24 px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-center font-bold text-xs text-indigo-600 dark:text-indigo-400 focus:border-indigo-500/50 outline-none placeholder:text-slate-400"
                              />
                              {p.unit && p.unit !== "pcs" && (
                                <span className="text-[9px] text-slate-400 font-bold mt-0.5 block text-center">{p.unit}</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-slate-100">
                              ₹{subtotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Terms, Notes and Summary Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Transaction Notes</label>
                <textarea
                  rows="4"
                  placeholder="e.g. Card cleared successfully. Extended warranty terms apply..."
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none resize-none transition-all shadow-sm"
                />
              </div>

              {/* Estimate Calculator */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3.5">Invoice Value</h4>

                  <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Items count total:</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        {invoiceForm.items.reduce((s, i) => s + i.quantity, 0)} units
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4.5 mt-4.5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Amount Due</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      ₹{invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className="px-4.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Cancel Draft
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      Create Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Invoice Detail Sheet View */}
      {viewMode === "view" && selectedInvoice && (() => {
        const isPaid = selectedInvoice.status === "paid";
        const clientDetails = clients.find(c => c.id === selectedInvoice.clientId) || {};

        return (
          <div className="space-y-6">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
              <button
                onClick={() => setViewMode("list")}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Undo2 size={14} /> Back to invoices list
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTogglePaymentStatus(selectedInvoice.id)}
                  className={`px-4.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm border cursor-pointer active:scale-[0.98]
                    ${isPaid
                      ? "bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/35 hover:bg-amber-100"
                      : "bg-emerald-600 hover:bg-emerald-505 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-emerald-600 dark:border-emerald-700 shadow-md"}`}
                >
                  <CreditCard size={13} />
                  Mark as {isPaid ? "Unpaid" : "Paid"}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-750"
                >
                  <Printer size={13} />
                  Print Invoice
                </button>
                <button
                  onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  className="px-4.5 py-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-red-200 dark:border-red-900/50"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
            {/* CLASSIC TEMPLATE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-10 space-y-8 text-xs font-serif print:border-slate-400 print:p-0 print:m-0 text-slate-900 dark:text-slate-200 transition-all duration-200">
              <div className="text-center space-y-2 border-b-4 border-double border-slate-800 dark:border-slate-700 pb-6">
                <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-slate-100 font-serif">
                  {businessDetails.name || "STOCKFLOW SOLUTIONS"}
                </h2>
                <p className="italic dark:text-slate-400 font-serif text-xs">
                  {businessDetails.address} &bull; Email: {businessDetails.email} &bull; Tel: {businessDetails.phone}
                </p>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold tracking-widest text-slate-900 dark:text-slate-100 uppercase font-serif">SALES INVOICE</h3>
              </div>

              <div className="grid grid-cols-2 gap-8 border border-slate-300 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20 print:bg-white print:border-slate-400">
                <div className="space-y-1.5 font-serif border-r border-slate-250/60 dark:border-slate-800 pr-4 print:border-slate-300">
                  <p className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 border-b border-slate-250/60 dark:border-slate-800 pb-1 print:border-slate-300">From:</p>
                  <p className="font-black text-slate-900 dark:text-slate-100 text-sm font-serif">{businessDetails.name || "STOCKFLOW SOLUTIONS"}</p>
                  <p className="dark:text-slate-400 leading-normal font-serif">{businessDetails.address}</p>
                  <p className=" dark:text-slate-400 font-serif">Email: {businessDetails.email}</p>
                  <p className=" dark:text-slate-400 font-serif">Ph: {businessDetails.phone}</p>
                </div>
                <div className="space-y-1.5 font-serif">
                  <p className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 border-b border-slate-250/60 dark:border-slate-800 pb-1 print:border-slate-300">To:</p>
                  <p className="font-black text-slate-900 dark:text-slate-100 text-sm font-serif">{selectedInvoice.clientName}</p>
                  {selectedInvoice.clientCompany && (
                    <p className="font-bold text-slate-800 dark:text-slate-300 font-serif">{selectedInvoice.clientCompany}</p>
                  )}
                  <p className=" leading-normal font-serif">{clientDetails.address}</p>
                  {clientDetails.email && <p className="dark:text-slate-400 font-serif">Email: {clientDetails.email}</p>}
                  <p className=" dark:text-slate-400 font-serif">Ph: {clientDetails.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-2 border-b border-slate-200 dark:border-slate-850 pb-4 print:border-slate-300">
                <div className="space-y-1 font-serif">
                  <p><span className="font-bold text-slate-700 dark:text-slate-400 uppercase">Invoice Number:</span> <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{selectedInvoice.invoiceNumber}</span></p>
                </div>
                <div className="space-y-1 text-right font-serif">
                  <p><span className="font-bold dark:text-slate-404 uppercase">Date of Issue:</span> {formatDate(selectedInvoice.invoiceDate)}</p>
                  <p><span className="font-bold dark:text-slate-400 uppercase">Payment Status:</span> <span className="font-extrabold uppercase italic text-slate-900 dark:text-slate-200">{selectedInvoice.status}</span></p>
                </div>
              </div>

              <div className="space-y-2">
                <table className="w-full text-left border-collapse border border-slate-300 dark:border-slate-800 print:border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-305 font-bold uppercase tracking-wider border-b border-slate-300 dark:border-slate-800 print:bg-gray-100 print:border-slate-400">
                      <th className="border-r border-slate-300 dark:border-slate-800 px-4 py-2.5 print:border-slate-400 font-serif">Description of Goods</th>
                      <th className="border-r border-slate-300 dark:border-slate-800 px-4 py-2.5 text-center w-20 print:border-slate-400 font-serif">Qty</th>
                      <th className="border-r border-slate-300 dark:border-slate-800 px-4 py-2.5 text-right w-28 print:border-slate-400 font-serif">Unit Price</th>
                      <th className="px-4 py-2.5 text-right w-28 font-serif">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 dark:divide-slate-800 dark:text-slate-300">
                    {selectedInvoice.items.map((item, idx) => {
                      const subtotal = item.quantity * item.unitPrice;
                      return (
                        <tr key={idx} className="font-serif">
                          <td className="border-r border-slate-300 dark:border-slate-800 px-4 py-3 print:border-slate-400 font-bold">{item.productName}</td>
                          <td className="border-r border-slate-300 dark:border-slate-800 px-4 py-3 text-center print:border-slate-400">{item.quantity}</td>
                          <td className="border-r border-slate-300 dark:border-slate-800 px-4 py-3 text-right print:border-slate-400">₹{item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">₹{subtotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-6 border-t border-double border-slate-900/50 font-serif">
                <div className="flex-1 flex gap-8 items-start">
                  <div className="flex-1 space-y-2">
                    <p className="font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1.5">Declaration & Terms</p>
                    <p className="text-[10px] dark:text-slate-400 italic leading-relaxed pt-2">
                      {selectedInvoice.notes || "Goods once sold will not be taken back. Final settlement parameter details apply."}
                    </p>
                  </div>
                  <div className="w-24 h-24 shrink-0 mt-1 bg-white p-1 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
                    <img
                      src={qrCodeImage}
                      alt="Payment QR Code"
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end justify-end space-y-2 w-80">
                  <div className="w-full border-t-2 border-slate-900 dark:border-slate-700 pt-3 flex justify-between items-center text-xs font-bold">
                    <span className="uppercase text-slate-700 dark:text-slate-400">Subtotal:</span>
                    <span>₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full border-t border-b-4 border-double border-slate-900 dark:border-slate-700 py-2.5 flex justify-between items-center text-sm font-black">
                    <span className="uppercase text-slate-900 dark:text-slate-100">Net Amount:</span>
                    <span className="text-base text-slate-950 dark:text-slate-100">₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
