import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Boxes, 
  Users, 
  ShoppingCart, 
  Calendar,
  Settings,
  Menu, 
  X,
  PackageCheck,
  Sun,
  Moon,
  LogOut
} from "lucide-react";

export default function Navigation({ activeTab, setActiveTab, products = [], onLogout, userRole }) {
  const lowStockCount = products.filter(p => p.totalStock <= (p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5)).length;
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const menuItems = userRole === "events" 
    ? [
        { id: "dashboard", label: "Event Dashboard", icon: LayoutDashboard },
        { id: "event_clients", label: "Event Bookings", icon: Users },
        { id: "event_calendar", label: "Planners Calendar", icon: Calendar },
        { id: "event_templates", label: "Manage Event Services", icon: Boxes },
        { id: "settings", label: "Settings & Backups", icon: Settings },
      ]
    : [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "products", label: "Stock Inventory", icon: Boxes },
        { id: "clients", label: "Clients", icon: Users },
        { id: "invoices", label: "Sell Product", icon: ShoppingCart },
        { id: "calendar", label: "Sales Calendar", icon: Calendar },
        { id: "settings", label: "Settings & Backups", icon: Settings },
      ];

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="print:hidden md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <PackageCheck size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
            StockFlow
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
            {!isOpen && lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 border border-white dark:border-slate-900 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar (Mobile drawer + Desktop persistent) */}
      <aside
        className={`print:hidden fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/85 dark:border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 md:sticky md:h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/85 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <PackageCheck size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
              StockFlow
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group cursor-pointer
                  ${isActive 
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border-l-2 border-transparent"
                  }`}
              >
                <Icon 
                  size={18} 
                  className={`transition-colors duration-200 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200"}`} 
                />
                <span>{item.label}</span>
                {item.id === "products" && lowStockCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full border border-rose-100 dark:border-rose-900/30">
                    {lowStockCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/85 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 p-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                {userRole === "events" ? "AC" : "RW"}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {userRole === "events" ? "Event Portal" : "Admin Portal"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {userRole === "events" ? "Ankit Planner" : "Rudra Weddings"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-55 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 text-xs font-bold rounded-xl border border-rose-100 dark:border-rose-905/20 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
