export type ModuleKey =
  | "dashboard"
  | "items"
  | "vendors"
  | "projects"
  | "cutLists"
  | "workers"
  | "locations"
  | "purchaseOrders"
  | "receiving";

export type ItemRecord = {
  id: string;
  title: string;
  sku: string;
  category: string;
  unit: string;
  stock: number;
  assignedQty: number;
  reorderLevel: number;
  vendorId: string;
  locationId: string;
  notes: string;
  updatedAt: string;
};

export type VendorRecord = {
  id: string;
  number: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  category: string;
  address: string;
  updatedAt: string;
};

export type ProjectAreaRecord = {
  id: string;
  areaName: string;
  areaCode: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  code: string;
  customerName: string;
  siteAddress: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  projectDate: string;
  preparedBy: string;
  status: string;
  location: string;
  budget: number;
  notes: string;
  areas: ProjectAreaRecord[];
  updatedAt: string;
};

export type CutListRecord = {
  id: string;
  projectId: string;
  areaId: string;
  code: string;
  itemName: string;
  cabinetCategory: "Base" | "Upper" | "Tower / Tall" | "Open";
  cabinetSubtype: "Standard" | "Shelves" | "Drawer" | "Sink";
  cabinetUse:
    | "standardBaseCabinet"
    | "shelvingCabinet"
    | "drawerBank"
    | "sinkCabinet"
    | "upperStandardCabinet"
    | "upperShelvingCabinet"
    | "unsupportedCabinet";
  inputUnit: "in" | "mm";
  width: number;
  height: number;
  depth: number;
  quantity: number;
  interiorMaterial: string;
  customMaterialName: string;
  customMaterialThickness: number;
  materialThickness: number;
  doorThickness: number;
  bumperAllowance: number;
  finishedSides: "Front" | "Front and Back";
  upperBottomCondition: "Regular / Visible Bottom" | "Finished Bottom" | "Light Valance";
  finishedMaterialThicknessM2: number;
  lightValanceHeight: number;
  backOption: "fullBack" | "noBack";
  shelfQty: number;
  shelfType: "Fixed Shelf" | "Adjustable Shelf - Pins" | "Adjustable Shelf - Pilasters";
  shelfFinish: string;
  slideType: "ballBearing" | "undermount" | "";
  slideLength: number;
  drawerQty: number;
  drawerHeights: number[];
  status: "Draft" | "Ready" | "Issued";
  notes: string;
  updatedAt: string;
};

export type WorkerRecord = {
  id: string;
  name: string;
  role: string;
  phone: string;
  projectId: string;
  assignedMaterials: number;
  updatedAt: string;
};

export type LocationRecord = {
  id: string;
  name: string;
  type: string;
  manager: string;
  capacity: number;
  updatedAt: string;
};

export type PurchaseOrderRecord = {
  id: string;
  number: string;
  vendorId: string;
  status: string;
  orderDate: string;
  expectedDate: string;
  projectId: string;
  orderedBy: string;
  lines: Array<{
    description: string;
    category: string;
    sku: string;
    unit: string;
    qty: number;
    price: number;
  }>;
  updatedAt: string;
};

export type ReceiptRecord = {
  id: string;
  receiptNo: string;
  poId: string;
  receivedLocation: string;
  receivedBy: string;
  packingSlipImage: string;
  date: string;
  status: string;
  notes: string;
  lines: Array<{
    sku: string;
    orderedQty: number;
    receivedQty: number;
    qtyOnPackingSlip: number;
    damagedQty: number;
  }>;
  updatedAt: string;
};

export type MovementRecord = {
  id: string;
  itemId: string;
  type: "Issue" | "Return" | "Waste" | "Adjust" | "Receipt";
  qty: number;
  target: string;
  note: string;
  date: string;
};

export type RecordsState = {
  items: ItemRecord[];
  vendors: VendorRecord[];
  projects: ProjectRecord[];
  cutLists: CutListRecord[];
  workers: WorkerRecord[];
  locations: LocationRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  receiving: ReceiptRecord[];
  movements: MovementRecord[];
};

export type AuthUser = {
  name: string;
  email: string;
  role: string;
};

export const STORAGE_KEY = "key-point-mvp-state-v2";
export const THEME_KEY = "key-point-theme-v1";
export const AUTH_KEY = "key-point-auth-v1";

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export const categoryPrefixMap: Record<string, string> = {
  Glue: "GLU",
  Plywood: "PLY",
  Metal: "MTL",
  Concrete: "CEM",
  Steel: "STL",
  Electrical: "ELE",
  Finishing: "FIN",
  Timber: "TMB",
};

export const purchaseOrderCategories = Object.keys(categoryPrefixMap);

export function getSkuPrefix(category: string) {
  const fallbackPrefix = category
    .trim()
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return (
    categoryPrefixMap[category] ??
    (fallbackPrefix || "SKU")
  );
}

export function generateNextNumber(prefix: string, values: string[]) {
  const max = values.reduce((highest, value) => {
    const numeric = Number(value.replace(/\D/g, ""));
    return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function generateProjectJobNumber(projectName: string, existingCodes: string[]) {
  const initials = projectName
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z0-9]/gi, "").charAt(0))
    .join("")
    .toUpperCase();
  const prefix = initials || "PRJ";
  const matcher = new RegExp(`^${prefix}-(\\d+)$`, "i");
  const max = existingCodes.reduce((highest, code) => {
    const match = code.match(matcher);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function getCabinetCodePrefix(
  category: CutListRecord["cabinetCategory"],
  subtype: CutListRecord["cabinetSubtype"]
) {
  if (category === "Base") {
    if (subtype === "Shelves") return "BS";
    if (subtype === "Drawer") return "BD";
    if (subtype === "Sink") return "BSK";
    return "B";
  }
  if (category === "Upper") {
    return subtype === "Shelves" ? "US" : "U";
  }
  if (category === "Tower / Tall") return "T";
  if (category === "Open") return "O";
  return "CAB";
}

export function generateNextCabinetCode(prefix: string, existingCodes: string[]) {
  const matcher = new RegExp(`^${prefix}-?(\\d+)$`, "i");
  const max = existingCodes.reduce((highest, code) => {
    const match = code.match(matcher);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function generateSku(category: string, existingSkus: string[]) {
  const prefix = getSkuPrefix(category);
  const max = existingSkus.reduce((highest, sku) => {
    if (!sku.startsWith(`${prefix}-`)) {
      return highest;
    }
    const numeric = Number(sku.slice(prefix.length + 1));
    return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
  }, 100);
  return `${prefix}-${max + 1}`;
}

export function seedRecords(): RecordsState {
  return {
    vendors: [
      {
        id: "vendor-1",
        number: "VND-001",
        name: "Metro Build Supplies",
        contact: "Aarav Singh",
        phone: "+91 98765 11223",
        email: "orders@metrobuild.test",
        category: "General Materials",
        address: "12 Sector Market Road, Noida",
        updatedAt: "2026-04-06T09:15:00.000Z",
      },
      {
        id: "vendor-2",
        number: "VND-002",
        name: "Prime Electricals",
        contact: "Riya Mehta",
        phone: "+91 99887 66554",
        email: "sales@primeelectricals.test",
        category: "Electrical",
        address: "44 Industrial Estate, Gurugram",
        updatedAt: "2026-04-05T12:40:00.000Z",
      },
      {
        id: "vendor-3",
        number: "VND-003",
        name: "Stonecraft Aggregates",
        contact: "Dev Khanna",
        phone: "+91 98110 90909",
        email: "dispatch@stonecraft.test",
        category: "Concrete and Aggregates",
        address: "8 Crusher Zone, Faridabad",
        updatedAt: "2026-04-04T07:20:00.000Z",
      },
    ],
    projects: [
      {
        id: "project-1",
        name: "North Tower Fitout",
        code: "NTF-24",
        customerName: "Crescent Developments",
        siteAddress: "Noida Sector 94, Tower A",
        addressLine1: "Tower A",
        addressLine2: "Noida Sector 94",
        city: "Noida",
        state: "Uttar Pradesh",
        zipCode: "",
        projectDate: "2026-04-06",
        preparedBy: "Aarav Meena",
        status: "Active",
        location: "Noida Sector 94",
        budget: 4600000,
        notes: "Lobby reception and admin office millwork package.",
        areas: [
          {
            id: "area-1",
            areaName: "Reception",
            areaCode: "REC",
            notes: "Front desk, printer counter, and upper storage run.",
            createdAt: "2026-04-06T10:45:00.000Z",
            updatedAt: "2026-04-06T10:45:00.000Z",
          },
          {
            id: "area-2",
            areaName: "Admin Pantry",
            areaCode: "PAN",
            notes: "Confirm appliance clearances before final issue.",
            createdAt: "2026-04-06T10:45:00.000Z",
            updatedAt: "2026-04-06T10:45:00.000Z",
          },
        ],
        updatedAt: "2026-04-06T10:45:00.000Z",
      },
      {
        id: "project-2",
        name: "Riverside Villas",
        code: "RSV-12",
        customerName: "Riverside Estates",
        siteAddress: "Gurugram Extension, Villa Cluster",
        addressLine1: "Villa Cluster",
        addressLine2: "Gurugram Extension",
        city: "Gurugram",
        state: "Haryana",
        zipCode: "",
        projectDate: "2026-04-05",
        preparedBy: "Neha Chauhan",
        status: "Active",
        location: "Gurugram Extension",
        budget: 7200000,
        notes: "Villa pantry and upper shelving scope.",
        areas: [
          {
            id: "area-3",
            areaName: "Villa Pantry",
            areaCode: "VP",
            notes: "Sink base and wall shelves.",
            createdAt: "2026-04-05T16:20:00.000Z",
            updatedAt: "2026-04-05T16:20:00.000Z",
          },
        ],
        updatedAt: "2026-04-05T16:20:00.000Z",
      },
      {
        id: "project-3",
        name: "Warehouse Retrofit",
        code: "WHR-08",
        customerName: "Faridabad Logistics",
        siteAddress: "Faridabad Yard, Warehouse 2",
        addressLine1: "Warehouse 2",
        addressLine2: "Faridabad Yard",
        city: "Faridabad",
        state: "Haryana",
        zipCode: "",
        projectDate: "2026-04-03",
        preparedBy: "Imran Sheikh",
        status: "Planning",
        location: "Faridabad Yard",
        budget: 2150000,
        notes: "Planning stage. Areas will be added after site measurement.",
        areas: [],
        updatedAt: "2026-04-03T11:30:00.000Z",
      },
    ],
    cutLists: [
      {
        id: "cut-1",
        projectId: "project-1",
        areaId: "area-1",
        code: "B1",
        itemName: "Reception base cabinet",
        cabinetCategory: "Base",
        cabinetSubtype: "Standard",
        cabinetUse: "standardBaseCabinet",
        inputUnit: "in",
        width: 30,
        height: 30.5,
        depth: 24,
        quantity: 2,
        interiorMaterial: "5/8 White Melamine",
        customMaterialName: "",
        customMaterialThickness: 0,
        materialThickness: 0.625,
        doorThickness: 0.75,
        bumperAllowance: 0.125,
        finishedSides: "Front",
        upperBottomCondition: "Regular / Visible Bottom",
        finishedMaterialThicknessM2: 0,
        lightValanceHeight: 0,
        backOption: "fullBack",
        shelfQty: 0,
        shelfType: "Fixed Shelf",
        shelfFinish: "White",
        slideType: "",
        slideLength: 0,
        drawerQty: 0,
        drawerHeights: [],
        status: "Ready",
        notes: "Standard base run for lobby reception.",
        updatedAt: "2026-04-06T12:15:00.000Z",
      },
      {
        id: "cut-2",
        projectId: "project-1",
        areaId: "area-1",
        code: "B2",
        itemName: "Printer cabinet with adjustable shelf",
        cabinetCategory: "Base",
        cabinetSubtype: "Shelves",
        cabinetUse: "shelvingCabinet",
        inputUnit: "in",
        width: 36,
        height: 34.5,
        depth: 24,
        quantity: 1,
        interiorMaterial: "3/4 White Melamine",
        customMaterialName: "",
        customMaterialThickness: 0,
        materialThickness: 0.75,
        doorThickness: 0.75,
        bumperAllowance: 0.125,
        finishedSides: "Front",
        upperBottomCondition: "Regular / Visible Bottom",
        finishedMaterialThicknessM2: 0,
        lightValanceHeight: 0,
        backOption: "fullBack",
        shelfQty: 2,
        shelfType: "Adjustable Shelf - Pins",
        shelfFinish: "White",
        slideType: "",
        slideLength: 0,
        drawerQty: 0,
        drawerHeights: [],
        status: "Draft",
        notes: "Confirm printer clearance before issuing.",
        updatedAt: "2026-04-05T15:20:00.000Z",
      },
      {
        id: "cut-3",
        projectId: "project-2",
        areaId: "area-3",
        code: "B3",
        itemName: "Villa pantry sink base",
        cabinetCategory: "Base",
        cabinetSubtype: "Sink",
        cabinetUse: "sinkCabinet",
        inputUnit: "in",
        width: 33,
        height: 34.5,
        depth: 24,
        quantity: 3,
        interiorMaterial: "5/8 Plywood",
        customMaterialName: "",
        customMaterialThickness: 0,
        materialThickness: 0.625,
        doorThickness: 0.75,
        bumperAllowance: 0.125,
        finishedSides: "Front and Back",
        upperBottomCondition: "Regular / Visible Bottom",
        finishedMaterialThicknessM2: 0,
        lightValanceHeight: 0,
        backOption: "noBack",
        shelfQty: 0,
        shelfType: "Fixed Shelf",
        shelfFinish: "Matching",
        slideType: "",
        slideLength: 0,
        drawerQty: 0,
        drawerHeights: [],
        status: "Ready",
        notes: "No back for plumbing access.",
        updatedAt: "2026-04-04T13:45:00.000Z",
      },
      {
        id: "cut-4",
        projectId: "project-1",
        areaId: "area-1",
        code: "U1",
        itemName: "Reception upper cabinet with visible bottom",
        cabinetCategory: "Upper",
        cabinetSubtype: "Standard",
        cabinetUse: "upperStandardCabinet",
        inputUnit: "in",
        width: 30,
        height: 36,
        depth: 14,
        quantity: 2,
        interiorMaterial: "5/8 White Melamine",
        customMaterialName: "",
        customMaterialThickness: 0,
        materialThickness: 0.625,
        doorThickness: 0.75,
        bumperAllowance: 0.125,
        finishedSides: "Front",
        upperBottomCondition: "Regular / Visible Bottom",
        finishedMaterialThicknessM2: 0,
        lightValanceHeight: 0,
        backOption: "fullBack",
        shelfQty: 0,
        shelfType: "Fixed Shelf",
        shelfFinish: "White",
        slideType: "",
        slideLength: 0,
        drawerQty: 0,
        drawerHeights: [],
        status: "Ready",
        notes: "Upper standard cabinet formula migrated from HTML job sheet.",
        updatedAt: "2026-04-03T12:30:00.000Z",
      },
      {
        id: "cut-5",
        projectId: "project-2",
        areaId: "area-3",
        code: "U2",
        itemName: "Villa upper shelves with light valance",
        cabinetCategory: "Upper",
        cabinetSubtype: "Shelves",
        cabinetUse: "upperShelvingCabinet",
        inputUnit: "in",
        width: 42,
        height: 40,
        depth: 13,
        quantity: 1,
        interiorMaterial: "3/4 White Melamine",
        customMaterialName: "",
        customMaterialThickness: 0,
        materialThickness: 0.75,
        doorThickness: 0.75,
        bumperAllowance: 0.125,
        finishedSides: "Front",
        upperBottomCondition: "Light Valance",
        finishedMaterialThicknessM2: 0,
        lightValanceHeight: 2,
        backOption: "fullBack",
        shelfQty: 2,
        shelfType: "Adjustable Shelf - Pilasters",
        shelfFinish: "Matching",
        slideType: "",
        slideLength: 0,
        drawerQty: 0,
        drawerHeights: [],
        status: "Draft",
        notes: "Upper shelving cabinet with valance deduction.",
        updatedAt: "2026-04-02T12:30:00.000Z",
      },
      {
        id: "cut-6",
        projectId: "project-1",
        areaId: "area-2",
        code: "B4",
        itemName: "Three drawer base cabinet",
        cabinetCategory: "Base",
        cabinetSubtype: "Drawer",
        cabinetUse: "drawerBank",
        inputUnit: "in",
        width: 30,
        height: 34.5,
        depth: 24,
        quantity: 1,
        interiorMaterial: "Black Birch Ply",
        customMaterialName: "Black Birch Ply",
        customMaterialThickness: 0.625,
        materialThickness: 0.625,
        doorThickness: 0.75,
        bumperAllowance: 0.125,
        finishedSides: "Front",
        upperBottomCondition: "Regular / Visible Bottom",
        finishedMaterialThicknessM2: 0,
        lightValanceHeight: 0,
        backOption: "fullBack",
        shelfQty: 0,
        shelfType: "Fixed Shelf",
        shelfFinish: "Black",
        slideType: "undermount",
        slideLength: 19.625,
        drawerQty: 3,
        drawerHeights: [6, 9, 12],
        status: "Ready",
        notes: "Drawer bank formulas migrated from HTML job sheet.",
        updatedAt: "2026-04-01T12:30:00.000Z",
      },
    ],
    workers: [
      {
        id: "worker-1",
        name: "Rohit Yadav",
        role: "Site Supervisor",
        phone: "+91 98989 11122",
        projectId: "project-1",
        assignedMaterials: 18,
        updatedAt: "2026-04-06T08:10:00.000Z",
      },
      {
        id: "worker-2",
        name: "Neha Chauhan",
        role: "Electrician",
        phone: "+91 97979 44112",
        projectId: "project-1",
        assignedMaterials: 9,
        updatedAt: "2026-04-05T09:50:00.000Z",
      },
      {
        id: "worker-3",
        name: "Imran Sheikh",
        role: "Store Keeper",
        phone: "+91 97888 11445",
        projectId: "project-2",
        assignedMaterials: 5,
        updatedAt: "2026-04-04T13:05:00.000Z",
      },
    ],
    locations: [
      {
        id: "location-1",
        name: "Central Yard",
        type: "Warehouse",
        manager: "Imran Sheikh",
        capacity: 850,
        updatedAt: "2026-04-06T07:30:00.000Z",
      },
      {
        id: "location-2",
        name: "Tower A Basement",
        type: "Site Store",
        manager: "Rohit Yadav",
        capacity: 220,
        updatedAt: "2026-04-04T10:20:00.000Z",
      },
      {
        id: "location-3",
        name: "Villa Cluster Depot",
        type: "Transit Store",
        manager: "Neha Chauhan",
        capacity: 310,
        updatedAt: "2026-04-03T15:10:00.000Z",
      },
    ],
    items: [
      {
        id: "item-1",
        title: "OPC Cement 50kg",
        sku: "CEM-001",
        category: "Concrete",
        unit: "Bags",
        stock: 145,
        assignedQty: 40,
        reorderLevel: 100,
        vendorId: "vendor-3",
        locationId: "location-1",
        notes: "Fast moving item for slab and masonry work.",
        updatedAt: "2026-04-06T11:05:00.000Z",
      },
      {
        id: "item-2",
        title: "16mm TMT Rebar",
        sku: "REB-016",
        category: "Steel",
        unit: "Nos",
        stock: 82,
        assignedQty: 25,
        reorderLevel: 60,
        vendorId: "vendor-1",
        locationId: "location-2",
        notes: "Issued against North Tower core wall package.",
        updatedAt: "2026-04-05T14:35:00.000Z",
      },
      {
        id: "item-3",
        title: "LED Panel 2x2",
        sku: "ELE-220",
        category: "Electrical",
        unit: "Nos",
        stock: 24,
        assignedQty: 12,
        reorderLevel: 30,
        vendorId: "vendor-2",
        locationId: "location-1",
        notes: "Imported in batches per floor handover plan.",
        updatedAt: "2026-04-04T18:10:00.000Z",
      },
      {
        id: "item-4",
        title: "Ceramic Tile Adhesive",
        sku: "FIN-118",
        category: "Finishing",
        unit: "Bags",
        stock: 39,
        assignedQty: 8,
        reorderLevel: 25,
        vendorId: "vendor-1",
        locationId: "location-3",
        notes: "Pending receipt from PO-105.",
        updatedAt: "2026-04-03T16:40:00.000Z",
      },
    ],
    purchaseOrders: [
      {
        id: "po-1",
        number: "PO-104",
        vendorId: "vendor-3",
        status: "Open",
        orderDate: "2026-04-01",
        expectedDate: "2026-04-09",
        projectId: "project-1",
        orderedBy: "Aarav Meena",
        lines: [
          {
            description: "OPC Cement 50kg",
            category: "Concrete",
            sku: "CEM-101",
            unit: "Bags",
            qty: 300,
            price: 390,
          },
          {
            description: "16mm TMT Rebar",
            category: "Metal",
            sku: "MTL-101",
            unit: "Nos",
            qty: 120,
            price: 710.5,
          },
        ],
        updatedAt: "2026-04-05T12:15:00.000Z",
      },
      {
        id: "po-2",
        number: "PO-105",
        vendorId: "vendor-2",
        status: "Partial",
        orderDate: "2026-04-02",
        expectedDate: "2026-04-07",
        projectId: "project-1",
        orderedBy: "Neha Chauhan",
        lines: [
          {
            description: "LED Panel 2x2",
            category: "Electrical",
            sku: "ELE-101",
            unit: "Nos",
            qty: 40,
            price: 1650,
          },
          {
            description: "Ceramic Tile Adhesive",
            category: "Glue",
            sku: "GLU-101",
            unit: "Bags",
            qty: 50,
            price: 430.75,
          },
        ],
        updatedAt: "2026-04-06T06:55:00.000Z",
      },
    ],
    receiving: [
      {
        id: "rcv-1",
        receiptNo: "RCV-9001",
        poId: "po-2",
        receivedLocation: "Warehouse",
        receivedBy: "Imran Sheikh",
        packingSlipImage: "packing-slip-4481.jpg",
        date: "2026-04-05",
        status: "Partial",
        notes: "18 LED panels received. Remaining due tomorrow.",
        lines: [
          {
            sku: "ELE-101",
            orderedQty: 40,
            receivedQty: 18,
            qtyOnPackingSlip: 18,
            damagedQty: 0,
          },
          {
            sku: "GLU-101",
            orderedQty: 50,
            receivedQty: 50,
            qtyOnPackingSlip: 0,
            damagedQty: 0,
          },
        ],
        updatedAt: "2026-04-05T17:15:00.000Z",
      },
      {
        id: "rcv-2",
        receiptNo: "RCV-9002",
        poId: "po-1",
        receivedLocation: "Site",
        receivedBy: "Rohit Yadav",
        packingSlipImage: "",
        date: "2026-04-06",
        status: "Full",
        notes: "TMT bars unloaded directly at site store.",
        lines: [
          {
            sku: "CEM-101",
            orderedQty: 300,
            receivedQty: 300,
            qtyOnPackingSlip: 0,
            damagedQty: 0,
          },
          {
            sku: "MTL-101",
            orderedQty: 120,
            receivedQty: 120,
            qtyOnPackingSlip: 0,
            damagedQty: 0,
          },
        ],
        updatedAt: "2026-04-06T09:25:00.000Z",
      },
    ],
    movements: [
      {
        id: "mov-1",
        itemId: "item-1",
        type: "Issue",
        qty: 40,
        target: "North Tower Fitout",
        note: "Issued for slab block B.",
        date: "2026-04-06",
      },
      {
        id: "mov-2",
        itemId: "item-2",
        type: "Receipt",
        qty: 22,
        target: "Tower A Basement",
        note: "Received against PO-104.",
        date: "2026-04-06",
      },
      {
        id: "mov-3",
        itemId: "item-3",
        type: "Issue",
        qty: 12,
        target: "Neha Chauhan",
        note: "Electrical rough-in package.",
        date: "2026-04-05",
      },
      {
        id: "mov-4",
        itemId: "item-4",
        type: "Waste",
        qty: 3,
        target: "Villa Cluster Depot",
        note: "Damaged bags during rain exposure.",
        date: "2026-04-03",
      },
    ],
  };
}
