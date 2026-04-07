export type ModuleKey =
  | "dashboard"
  | "items"
  | "vendors"
  | "projects"
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
  name: string;
  contact: string;
  phone: string;
  email: string;
  category: string;
  updatedAt: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  code: string;
  status: string;
  location: string;
  budget: number;
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
  projectIds: string[];
  lines: Array<{
    itemId: string;
    qty: number;
    rate: number;
  }>;
  updatedAt: string;
};

export type ReceiptRecord = {
  id: string;
  receiptNo: string;
  poId: string;
  locationId: string;
  receivedBy: string;
  packingSlip: string;
  date: string;
  status: string;
  notes: string;
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

export const STORAGE_KEY = "key-point-mvp-state-v1";
export const THEME_KEY = "key-point-theme-v1";
export const AUTH_KEY = "key-point-auth-v1";

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function seedRecords(): RecordsState {
  return {
    vendors: [
      {
        id: "vendor-1",
        name: "Metro Build Supplies",
        contact: "Aarav Singh",
        phone: "+91 98765 11223",
        email: "orders@metrobuild.test",
        category: "General Materials",
        updatedAt: "2026-04-06T09:15:00.000Z",
      },
      {
        id: "vendor-2",
        name: "Prime Electricals",
        contact: "Riya Mehta",
        phone: "+91 99887 66554",
        email: "sales@primeelectricals.test",
        category: "Electrical",
        updatedAt: "2026-04-05T12:40:00.000Z",
      },
      {
        id: "vendor-3",
        name: "Stonecraft Aggregates",
        contact: "Dev Khanna",
        phone: "+91 98110 90909",
        email: "dispatch@stonecraft.test",
        category: "Concrete and Aggregates",
        updatedAt: "2026-04-04T07:20:00.000Z",
      },
    ],
    projects: [
      {
        id: "project-1",
        name: "North Tower Fitout",
        code: "NTF-24",
        status: "Active",
        location: "Noida Sector 94",
        budget: 4600000,
        updatedAt: "2026-04-06T10:45:00.000Z",
      },
      {
        id: "project-2",
        name: "Riverside Villas",
        code: "RSV-12",
        status: "Active",
        location: "Gurugram Extension",
        budget: 7200000,
        updatedAt: "2026-04-05T16:20:00.000Z",
      },
      {
        id: "project-3",
        name: "Warehouse Retrofit",
        code: "WHR-08",
        status: "Planning",
        location: "Faridabad Yard",
        budget: 2150000,
        updatedAt: "2026-04-03T11:30:00.000Z",
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
        projectIds: ["project-1", "project-2"],
        lines: [
          { itemId: "item-1", qty: 300, rate: 390 },
          { itemId: "item-2", qty: 120, rate: 710 },
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
        projectIds: ["project-1"],
        lines: [
          { itemId: "item-3", qty: 40, rate: 1650 },
          { itemId: "item-4", qty: 50, rate: 430 },
        ],
        updatedAt: "2026-04-06T06:55:00.000Z",
      },
    ],
    receiving: [
      {
        id: "rcv-1",
        receiptNo: "RCV-9001",
        poId: "po-2",
        locationId: "location-1",
        receivedBy: "Imran Sheikh",
        packingSlip: "PS-4481",
        date: "2026-04-05",
        status: "Partial",
        notes: "18 LED panels received. Remaining due tomorrow.",
        updatedAt: "2026-04-05T17:15:00.000Z",
      },
      {
        id: "rcv-2",
        receiptNo: "RCV-9002",
        poId: "po-1",
        locationId: "location-2",
        receivedBy: "Rohit Yadav",
        packingSlip: "PS-4520",
        date: "2026-04-06",
        status: "Full",
        notes: "TMT bars unloaded directly at site store.",
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
