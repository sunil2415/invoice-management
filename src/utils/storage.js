import { INITIAL_PRODUCTS, INITIAL_CLIENTS, INITIAL_INVOICES } from "../data/mockData";

const KEYS = {
  PRODUCTS: "stock_mgmt_products",
  CLIENTS: "stock_mgmt_clients",
  INVOICES: "stock_mgmt_invoices",
  BUSINESS_DETAILS: "stock_mgmt_business_details",
  EVENT_BOOKINGS: "wedding_event_bookings",
  EVENT_TEMPLATES: "wedding_event_templates"
};

const DEFAULT_BUSINESS_DETAILS = {
  name: "StockFlow Solutions Ltd.",
  email: "sales@stockflow.co",
  phone: "+1 (555) 019-2834",
  address: "100 Innovation Way, Tech District, New York, NY 10001"
};

const DEFAULT_EVENT_TEMPLATES = [
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Wedding Ceremony",
  "Reception"
];

export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.CLIENTS)) {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
  }
  if (!localStorage.getItem(KEYS.INVOICES)) {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  } else {
    try {
      const invoices = JSON.parse(localStorage.getItem(KEYS.INVOICES)) || [];
      // If there are invoices, re-sequence them chronologically starting from 1 (INV-0001)
      if (invoices.length > 0) {
        const sortedInvoices = [...invoices].sort((a, b) => {
          const dateA = new Date(a.invoiceDate || 0);
          const dateB = new Date(b.invoiceDate || 0);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return (a.id || "").localeCompare(b.id || "");
        });

        const resequenced = sortedInvoices.map((inv, idx) => ({
          ...inv,
          invoiceNumber: `INV-${String(idx + 100).padStart(4, "0")}`
        }));

        // Restore to newest-first order for display
        const newestFirst = [...resequenced].sort((a, b) => {
          const dateA = new Date(a.invoiceDate || 0);
          const dateB = new Date(b.invoiceDate || 0);
          if (dateB.getTime() !== dateA.getTime()) {
            return dateB - dateA;
          }
          return (b.id || "").localeCompare(a.id || "");
        });

        localStorage.setItem(KEYS.INVOICES, JSON.stringify(newestFirst));
      }
    } catch (e) {
      console.error("Failed to migrate/re-sequence invoices", e);
    }
  }
  if (!localStorage.getItem(KEYS.BUSINESS_DETAILS)) {
    localStorage.setItem(KEYS.BUSINESS_DETAILS, JSON.stringify(DEFAULT_BUSINESS_DETAILS));
  }
  if (!localStorage.getItem(KEYS.EVENT_BOOKINGS)) {
    localStorage.setItem(KEYS.EVENT_BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.EVENT_TEMPLATES)) {
    localStorage.setItem(KEYS.EVENT_TEMPLATES, JSON.stringify(DEFAULT_EVENT_TEMPLATES));
  }
};

export const getProducts = () => {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || [];
  } catch (e) {
    console.error("Failed to parse products from localstorage", e);
    return [];
  }
};

export const saveProducts = (products) => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const getClients = () => {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.CLIENTS)) || [];
  } catch (e) {
    console.error("Failed to parse clients from localstorage", e);
    return [];
  }
};

export const saveClients = (clients) => {
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
};

export const getInvoices = () => {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.INVOICES)) || [];
  } catch (e) {
    console.error("Failed to parse invoices from localstorage", e);
    return [];
  }
};

export const saveInvoices = (invoices) => {
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
};

export const getBusinessDetails = () => {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.BUSINESS_DETAILS)) || DEFAULT_BUSINESS_DETAILS;
  } catch (e) {
    console.error("Failed to parse business details", e);
    return DEFAULT_BUSINESS_DETAILS;
  }
};

export const saveBusinessDetails = (details) => {
  localStorage.setItem(KEYS.BUSINESS_DETAILS, JSON.stringify(details));
};

export const getEventBookings = () => {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.EVENT_BOOKINGS)) || [];
  } catch (e) {
    console.error("Failed to parse event bookings", e);
    return [];
  }
};

export const saveEventBookings = (bookings) => {
  localStorage.setItem(KEYS.EVENT_BOOKINGS, JSON.stringify(bookings));
};

export const getEventTemplates = () => {
  initializeStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.EVENT_TEMPLATES)) || DEFAULT_EVENT_TEMPLATES;
  } catch (e) {
    console.error("Failed to parse event templates", e);
    return DEFAULT_EVENT_TEMPLATES;
  }
};

export const saveEventTemplates = (templates) => {
  localStorage.setItem(KEYS.EVENT_TEMPLATES, JSON.stringify(templates));
};
