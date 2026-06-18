import { ModuleKey } from "@/lib/inventoryMock";

type ImportModuleKey = Exclude<ModuleKey, "dashboard">;

export type ImportTemplate = {
  fileName: string;
  title: string;
  description: string;
  headers: string[];
  sampleRows: string[][];
  instructions: string[];
};

export const importTemplates: Record<ImportModuleKey, ImportTemplate> = {
  items: {
    fileName: "items-sample.csv",
    title: "Import Items",
    description: "Upload item masters including stock, reorder level, vendor, and location mapping.",
    headers: ["title", "sku", "category", "unit", "stock", "assignedQty", "reorderLevel", "vendorName", "locationName", "notes"],
    sampleRows: [
      ["Birch Plywood 18mm", "PLY-018", "Boards", "Sheets", "42", "6", "15", "Metro Build Supplies", "Central Yard", "Interior joinery stock"],
      ["Laminate Edge Band", "LME-022", "Finishing", "Rolls", "18", "2", "8", "Metro Build Supplies", "Workshop Rack A", "Matte walnut finish"],
    ],
    instructions: [
      "Download the sample file and keep the header row unchanged.",
      "Use existing vendor and location names for smoother demo mapping.",
      "Save the updated file as CSV and upload it here.",
    ],
  },
  vendors: {
    fileName: "vendors-sample.csv",
    title: "Import Vendors",
    description: "Upload supplier details including contact, phone, email, and trade category.",
    headers: ["number", "name", "contact", "phone", "email", "category", "address"],
    sampleRows: [
      ["VND-010", "Metro Build Supplies", "Aarav Singh", "+91 98765 11223", "orders@metrobuild.test", "General Materials", "12 Sector Market Road, Noida"],
      ["VND-011", "PanelCraft Timbers", "Nisha Khurana", "+91 98220 33344", "sales@panelcraft.test", "Timber and Boards", "91 Timber Lane, Gurugram"],
    ],
    instructions: [
      "Keep one vendor per row.",
      "Use a valid email format for clean demo data.",
      "Phone and category can be edited after import from the manage flyout.",
    ],
  },
  projects: {
    fileName: "projects-sample.csv",
    title: "Import Projects",
    description: "Upload project masters for tagging receipts, issues, and purchase orders.",
    headers: ["name", "code", "status", "location", "budget"],
    sampleRows: [
      ["Luxury Villa Fitout", "LVF-01", "Active", "Gurugram", "4200000"],
      ["Retail Joinery Rollout", "RJR-11", "Planning", "Delhi NCR", "2650000"],
    ],
    instructions: [
      "Project code should stay unique per row.",
      "Budget should be entered as a number without commas.",
      "Imported projects become available immediately in worker and PO forms.",
    ],
  },
  cutLists: {
    fileName: "cut-lists-sample.csv",
    title: "Import Cut Lists",
    description: "Upload project-linked cabinet rows that generate cabinet and production cut lists.",
    headers: ["projectName", "code", "itemName", "cabinetCategory", "cabinetSubtype", "inputUnit", "width", "height", "depth", "quantity", "interiorMaterial", "customMaterialName", "customMaterialThickness", "materialThickness", "doorThickness", "upperBottomCondition", "finishedMaterialThicknessM2", "lightValanceHeight", "backOption", "shelfQty", "shelfType", "slideType", "slideLength", "drawerQty", "drawerHeights", "status", "notes"],
    sampleRows: [
      ["North Tower Fitout", "B10", "Pantry base cabinet", "Base", "Standard", "in", "30", "34.5", "24", "2", "5/8 White Melamine", "", "0", "0.625", "0.75", "Regular / Visible Bottom", "0", "0", "fullBack", "0", "Fixed Shelf", "", "0", "0", "", "Ready", "Imported demo cabinet"],
      ["Riverside Villas", "U10", "Laundry upper shelf cabinet", "Upper", "Shelves", "in", "36", "40", "14", "1", "3/4 White Melamine", "", "0", "0.75", "0.75", "Light Valance", "0", "2", "fullBack", "2", "Adjustable Shelf - Pins", "", "0", "0", "", "Draft", "Imported upper shelf cabinet"],
      ["North Tower Fitout", "B12", "Three drawer base", "Base", "Drawer", "in", "30", "34.5", "24", "1", "Custom", "Black Birch Ply", "0.625", "0.625", "0.75", "Regular / Visible Bottom", "0", "0", "fullBack", "0", "Fixed Shelf", "undermount", "19.625", "3", "6, 9, 12", "Ready", "Imported drawer bank"],
    ],
    instructions: [
      "Use an existing project name so the cabinet row links to the project module.",
      "Cabinet category can be Base or Upper. Upper cut list formulas support Standard and Shelves.",
      "Cabinet subtype can be Standard, Shelves, Drawer, or Sink.",
      "For Drawer subtype, provide slideType, slideLength, drawerQty, and comma-separated drawerHeights.",
      "Use fullBack or noBack for the back option.",
    ],
  },
  workers: {
    fileName: "workers-sample.csv",
    title: "Import Workers",
    description: "Upload workforce records and link them to existing projects.",
    headers: ["name", "role", "phone", "projectName", "assignedMaterials"],
    sampleRows: [
      ["Rohit Yadav", "Site Supervisor", "+91 98989 11122", "Luxury Villa Fitout", "12"],
      ["Kabir Rana", "Carpenter", "+91 98111 22110", "Retail Joinery Rollout", "4"],
    ],
    instructions: [
      "Use project names that already exist in the system.",
      "Assigned materials can be zero if the worker is new.",
      "Phone numbers are optional for demo but help the client understand the flow.",
    ],
  },
  locations: {
    fileName: "locations-sample.csv",
    title: "Import Locations",
    description: "Upload store, warehouse, and site location records for receiving and stock allocation.",
    headers: ["name", "type", "manager", "capacity"],
    sampleRows: [
      ["Workshop Rack A", "Workshop Storage", "Imran Sheikh", "120"],
      ["Site Container 02", "Site Store", "Rohit Yadav", "65"],
    ],
    instructions: [
      "Create one row per storage location.",
      "Capacity should be entered as a numeric value.",
      "Imported locations can be used in item and receiving forms right away.",
    ],
  },
  purchaseOrders: {
    fileName: "purchase-orders-sample.csv",
    title: "Import Purchase Orders",
    description: "Upload PO headers with vendor, project tags, and compact line summaries for demo purposes.",
    headers: ["number", "vendorName", "orderedBy", "orderDate", "expectedDate", "projectName", "lines"],
    sampleRows: [
      ["PO-201", "Metro Build Supplies", "Aarav Singh", "2026-04-06", "2026-04-14", "Luxury Villa Fitout", "Birch Plywood 18mm|Plywood|Sheets|20|1650;Laminate Edge Band|Finishing|Rolls|12|450"],
      ["PO-202", "PanelCraft Timbers", "Nisha Khurana", "2026-04-07", "2026-04-16", "Luxury Villa Fitout", "Teak Veneer Sheet|Plywood|Sheets|15|2100"],
    ],
    instructions: [
      "Use existing vendor and project names.",
      "For lines, use the format Description|Category|Unit|Qty|Price separated by semicolons.",
      "Imported POs remain editable from the PO flyout.",
    ],
  },
  receiving: {
    fileName: "receiving-sample.csv",
    title: "Import Receipts",
    description: "Upload receipt logs against purchase orders with location and packing slip details.",
    headers: ["receiptNo", "poNumber", "receivedLocation", "receivedBy", "packingSlipImage", "date", "status", "notes"],
    sampleRows: [
      ["RCV-9101", "PO-201", "Warehouse", "Imran Sheikh", "packing-slip-5001.jpg", "2026-04-08", "Partial", "First plywood lot received"],
      ["RCV-9102", "PO-202", "Site", "Kabir Rana", "", "2026-04-09", "Received In Full", "All veneer sheets checked and stored"],
    ],
    instructions: [
      "Match the PO number to an existing purchase order.",
      "Received location should be Warehouse or Site.",
      "This import is useful for demoing backfilled receiving history.",
    ],
  },
};
