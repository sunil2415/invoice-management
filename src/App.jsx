import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Clients from "./components/Clients";
import Invoices from "./components/Invoices";
import CalendarView from "./components/CalendarView";
import Settings from "./components/Settings";
import Login from "./components/Login";
import EventDashboard from "./components/EventDashboard";
import EventClients from "./components/EventClients";
import EventCalendar from "./components/EventCalendar";
import EventTemplates from "./components/EventTemplates";

import { 
  getProducts, 
  saveProducts, 
  getClients, 
  saveClients, 
  getInvoices, 
  saveInvoices,
  getBusinessDetails,
  saveBusinessDetails,
  getEventBookings,
  saveEventBookings,
  getEventTemplates,
  saveEventTemplates,
  initializeStorage
} from "./utils/storage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || "sales";
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProductsState] = useState([]);
  const [clients, setClientsState] = useState([]);
  const [invoices, setInvoicesState] = useState([]);
  const [bookings, setBookingsState] = useState([]);
  const [templates, setTemplatesState] = useState([]);
  const [businessDetails, setBusinessDetailsState] = useState({ name: "", email: "", phone: "", address: "" });

  // Shared view config for Invoices tab to support calendar actions
  const [invoiceViewConfig, setInvoiceViewConfig] = useState({ viewMode: "list", invoiceDate: "" });
  const [highlightedBookingId, setHighlightedBookingId] = useState(null);
  const [highlightedInvoiceId, setHighlightedInvoiceId] = useState(null);

  // Initialize storage and state
  useEffect(() => {
    initializeStorage();
    setProductsState(getProducts());
    setClientsState(getClients());
    setInvoicesState(getInvoices());
    setBookingsState(getEventBookings());
    setTemplatesState(getEventTemplates());
    setBusinessDetailsState(getBusinessDetails());
  }, []);

  // Sync wrappers
  const setProducts = (newProducts) => {
    setProductsState(newProducts);
    saveProducts(newProducts);
  };

  const setClients = (newClients) => {
    setClientsState(newClients);
    saveClients(newClients);
  };

  const setInvoices = (newInvoices) => {
    setInvoicesState(newInvoices);
    saveInvoices(newInvoices);
  };

  const setBookings = (newBookings) => {
    setBookingsState(newBookings);
    saveEventBookings(newBookings);
  };

  const setTemplates = (newTemplates) => {
    setTemplatesState(newTemplates);
    saveEventTemplates(newTemplates);
  };

  const setBusinessDetails = (details) => {
    setBusinessDetailsState(details);
    saveBusinessDetails(details);
  };

  // Quick sell action from Calendar View
  const handleBookForDate = (dateStr) => {
    setInvoiceViewConfig({
      viewMode: "create",
      invoiceDate: dateStr
    });
    setActiveTab("invoices");
  };

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("sales");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        products={products} 
        onLogout={handleLogout} 
        userRole={userRole} 
      />
      
      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard route based on role */}
          {activeTab === "dashboard" && (
            userRole === "events" ? (
              <EventDashboard 
                bookings={bookings} 
                setActiveTab={setActiveTab} 
              />
            ) : (
              <Dashboard 
                products={products}
                clients={clients}
                invoices={invoices}
                setActiveTab={setActiveTab}
                onOpenNewInvoice={() => {
                  setInvoiceViewConfig({ viewMode: "create", invoiceDate: "" });
                  setActiveTab("invoices");
                }}
              />
            )
          )}

          {activeTab === "event_clients" && userRole === "events" && (
            <EventClients 
              bookings={bookings} 
              setBookings={setBookings} 
              templates={templates}
              businessDetails={businessDetails}
              highlightedBookingId={highlightedBookingId}
              setHighlightedBookingId={setHighlightedBookingId}
            />
          )}

          {activeTab === "event_calendar" && userRole === "events" && (
            <EventCalendar 
              bookings={bookings} 
              setActiveTab={setActiveTab}
              setHighlightedBookingId={setHighlightedBookingId}
            />
          )}

          {activeTab === "event_templates" && userRole === "events" && (
            <EventTemplates 
              templates={templates}
              setTemplates={setTemplates}
            />
          )}

          {activeTab === "products" && userRole === "sales" && (
            <Products 
              products={products}
              setProducts={setProducts}
            />
          )}

          {activeTab === "clients" && userRole === "sales" && (
            <Clients 
              clients={clients}
              setClients={setClients}
              invoices={invoices}
            />
          )}

          {activeTab === "invoices" && userRole === "sales" && (
            <Invoices 
              invoices={invoices}
              setInvoices={setInvoices}
              products={products}
              setProducts={setProducts}
              clients={clients}
              businessDetails={businessDetails}
              invoiceViewConfig={invoiceViewConfig}
              setInvoiceViewConfig={setInvoiceViewConfig}
              highlightedInvoiceId={highlightedInvoiceId}
              setHighlightedInvoiceId={setHighlightedInvoiceId}
            />
          )}

          {activeTab === "calendar" && userRole === "sales" && (
            <CalendarView 
              invoices={invoices}
              products={products}
              onBookForDate={handleBookForDate}
              setActiveTab={setActiveTab}
              setHighlightedInvoiceId={setHighlightedInvoiceId}
            />
          )}

          {activeTab === "settings" && (
            <Settings 
              userRole={userRole}
              products={products}
              setProducts={setProducts}
              clients={clients}
              setClients={setClients}
              invoices={invoices}
              setInvoices={setInvoices}
              bookings={bookings}
              setBookings={setBookings}
              templates={templates}
              setTemplates={setTemplates}
              businessDetails={businessDetails}
              setBusinessDetails={setBusinessDetails}
            />
          )}
        </div>
      </main>
    </div>
  );
}
