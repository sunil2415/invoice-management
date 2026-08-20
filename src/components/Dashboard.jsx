import React, { useState } from "react";
import {
  Boxes,
  Users,
  FileText,
  AlertTriangle,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  IndianRupee,
  ShoppingCart,
  MoreHorizontal
} from "lucide-react";

export default function Dashboard({ products, clients, invoices, setActiveTab, onOpenNewInvoice }) {
  // Calculations
  const totalRevenue = invoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const inventoryValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.totalStock), 0);
  const unpaidCount = invoices.filter(inv => inv.status === "unpaid").length;

  const totalItemsSold = invoices.reduce((acc, inv) => {
    const qty = inv.items.reduce((sum, item) => sum + item.quantity, 0);
    return acc + qty;
  }, 0);

  // Alerts: Products with stock <= 3
  const lowStockAlerts = products.filter(p => p.totalStock <= (p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5));

  // Recent Sales Invoices
  const recentSales = [...invoices]
    .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
    .slice(0, 5);

  // --- Profit Calculations ---
  const [profitTab, setProfitTab] = useState("month");

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const calcProfit = (paidInvList) => {
    return paidInvList.reduce((sum, inv) => {
      const revenue = inv.totalAmount || 0;
      const cost = (inv.items || []).reduce((c, item) => {
        const product = products.find(p => p.id === item.productId || p.name === item.name);
        const purchasePrice = product ? (product.purchasePrice || 0) : 0;
        return c + purchasePrice * item.quantity;
      }, 0);
      return sum + (revenue - cost);
    }, 0);
  };

  const paidInvoicesAll = invoices.filter(inv => inv.status === "paid");

  const profitToday = calcProfit(paidInvoicesAll.filter(inv => inv.invoiceDate === todayStr));
  const profitWeek  = calcProfit(paidInvoicesAll.filter(inv => new Date(inv.invoiceDate) >= startOfWeek));
  const profitMonth = calcProfit(paidInvoicesAll.filter(inv => new Date(inv.invoiceDate) >= startOfMonth));
  const profitYear  = calcProfit(paidInvoicesAll.filter(inv => new Date(inv.invoiceDate) >= startOfYear));

  const profitMap = { today: profitToday, week: profitWeek, month: profitMonth, year: profitYear };
  const profitLabels = {
    today: "Today",
    week:  "This Week",
    month: "This Month",
    year:  "This Year"
  };
  const activeProfitValue = profitMap[profitTab];
  const isLoss = activeProfitValue < 0;

  // --- Analytics Chart Calculations ---
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Get max invoice date or fall back to today
  const validInvoiceDates = invoices
    .map(inv => inv.invoiceDate ? new Date(inv.invoiceDate) : null)
    .filter(d => d && !isNaN(d.getTime()));

  const referenceDate = validInvoiceDates.length > 0
    ? new Date(Math.max(...validInvoiceDates.map(d => d.getTime())))
    : new Date();

  // Generate 7 days ending at referenceDate
  const chartDays = [];
  const startRef = (referenceDate && !isNaN(referenceDate.getTime())) ? referenceDate : new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startRef);
    d.setDate(startRef.getDate() - i);
    if (!isNaN(d.getTime())) {
      chartDays.push(d.toISOString().split('T')[0]);
    } else {
      chartDays.push(new Date().toISOString().split('T')[0]);
    }
  }

  const isDemoData = invoices.length === 0;

  const mockChartData = [
    { formattedDate: "09. Mo.", dateLongStr: "Monday 9th May 2026", totalAmount: 1000, paidAmount: 800, invoiceCount: 1 },
    { formattedDate: "10. Tue.", dateLongStr: "Tuesday 10th May 2026", totalAmount: 15000, paidAmount: 12000, invoiceCount: 2 },
    { formattedDate: "11. Wed.", dateLongStr: "Wednesday 11th May 2026", totalAmount: 19000, paidAmount: 14000, invoiceCount: 1 },
    { formattedDate: "12. Thu.", dateLongStr: "Thursday 12th May 2026", totalAmount: 8241, paidAmount: 6000, invoiceCount: 3 },
    { formattedDate: "13. Fri.", dateLongStr: "Friday 13th May 2026", totalAmount: 2000, paidAmount: 1800, invoiceCount: 2 },
    { formattedDate: "14. Sat.", dateLongStr: "Saturday 14th May 2026", totalAmount: 5000, paidAmount: 4000, invoiceCount: 4 },
    { formattedDate: "15. Sun.", dateLongStr: "Sunday 15th May 2026", totalAmount: 8000, paidAmount: 6000, invoiceCount: 3 }
  ];

  const chartData = isDemoData ? mockChartData : chartDays.map(dateStr => {
    const dayInvoices = invoices.filter(inv => inv.invoiceDate === dateStr);
    const totalAmount = dayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = dayInvoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(year, month - 1, day);
    const dayNum = String(dateObj.getDate()).padStart(2, '0');
    const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
    const formattedDate = `${dayNum}. ${dayName}.`;

    const dateLongStr = dateObj.toLocaleDateString(undefined, { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    return {
      dateStr,
      formattedDate,
      dateLongStr,
      totalAmount,
      paidAmount,
      invoiceCount: dayInvoices.length
    };
  });

  // Calculate coordinates for SVG
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...chartData.map(d => Math.max(d.totalAmount, d.paidAmount)), 100);
  const roundedMaxVal = Math.max(Math.ceil(maxVal / 5000) * 5000, 20000); 
  const gridLevels = [0, 5000, 10000, 15000, 20000].filter(v => v <= roundedMaxVal);
  const formatYLabel = (val) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}k`;
    }
    return `${val}`;
  };

  const getCoords = (index, value) => {
    const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
    const y = paddingTop + (1 - value / roundedMaxVal) * chartHeight;
    return { x, y };
  };

  const getCurvePath = (data, key) => {
    if (data.length === 0) return "";
    const points = data.map((d, i) => getCoords(i, d[key]));
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const getAreaCurvePath = (data, key) => {
    if (data.length === 0) return "";
    const points = data.map((d, i) => getCoords(i, d[key]));
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = paddingTop + chartHeight;
    path += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    return path;
  };

  const invoicedPath = getCurvePath(chartData, "totalAmount");
  const invoicedAreaPath = getAreaCurvePath(chartData, "totalAmount");

  // --- Donut Chart Calculations ---
  const totalInvoicesCount = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === "paid");
  const unpaidInvoices = invoices.filter(inv => inv.status === "unpaid");

  const paidCount = paidInvoices.length;
  const unpaidCountVal = unpaidInvoices.length;

  const paidValSum = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const unpaidValSum = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalInvoicedVal = paidValSum + unpaidValSum;

  const donutPaidPercent = totalInvoicesCount === 0 
    ? 72 
    : totalInvoicedVal > 0 
      ? Math.round((paidValSum / totalInvoicedVal) * 100) 
      : 0;
  
  const donutUnpaidPercent = 100 - donutPaidPercent;

  const displayPaidSum = totalInvoicesCount === 0 ? 12800 : paidValSum;
  const displayUnpaidSum = totalInvoicesCount === 0 ? 5480 : unpaidValSum;
  const displayPaidCount = totalInvoicesCount === 0 ? 12 : paidCount;
  const displayUnpaidCount = totalInvoicesCount === 0 ? 4 : unpaidCountVal;

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Sales Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Real-time indicators of inventory levels, revenue growth, and customer transactions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md dark:hover:shadow-indigo-950/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-all">
              <IndianRupee size={22} />
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-1">
              <TrendingUp size={10} /> Paid
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-4">
            ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Total revenue collected</p>
        </div>

        {/* Total Items Sold */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md dark:hover:shadow-indigo-950/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-455 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-all">
              <ShoppingCart size={22} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-4">{totalItemsSold}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Total product units sold</p>
        </div>

        {/* Asset Value */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md dark:hover:shadow-indigo-950/20 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-650 dark:text-blue-400 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-all">
              <Boxes size={22} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-4">
            ₹{inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Total warehouse inventory cost</p>
        </div>

        {/* Unpaid Bills */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 hover:shadow-md dark:hover:shadow-indigo-950/20 transition-all duration-300 group
          ${unpaidCount > 0 
            ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10" 
            : "border-slate-200 dark:border-slate-800"}`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl transition-all
              ${unpaidCount > 0 
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
            >
              <Clock size={22} />
            </div>
            {unpaidCount > 0 && (
              <span className="text-[10px] font-bold text-amber-605 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-100/60 dark:bg-amber-950/40 animate-pulse">
                Pending Payment
              </span>
            )}
          </div>
          <p className={`text-2xl font-black mt-4 ${unpaidCount > 0 ? "text-amber-650 dark:text-amber-400" : "text-slate-900 dark:text-slate-100"}`}>{unpaidCount}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Unpaid customer invoices</p>
        </div>
      </div>

      {/* Profit Overview Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Icon + Label + Value */}
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl ${isLoss ? "bg-red-50 dark:bg-red-950/30 text-red-500" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"}`}>
              {isLoss ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Profit · {profitLabels[profitTab]}</p>
              <p className={`text-3xl font-black mt-0.5 ${isLoss ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {isLoss ? "-" : "+"}₹{Math.abs(activeProfitValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                Revenue minus cost of goods sold from paid invoices
              </p>
            </div>
          </div>

          {/* Right: Period Tabs + mini breakdown */}
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {["today", "week", "month", "year"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setProfitTab(tab)}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer capitalize
                    ${profitTab === tab
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  {tab === "today" ? "Today" : tab === "week" ? "Week" : tab === "month" ? "Month" : "Year"}
                </button>
              ))}
            </div>

            {/* Mini stat row */}
            <div className="flex gap-4 text-xs">
              {[
                { label: "Today",    val: profitToday },
                { label: "Week",     val: profitWeek  },
                { label: "Month",    val: profitMonth },
                { label: "Year",     val: profitYear  }
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{label}</p>
                  <p className={`font-black text-sm ${val < 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {val < 0 ? "-" : "+"}₹{Math.abs(val) >= 1000 ? `${(Math.abs(val)/1000).toFixed(1)}k` : Math.abs(val).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Line Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Line Chart</h2>
            </div>
            <div className="flex items-center gap-2">
              {isDemoData && (
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded text-[9px] border border-indigo-100 dark:border-indigo-900/50 font-bold uppercase tracking-wider">
                  Demo
                </span>
              )}
              <MoreHorizontal size={20} className="text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-400 transition-colors" />
            </div>
          </div>

          {/* Absolute Hover Tooltip matching the image popover */}
          <div className="relative w-full">
            {hoveredIndex !== null && (
              <div 
                className="absolute bg-slate-950 text-white px-4 py-2.5 rounded-2xl shadow-xl z-20 pointer-events-none -translate-x-1/2 -translate-y-full flex flex-col justify-center items-center text-center border border-slate-800"
                style={{
                  left: `${(getCoords(hoveredIndex, chartData[hoveredIndex].totalAmount).x / svgWidth) * 100}%`,
                  top: `${(getCoords(hoveredIndex, chartData[hoveredIndex].totalAmount).y / svgHeight) * 100 - 10}%`,
                  transition: "left 0.1s ease-out, top 0.1s ease-out"
                }}
              >
                <span className="font-extrabold text-[13px] tracking-wide block">
                  ₹{chartData[hoveredIndex].totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 whitespace-nowrap">
                  {chartData[hoveredIndex].dateLongStr || chartData[hoveredIndex].formattedDate}
                </span>
                {/* Pointing caret arrow at bottom */}
                <div className="absolute w-2.5 h-2.5 bg-slate-950 rotate-45 border-r border-b border-slate-800 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
              </div>
            )}

            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Gradient definition */}
              <defs>
                <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {gridLevels.map((val, idx) => {
                const y = paddingTop + (1 - val / roundedMaxVal) * chartHeight;
                return (
                  <g key={idx}>
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={svgWidth - paddingRight} 
                      y2={y} 
                      className="stroke-slate-100 dark:stroke-slate-800/80" 
                      strokeWidth={1.2} 
                    />
                    <text 
                      x={paddingLeft - 10} 
                      y={y + 3.5} 
                      textAnchor="end" 
                      className="fill-slate-400 dark:fill-slate-500 font-semibold text-[10px]"
                    >
                      {formatYLabel(val)}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              <path d={invoicedAreaPath} fill="url(#colorInvoiced)" />

              {/* Smooth Line Path */}
              <path 
                d={invoicedPath} 
                fill="none" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Hover guideline drop-down indicator */}
              {hoveredIndex !== null && (
                <line 
                  x1={getCoords(hoveredIndex, 0).x} 
                  y1={getCoords(hoveredIndex, chartData[hoveredIndex].totalAmount).y} 
                  x2={getCoords(hoveredIndex, 0).x} 
                  y2={paddingTop + chartHeight} 
                  stroke="#6366f1" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                  opacity={0.6}
                />
              )}

              {/* Interactive nodes and hover zones */}
              {chartData.map((d, idx) => {
                const coords = getCoords(idx, d.totalAmount);
                const isHovered = hoveredIndex === idx;

                return (
                  <g key={idx}>
                    {/* Broad hover target column area */}
                    <rect 
                      x={coords.x - chartWidth / (chartData.length * 2)} 
                      y={paddingTop} 
                      width={chartWidth / (chartData.length - 1)} 
                      height={chartHeight} 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* Render ring dot only when hovered to look clean like standard smooth line charts */}
                    {isHovered && (
                      <circle 
                        cx={coords.x} 
                        cy={coords.y} 
                        r={5.5} 
                        className="fill-white stroke-indigo-600 dark:fill-slate-900" 
                        strokeWidth={3} 
                      />
                    )}

                    {/* X Axis Day Labels */}
                    <text 
                      x={coords.x} 
                      y={svgHeight - 8} 
                      textAnchor="middle" 
                      className={`font-semibold text-[10px] transition-colors duration-150
                        ${isHovered ? "fill-indigo-600 dark:fill-indigo-400 font-bold" : "fill-slate-400 dark:fill-slate-500"}`}
                    >
                      {d.formattedDate}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Circular Donut Chart (1/3 width) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Payment Status</h2>
              <MoreHorizontal size={20} className="text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-slate-400 dark:text-slate-400 text-[11px] -mt-2 mb-6">
              Distribution of paid revenue vs pending bills.
            </p>
          </div>

          <div className="relative flex items-center justify-center py-4">
            <svg width="130" height="130" viewBox="0 0 100 100" className="transform -rotate-90">
              {/* Background grey circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="10"
              />
              {/* Paid segment (emerald) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray="251.3"
                strokeDashoffset={251.3 - (251.3 * donutPaidPercent) / 100}
                strokeLinecap="round"
              />
              {/* Unpaid segment (amber) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="10"
                strokeDasharray="251.3"
                strokeDashoffset={251.3 - (251.3 * donutUnpaidPercent) / 100}
                transform={`rotate(${(donutPaidPercent / 100) * 360} 50 50)`}
                strokeLinecap="round"
              />
            </svg>

            {/* Absolute Center Labels */}
            <div className="absolute text-center flex flex-col justify-center items-center">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tight">{donutPaidPercent}%</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Paid</span>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                <span className="text-slate-600 dark:text-slate-400">Paid ({displayPaidCount})</span>
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-bold">₹{displayPaidSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                <span className="text-slate-600 dark:text-slate-400">Unpaid ({displayUnpaidCount})</span>
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-bold">₹{displayUnpaidSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
              Recent Sales Transactions
            </h2>
            <button 
              onClick={() => setActiveTab("invoices")}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              View all invoices <ArrowRight size={14} />
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No sales invoices logged.</p>
              <button 
                onClick={onOpenNewInvoice}
                className="mt-3 text-xs bg-indigo-600 hover:bg-indigo-505 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Create Sales Invoice
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentSales.map(inv => {
                const totalItems = inv.items.reduce((s, i) => s + i.quantity, 0);
                const isPaid = inv.status === "paid";

                return (
                  <div 
                    key={inv.id}
                    className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/20 dark:hover:bg-slate-800/20 px-2 rounded-xl transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-slate-405 dark:text-slate-500 font-semibold">{inv.invoiceDate ? inv.invoiceDate.split("-").reverse().join("-") : ""}</span>
                      </div>
                      <h3 className="font-extrabold text-slate-950 dark:text-slate-100 text-sm mt-1">{inv.clientName}</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{totalItems} units sold</p>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">₹{inv.totalAmount.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500">Total Price</p>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider
                        ${isPaid 
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/50" 
                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450 border-amber-100 dark:border-amber-900/50"}`}
                      >
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-amber-500" />
            Inventory Alerts
          </h2>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1">
            {lowStockAlerts.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/20">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-3 animate-pulse">
                  <Boxes size={24} />
                </div>
                <p className="text-slate-655 dark:text-slate-200 text-xs font-bold">Stock levels optimal</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">All products have sufficient units in stock.</p>
              </div>
            ) : (
              lowStockAlerts.map(p => (
                <div 
                  key={p.id}
                  className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-250/20 dark:border-amber-900/30 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                      ${p.totalStock === 0 ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400" : "bg-amber-50 dark:bg-amber-955/40 text-amber-700 dark:text-amber-400"}`}
                    >
                      {p.totalStock} units left
                    </span>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">Current Stock</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setActiveTab("products")}
              className="w-full text-center py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Go to Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
