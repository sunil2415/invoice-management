import React, { useState } from "react";
import { Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";

export default function EventTemplates({ templates, setTemplates }) {
  const [newTemplate, setNewTemplate] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTemplate.trim()) return;
    if (templates.some(t => t.toLowerCase() === newTemplate.trim().toLowerCase())) {
      alert("This service or ritual template already exists.");
      return;
    }
    setTemplates([...templates, newTemplate.trim()]);
    setNewTemplate("");
  };

  const handleDelete = (templateName) => {
    if (window.confirm(`Are you sure you want to remove "${templateName}"? New bookings will not be able to choose it.`)) {
      setTemplates(templates.filter(t => t !== templateName));
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Event Services & Ritual Templates</h1>
        <p className="text-slate-500 dark:text-slate-405 mt-1 text-sm">
          Define standard wedding sub-events (e.g. Haldi, Sangeet) that can be checked and tracked during client bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Template Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm self-start">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-indigo-600 dark:text-indigo-400" />
            Add Custom Service
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ritual / Service Name</label>
              <input
                type="text"
                placeholder="e.g. Ring Ceremony"
                value={newTemplate}
                onChange={(e) => setNewTemplate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500/50 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Add Service Template
            </button>
          </form>
        </div>

        {/* Existing Templates Grid */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-650 dark:text-indigo-400" />
            Active Wedding Ritual Services
          </h2>

          {templates.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-xs font-semibold text-slate-500">No ritual templates defined. Bookings will fall back to general event description.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((tpl, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  <span>{tpl}</span>
                  <button
                    onClick={() => handleDelete(tpl)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-955/20 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
