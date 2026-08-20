import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Sparkles,
  Package
} from "lucide-react";

export default function Products({ products, setProducts }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    unit: "pcs",
    totalStock: 1,
    sellingPrice: 0,
    purchasePrice: 0,
    condition: "Excellent",
    description: "",
    lowStockThreshold: 5
  });

  const conditions = ["Brand New", "Excellent", "Good", "Fair", "Needs Maintenance"];
  const units = [
    { value: "pcs",  label: "Pieces (pcs)" },
    { value: "kg",   label: "Kilogram (kg)" },
    { value: "g",    label: "Gram (g)" },
    { value: "L",    label: "Litre (L)" },
    { value: "mL",   label: "Millilitre (mL)" },
    { value: "m",    label: "Metre (m)" },
    { value: "box",  label: "Box" },
    { value: "doz",  label: "Dozen" }
  ];
  const isWeightUnit = (u) => ["kg", "g", "L", "mL", "m"].includes(u);

  // Derived metrics
  const totalCostValue = products.reduce((sum, p) => sum + ((p.purchasePrice || 0) * p.totalStock), 0);
  const totalSalesValue = products.reduce((sum, p) => sum + ((p.sellingPrice || 0) * p.totalStock), 0);
  const totalItemsCount = products.reduce((sum, p) => sum + p.totalStock, 0);
  const potentialProfit = totalSalesValue - totalCostValue;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      unit: "pcs",
      totalStock: 10,
      sellingPrice: 100,
      purchasePrice: 70,
      condition: "Excellent",
      description: "",
      lowStockThreshold: 5
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      unit: product.unit || "pcs",
      totalStock: product.totalStock,
      sellingPrice: product.sellingPrice,
      purchasePrice: product.purchasePrice,
      condition: product.condition || "Excellent",
      description: product.description || "",
      lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold : 5
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product? This will remove it from inventory.")) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      // Edit
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formData.name,
            sku: formData.sku,
            unit: formData.unit || "pcs",
            totalStock: isWeightUnit(formData.unit) ? parseFloat(formData.totalStock) : parseInt(formData.totalStock, 10),
            sellingPrice: parseFloat(formData.sellingPrice),
            purchasePrice: parseFloat(formData.purchasePrice),
            condition: formData.condition,
            description: formData.description,
            lowStockThreshold: isWeightUnit(formData.unit) ? parseFloat(formData.lowStockThreshold) : parseInt(formData.lowStockThreshold, 10)
          };
        }
        return p;
      });
      setProducts(updated);
    } else {
      // Add
      const newProduct = {
        id: `prod_${Date.now()}`,
        name: formData.name,
        sku: formData.sku,
        unit: formData.unit || "pcs",
        totalStock: isWeightUnit(formData.unit) ? parseFloat(formData.totalStock) : parseInt(formData.totalStock, 10),
        sellingPrice: parseFloat(formData.sellingPrice),
        purchasePrice: parseFloat(formData.purchasePrice),
        condition: formData.condition,
        description: formData.description,
        lowStockThreshold: isWeightUnit(formData.unit) ? parseFloat(formData.lowStockThreshold) : parseInt(formData.lowStockThreshold, 10)
      };
      setProducts([newProduct, ...products]);
    }
    setIsModalOpen(false);
  };

  const getConditionColor = (cond) => {
    switch (cond) {
      case "Brand New":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      case "Excellent":
        return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
      case "Good":
        return "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30";
      case "Fair":
        return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      case "Needs Maintenance":
        return "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Stock Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Add, update, and manage your products stock quantities and sales prices.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Grid of Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Stock Units</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalItemsCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Inventory Valuation</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">₹{totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Potential Sales Yield</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-450 mt-1">₹{totalSalesValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Projected Profit</p>
          <p className="text-xl font-bold text-purple-650 dark:text-purple-400 mt-1">₹{potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Search Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products list grid or table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No products found matching your search</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try refining your keyword or add a new product to your inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/30 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Condition</th>
                  <th className="px-6 py-4">Selling Price</th>
                  <th className="px-6 py-4">Buy Price (Cost)</th>
                  <th className="px-6 py-4">Stock Quantity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-600 dark:text-slate-300">
                {filteredProducts.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                          {p.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-sm">{p.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getConditionColor(p.condition)}`}>
                          {p.condition || "Excellent"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">₹{(p.sellingPrice || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">₹{(p.purchasePrice || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full
                          ${p.totalStock === 0 
                            ? "bg-red-55 text-red-700 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30" 
                            : p.totalStock <= (p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5) 
                              ? "bg-amber-55 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" 
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"}`}
                        >
                          {p.totalStock} {p.unit || "pcs"} available
                        </span>
                        {p.totalStock <= (p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5) && p.totalStock > 0 && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                            ⚠️ Low Stock (Limit: {p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5})
                          </div>
                        )}
                        {p.totalStock === 0 && (
                          <div className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-1">
                            🚫 Out of Stock
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 bg-slate-100 hover:bg-red-50/10 dark:bg-slate-800 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                          title="Delete Product"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
                {editingProduct ? "Edit Product Details" : "Add New Stock Product"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony FX3 Camera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit Type</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none"
                  >
                    {units.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Stock ({formData.unit || "pcs"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={isWeightUnit(formData.unit) ? "0.001" : "1"}
                    required
                    value={formData.totalStock}
                    onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Sell Price (₹/{formData.unit || "pcs"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Buy Price (₹/{formData.unit || "pcs"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Alert Limit ({formData.unit || "pcs"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={isWeightUnit(formData.unit) ? "0.001" : "1"}
                    required
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Asset Condition</label>
                <select
                  required
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:border-indigo-500/50 outline-none"
                >
                  {conditions.map((cond) => (
                    <option key={cond} value={cond} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Description</label>
                <textarea
                  rows="3"
                  placeholder="Enter specifications, description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500/50 outline-none resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Register Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
