"use client";

import {
  AUTH_KEY,
  AuthUser,
  CutListRecord,
  generateNextNumber,
  generateSku,
  ItemRecord,
  LocationRecord,
  makeId,
  ModuleKey,
  MovementRecord,
  ProjectAreaRecord,
  ProjectRecord,
  PurchaseOrderRecord,
  ReceiptRecord,
  RecordsState,
  seedRecords,
  STORAGE_KEY,
  THEME_KEY,
  VendorRecord,
  WorkerRecord,
} from "@/lib/inventoryMock";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark";

export type FormState = {
  moduleKey: Exclude<ModuleKey, "dashboard">;
  mode: "create" | "edit";
  recordId?: string;
  initialValues?: Record<string, string | number>;
};

export type ImportState = {
  moduleKey: Exclude<ModuleKey, "dashboard">;
};

export type ItemActionState = {
  itemId: string;
  action: "Issue" | "Return" | "Waste" | "Adjust";
};

export type DetailState = {
  moduleKey: Exclude<ModuleKey, "dashboard">;
  recordId: string;
};

export type ReceiveState = {
  poId: string;
};

export type ProjectCutListsState = {
  projectId: string;
};

export type CabinetFormState = {
  projectId: string;
  areaId: string;
  recordId?: string;
};

export type ProjectWorkspaceTab = "projects" | "areas" | "cutlists";

export type ItemDateFilter = {
  from: string;
  to: string;
};

type AppStateContextValue = {
  theme: ThemeMode;
  user: AuthUser | null;
  records: RecordsState;
  activeModule: ModuleKey;
  formState: FormState | null;
  importState: ImportState | null;
  itemActionState: ItemActionState | null;
  detailState: DetailState | null;
  receiveState: ReceiveState | null;
  projectCutListsState: ProjectCutListsState | null;
  cabinetFormState: CabinetFormState | null;
  projectWorkspaceTab: ProjectWorkspaceTab;
  query: string;
  itemDateFilter: ItemDateFilter;
  selectedIds: Record<string, string>;
  activeList: Array<Record<string, unknown> & { id: string }>;
  selectedRecord: (Record<string, unknown> & { id: string }) | null;
  setUser: (user: AuthUser | null) => void;
  setTheme: (updater: ThemeMode | ((current: ThemeMode) => ThemeMode)) => void;
  setActiveModule: (moduleKey: ModuleKey) => void;
  setQuery: (value: string) => void;
  setItemDateFilter: (
    updater: ItemDateFilter | ((current: ItemDateFilter) => ItemDateFilter)
  ) => void;
  setFormState: (state: FormState | null) => void;
  setImportState: (state: ImportState | null) => void;
  setItemActionState: (state: ItemActionState | null) => void;
  setDetailState: (state: DetailState | null) => void;
  setReceiveState: (state: ReceiveState | null) => void;
  setProjectCutListsState: (state: ProjectCutListsState | null) => void;
  setCabinetFormState: (state: CabinetFormState | null) => void;
  setProjectWorkspaceTab: (tab: ProjectWorkspaceTab) => void;
  setSelectedId: (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    id: string
  ) => void;
  saveModuleRecord: (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    values: Record<string, FormDataEntryValue>,
    existingId?: string
  ) => string;
  saveProjectAreas: (projectId: string, areas: ProjectAreaRecord[]) => void;
  removeModuleRecord: (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    id: string
  ) => void;
  runImport: (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    rows: Array<Record<string, string>>
  ) => void;
  saveItemAction: (values: Record<string, FormDataEntryValue>) => void;
  receivePurchaseOrder: (values: Record<string, FormDataEntryValue>) => void;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

function sortByUpdatedAt<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const savedUser = window.localStorage.getItem(AUTH_KEY);
  return savedUser ? (JSON.parse(savedUser) as AuthUser) : null;
}

function normalizeStoredCutList(record: Partial<CutListRecord>): CutListRecord {
  const cabinetCategory = (record.cabinetCategory || "Base") as CutListRecord["cabinetCategory"];
  const cabinetSubtype = (record.cabinetSubtype || "Standard") as CutListRecord["cabinetSubtype"];

  return {
    id: record.id || makeId("cut"),
    projectId: record.projectId || "",
    areaId: record.areaId || "",
    code: record.code || "",
    itemName: record.itemName || "",
    cabinetCategory,
    cabinetSubtype,
    cabinetUse: record.cabinetUse || getCutListUse(cabinetCategory, cabinetSubtype),
    inputUnit: record.inputUnit || "in",
    width: record.width || 0,
    height: record.height || 0,
    depth: record.depth || 0,
    quantity: record.quantity || 1,
    interiorMaterial: record.interiorMaterial || "5/8 White Melamine",
    customMaterialName: record.customMaterialName || "",
    customMaterialThickness: record.customMaterialThickness || 0,
    materialThickness: record.materialThickness || 0.625,
    doorThickness: record.doorThickness || 0.75,
    bumperAllowance: record.bumperAllowance || 0.125,
    finishedSides: record.finishedSides || "Front",
    upperBottomCondition: record.upperBottomCondition || "Regular / Visible Bottom",
    finishedMaterialThicknessM2: record.finishedMaterialThicknessM2 || 0,
    lightValanceHeight: record.lightValanceHeight || 0,
    backOption: record.backOption || "fullBack",
    shelfQty: record.shelfQty || 0,
    shelfType: record.shelfType || "Fixed Shelf",
    shelfFinish: record.shelfFinish || "White",
    slideType: record.slideType || "",
    slideLength: record.slideLength || 0,
    drawerQty: record.drawerQty || 0,
    drawerHeights: Array.isArray(record.drawerHeights) ? record.drawerHeights : [],
    status: record.status || "Draft",
    notes: record.notes || "",
    updatedAt: record.updatedAt || new Date().toISOString(),
  };
}

function normalizeStoredProjectArea(record: Partial<ProjectAreaRecord>): ProjectAreaRecord {
  const now = new Date().toISOString();
  const createdAt = record.createdAt || now;

  return {
    id: record.id || makeId("area"),
    areaName: record.areaName || "",
    areaCode: (record.areaCode || "").toUpperCase(),
    notes: record.notes || "",
    createdAt,
    updatedAt: record.updatedAt || createdAt,
  };
}

function normalizeStoredProject(record: Partial<ProjectRecord>): ProjectRecord {
  return {
    id: record.id || makeId("pro"),
    name: record.name || "",
    code: record.code || "",
    customerName: record.customerName || "",
    siteAddress: record.siteAddress || record.location || "",
    projectDate: record.projectDate || "",
    preparedBy: record.preparedBy || "",
    status: record.status || "Planning",
    location: record.location || record.siteAddress || "",
    budget: record.budget || 0,
    notes: record.notes || "",
    areas: Array.isArray(record.areas)
      ? record.areas.map((area) => normalizeStoredProjectArea(area))
      : [],
    updatedAt: record.updatedAt || new Date().toISOString(),
  };
}

function readStoredRecords(): RecordsState {
  if (typeof window === "undefined") {
    return seedRecords();
  }
  const savedState = window.localStorage.getItem(STORAGE_KEY);
  if (!savedState) {
    return seedRecords();
  }

  const seeded = seedRecords();
  const parsedState = JSON.parse(savedState) as Partial<RecordsState>;
  const projects = (parsedState.projects ?? seeded.projects).map(normalizeStoredProject);
  const cutLists = (parsedState.cutLists ?? seeded.cutLists).map(normalizeStoredCutList);

  return {
    ...seeded,
    ...parsedState,
    projects,
    cutLists: cutLists.map((cutList) => ({
      ...cutList,
      areaId:
        cutList.areaId ||
        projects.find((project) => project.id === cutList.projectId)?.areas[0]?.id ||
        "",
    })),
  };
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseProjectAreas(value: string, now: string): ProjectAreaRecord[] {
  const rows = parseJson<Array<Partial<ProjectAreaRecord>>>(value, []);

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((area) =>
    normalizeStoredProjectArea({
      ...area,
      createdAt: area.createdAt || now,
      updatedAt: now,
    })
  );
}

function findLocationIdByReceiptLocation(
  locations: LocationRecord[],
  receivedLocation: string
) {
  const lower = receivedLocation.toLowerCase();
  return (
    locations.find((location) => location.type.toLowerCase().includes(lower))?.id ??
    locations[0]?.id ??
    ""
  );
}

function findItemIdByPoLine(records: RecordsState, line: PurchaseOrderRecord["lines"][number]) {
  return (
    records.items.find((item) => item.sku === line.sku)?.id ??
    records.items.find((item) => item.title === line.description)?.id ??
    ""
  );
}

function nextReceiptNumber(records: RecordsState) {
  return generateNextNumber(
    "RCV",
    records.receiving.map((receipt) => receipt.receiptNo)
  );
}

function getCutListUse(
  cabinetCategory: CutListRecord["cabinetCategory"],
  cabinetSubtype: CutListRecord["cabinetSubtype"]
): CutListRecord["cabinetUse"] {
  if (cabinetCategory === "Upper") {
    return cabinetSubtype === "Shelves" ? "upperShelvingCabinet" : "upperStandardCabinet";
  }
  if (cabinetCategory !== "Base") {
    return "unsupportedCabinet";
  }
  if (cabinetSubtype === "Shelves") {
    return "shelvingCabinet";
  }
  if (cabinetSubtype === "Drawer") {
    return "drawerBank";
  }
  if (cabinetSubtype === "Sink") {
    return "sinkCabinet";
  }
  return "standardBaseCabinet";
}

function normalizeInputUnit(value: string): CutListRecord["inputUnit"] {
  return value.toLowerCase() === "mm" ? "mm" : "in";
}

function toInches(value: number, unit: CutListRecord["inputUnit"]) {
  return unit === "mm" ? value / 25.4 : value;
}

function parseDrawerHeights(value: string, unit: CutListRecord["inputUnit"]) {
  return value
    .split(",")
    .map((height) => height.trim())
    .filter(Boolean)
    .map((height) => toInches(Number(height), unit))
    .filter((height) => Number.isFinite(height) && height > 0);
}

function resolveCutListMaterial(values: {
  interiorMaterial: string;
  customMaterialName: string;
  customMaterialThickness: number;
  materialThickness: number;
}) {
  if (values.interiorMaterial === "Custom") {
    return {
      interiorMaterial: values.customMaterialName || "Custom",
      materialThickness: values.customMaterialThickness || values.materialThickness || 0.625,
    };
  }

  return {
    interiorMaterial: values.interiorMaterial,
    materialThickness: values.materialThickness || 0.625,
  };
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeMode>(readStoredTheme);
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [records, setRecords] = useState<RecordsState>(readStoredRecords);
  const [activeModule, setActiveModuleState] = useState<ModuleKey>("dashboard");
  const [formState, setFormState] = useState<FormState | null>(null);
  const [importState, setImportState] = useState<ImportState | null>(null);
  const [itemActionState, setItemActionState] = useState<ItemActionState | null>(null);
  const [detailState, setDetailState] = useState<DetailState | null>(null);
  const [receiveState, setReceiveState] = useState<ReceiveState | null>(null);
  const [projectCutListsState, setProjectCutListsState] =
    useState<ProjectCutListsState | null>(null);
  const [cabinetFormState, setCabinetFormState] = useState<CabinetFormState | null>(null);
  const [projectWorkspaceTab, setProjectWorkspaceTab] = useState<ProjectWorkspaceTab>("projects");
  const [query, setQuery] = useState("");
  const [itemDateFilter, setItemDateFilter] = useState<ItemDateFilter>({
    from: "",
    to: "",
  });
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const activeList = useMemo(() => {
    if (activeModule === "dashboard") {
      return [];
    }

    let sourceList =
      activeModule === "receiving"
        ? records.purchaseOrders.filter((po) =>
            ["Open", "Partial", "Partially Received"].includes(po.status)
          )
        : [...records[activeModule]];

    if (activeModule === "items" && (itemDateFilter.from || itemDateFilter.to)) {
      sourceList = sourceList.filter((entry) => {
        const updatedAt = new Date(String(entry.updatedAt));
        if (itemDateFilter.from && updatedAt < new Date(`${itemDateFilter.from}T00:00:00`)) {
          return false;
        }
        if (itemDateFilter.to && updatedAt > new Date(`${itemDateFilter.to}T23:59:59`)) {
          return false;
        }
        return true;
      });
    }

    if (!query.trim()) {
      return sourceList as Array<Record<string, unknown> & { id: string }>;
    }

    const lower = query.toLowerCase();
    return sourceList.filter((entry) =>
      JSON.stringify(entry).toLowerCase().includes(lower)
    ) as Array<Record<string, unknown> & { id: string }>;
  }, [activeModule, itemDateFilter.from, itemDateFilter.to, query, records]);

  const selectedRecord = useMemo(() => {
    if (activeModule === "dashboard") {
      return null;
    }
    return (
      activeList.find((entry) => entry.id === selectedIds[activeModule]) ??
      activeList[0] ??
      null
    );
  }, [activeList, activeModule, selectedIds]);

  const setActiveModule = (moduleKey: ModuleKey) => {
    setActiveModuleState(moduleKey);
    setQuery("");
    if (moduleKey !== "items") {
      setItemDateFilter({ from: "", to: "" });
    }
  };

  const setSelectedId = (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    id: string
  ) => {
    setSelectedIds((current) => ({ ...current, [moduleKey]: id }));
  };

  const saveModuleRecord = (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    values: Record<string, FormDataEntryValue>,
    existingId?: string
  ) => {
    const now = new Date().toISOString();
    const text = (key: string) => String(values[key] ?? "").trim();
    const number = (key: string) => Number(values[key] ?? 0);
    const id = existingId ?? makeId(moduleKey.slice(0, 3));

    setRecords((current) => {
      const next = { ...current };

      if (moduleKey === "items") {
        const record: ItemRecord = {
          id,
          title: text("title"),
          sku: text("sku"),
          category: text("category"),
          unit: text("unit"),
          stock: number("stock"),
          assignedQty: number("assignedQty"),
          reorderLevel: number("reorderLevel"),
          vendorId: text("vendorId"),
          locationId: text("locationId"),
          notes: text("notes"),
          updatedAt: now,
        };
        next.items = sortByUpdatedAt(
          existingId
            ? current.items.map((item) => (item.id === id ? record : item))
            : [record, ...current.items]
        );
      }

      if (moduleKey === "vendors") {
        const record: VendorRecord = {
          id,
          number:
            text("number") ||
            generateNextNumber(
              "VND",
              current.vendors.map((vendor) => vendor.number)
            ),
          name: text("name"),
          contact: text("contact"),
          phone: text("phone"),
          email: text("email"),
          category: text("category"),
          address: text("address"),
          updatedAt: now,
        };
        next.vendors = sortByUpdatedAt(
          existingId
            ? current.vendors.map((item) => (item.id === id ? record : item))
            : [record, ...current.vendors]
        );
      }

      if (moduleKey === "projects") {
        const record: ProjectRecord = {
          id,
          name: text("name"),
          code: text("code"),
          customerName: text("customerName"),
          siteAddress: text("siteAddress"),
          projectDate: text("projectDate"),
          preparedBy: text("preparedBy"),
          status: text("status"),
          location: text("location") || text("siteAddress"),
          budget: number("budget"),
          notes: text("notes"),
          areas: parseProjectAreas(text("areasJson"), now),
          updatedAt: now,
        };
        next.projects = sortByUpdatedAt(
          existingId
            ? current.projects.map((item) => (item.id === id ? record : item))
            : [record, ...current.projects]
        );
      }

      if (moduleKey === "cutLists") {
        const cabinetCategory = (text("cabinetCategory") || "Base") as CutListRecord["cabinetCategory"];
        const cabinetSubtype = (text("cabinetSubtype") || "Standard") as CutListRecord["cabinetSubtype"];
        const inputUnit = normalizeInputUnit(text("inputUnit"));
        const rawMaterial = {
          interiorMaterial: text("interiorMaterial"),
          customMaterialName: text("customMaterialName"),
          customMaterialThickness: toInches(number("customMaterialThickness"), inputUnit),
          materialThickness: toInches(number("materialThickness"), inputUnit),
        };
        const resolvedMaterial = resolveCutListMaterial(rawMaterial);
        const record: CutListRecord = {
          id,
          projectId: text("projectId"),
          areaId: text("areaId"),
          code:
            text("code") ||
            generateNextNumber(
              "CUT",
              current.cutLists.map((cutList) => cutList.code)
            ),
          itemName: text("itemName"),
          cabinetCategory,
          cabinetSubtype,
          cabinetUse: getCutListUse(cabinetCategory, cabinetSubtype),
          inputUnit,
          width: toInches(number("width"), inputUnit),
          height: toInches(number("height"), inputUnit),
          depth: toInches(number("depth"), inputUnit),
          quantity: number("quantity") || 1,
          interiorMaterial: resolvedMaterial.interiorMaterial,
          customMaterialName: rawMaterial.customMaterialName,
          customMaterialThickness: rawMaterial.customMaterialThickness,
          materialThickness: resolvedMaterial.materialThickness,
          doorThickness: toInches(number("doorThickness"), inputUnit) || 0.75,
          bumperAllowance: toInches(number("bumperAllowance"), inputUnit) || 0.125,
          finishedSides: (text("finishedSides") || "Front") as CutListRecord["finishedSides"],
          upperBottomCondition: (text("upperBottomCondition") ||
            "Regular / Visible Bottom") as CutListRecord["upperBottomCondition"],
          finishedMaterialThicknessM2: toInches(number("finishedMaterialThicknessM2"), inputUnit),
          lightValanceHeight: toInches(number("lightValanceHeight"), inputUnit),
          backOption: (text("backOption") || "fullBack") as CutListRecord["backOption"],
          shelfQty: number("shelfQty"),
          shelfType: (text("shelfType") || "Fixed Shelf") as CutListRecord["shelfType"],
          shelfFinish: text("shelfFinish") || "White",
          slideType: (text("slideType") || "") as CutListRecord["slideType"],
          slideLength: toInches(number("slideLength"), inputUnit),
          drawerQty: number("drawerQty"),
          drawerHeights: parseDrawerHeights(text("drawerHeights"), inputUnit),
          status: (text("status") || "Draft") as CutListRecord["status"],
          notes: text("notes"),
          updatedAt: now,
        };
        next.cutLists = sortByUpdatedAt(
          existingId
            ? current.cutLists.map((item) => (item.id === id ? record : item))
            : [record, ...current.cutLists]
        );
      }

      if (moduleKey === "workers") {
        const record: WorkerRecord = {
          id,
          name: text("name"),
          role: text("role"),
          phone: text("phone"),
          projectId: text("projectId"),
          assignedMaterials: number("assignedMaterials"),
          updatedAt: now,
        };
        next.workers = sortByUpdatedAt(
          existingId
            ? current.workers.map((item) => (item.id === id ? record : item))
            : [record, ...current.workers]
        );
      }

      if (moduleKey === "locations") {
        const record: LocationRecord = {
          id,
          name: text("name"),
          type: text("type"),
          manager: text("manager"),
          capacity: number("capacity"),
          updatedAt: now,
        };
        next.locations = sortByUpdatedAt(
          existingId
            ? current.locations.map((item) => (item.id === id ? record : item))
            : [record, ...current.locations]
        );
      }

      if (moduleKey === "purchaseOrders") {
        const lines = parseJson<PurchaseOrderRecord["lines"]>(text("lines"), []);
        const record: PurchaseOrderRecord = {
          id,
          number:
            text("number") ||
            generateNextNumber(
              "PO",
              current.purchaseOrders.map((po) => po.number)
            ),
          vendorId: text("vendorId"),
          status: existingId
            ? current.purchaseOrders.find((entry) => entry.id === id)?.status ?? "Open"
            : "Open",
          orderDate: text("orderDate"),
          expectedDate: text("expectedDate"),
          projectId: text("projectId"),
          orderedBy: text("orderedBy"),
          lines,
          updatedAt: now,
        };
        next.purchaseOrders = sortByUpdatedAt(
          existingId
            ? current.purchaseOrders.map((item) => (item.id === id ? record : item))
            : [record, ...current.purchaseOrders]
        );
      }

      if (moduleKey === "receiving") {
        const parsedLines = parseJson<ReceiptRecord["lines"]>(text("lines"), []);
        const record: ReceiptRecord = {
          id,
          receiptNo: text("receiptNo") || nextReceiptNumber(current),
          poId: text("poId"),
          receivedLocation: text("receivedLocation"),
          receivedBy: text("receivedBy"),
          packingSlipImage: text("packingSlipImage"),
          date: text("date") || now.slice(0, 10),
          status: text("status") || "Partial",
          notes: text("notes"),
          lines: parsedLines,
          updatedAt: now,
        };
        next.receiving = sortByUpdatedAt(
          existingId
            ? current.receiving.map((item) => (item.id === id ? record : item))
            : [record, ...current.receiving]
        );
      }

      return next;
    });

    setSelectedIds((current) => ({ ...current, [moduleKey]: id }));
    setFormState(null);
    return id;
  };

  const saveProjectAreas = (projectId: string, areas: ProjectAreaRecord[]) => {
    const now = new Date().toISOString();

    setRecords((current) => ({
      ...current,
      projects: sortByUpdatedAt(
        current.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                areas: areas.map((area) =>
                  normalizeStoredProjectArea({
                    ...area,
                    updatedAt: area.updatedAt || now,
                  })
                ),
                updatedAt: now,
              }
            : project
        )
      ),
    }));
  };

  const removeModuleRecord = (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    id: string
  ) => {
    setRecords((current) => ({
      ...current,
      [moduleKey]: current[moduleKey].filter((entry) => entry.id !== id),
    }));
  };

  const runImport = (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    rows: Array<Record<string, string>>
  ) => {
    if (rows.length === 0) {
      return;
    }

    setRecords((current) => {
      const now = new Date().toISOString();
      const next = { ...current };

      if (moduleKey === "vendors") {
        next.vendors = sortByUpdatedAt([
          ...rows.map((row, index) => ({
            id: makeId("ven"),
            number:
              row.number ||
              generateNextNumber(
                "VND",
                [...current.vendors, ...next.vendors ?? []].map((vendor) => vendor.number)
              ),
            name: row.name || `Imported Vendor ${index + 1}`,
            contact: row.contact || `Imported Contact ${index + 1}`,
            phone: row.phone || "+91 90000 00000",
            email:
              row.email ||
              `${(row.name || `vendor.${index + 1}`).toLowerCase().replace(/\s+/g, ".")}@import.test`,
            category: row.category || "Imported",
            address: row.address || "Imported vendor address",
            updatedAt: now,
          })),
          ...current.vendors,
        ]);
      }

      if (moduleKey === "items") {
        next.items = sortByUpdatedAt([
          ...rows.map((row, index) => ({
            id: makeId("itm"),
            title: row.title || `Imported Item ${index + 1}`,
            sku: row.sku || `IMP-${index + 1}`,
            category: row.category || "Imported",
            unit: row.unit || "Nos",
            stock: Number(row.stock || 20),
            assignedQty: Number(row.assignedQty || 0),
            reorderLevel: Number(row.reorderLevel || 10),
            vendorId:
              current.vendors.find((vendor) => vendor.name === row.vendorName)?.id ??
              current.vendors[0]?.id ??
              "",
            locationId:
              current.locations.find((location) => location.name === row.locationName)?.id ??
              current.locations[0]?.id ??
              "",
            notes: row.notes || "Imported from CSV import flow.",
            updatedAt: now,
          })),
          ...current.items,
        ]);
      }

      if (moduleKey === "projects") {
        next.projects = sortByUpdatedAt([
          ...rows.map((row, index) => ({
            id: makeId("pro"),
            name: row.name || row.projectName || `Imported Project ${index + 1}`,
            code: row.code || row.jobNumber || `IMP-${index + 10}`,
            customerName: row.customerName || "",
            siteAddress: row.siteAddress || row.location || "",
            projectDate: row.projectDate || row.date || "",
            preparedBy: row.preparedBy || "",
            status: row.status || "Planning",
            location: row.location || row.siteAddress || "Imported Location",
            budget: Number(row.budget || 1000000 * (index + 1)),
            notes: row.notes || "",
            areas: [],
            updatedAt: now,
          })),
          ...current.projects,
        ]);
      }

      if (moduleKey === "cutLists") {
        next.cutLists = sortByUpdatedAt([
          ...rows.map((row, index) => {
            const cabinetCategory = (row.cabinetCategory || "Base") as CutListRecord["cabinetCategory"];
            const cabinetSubtype = (row.cabinetSubtype || "Standard") as CutListRecord["cabinetSubtype"];
            const inputUnit = normalizeInputUnit(row.inputUnit || row.measurementUnit || "in");
            const rawMaterial = {
              interiorMaterial: row.interiorMaterial || "5/8 White Melamine",
              customMaterialName: row.customMaterialName || "",
              customMaterialThickness: toInches(Number(row.customMaterialThickness || 0), inputUnit),
              materialThickness: toInches(Number(row.materialThickness || 0.625), inputUnit),
            };
            const resolvedMaterial = resolveCutListMaterial(rawMaterial);

            return {
              id: makeId("cut"),
              projectId:
                current.projects.find((project) => project.name === row.projectName)?.id ??
                current.projects[0]?.id ??
                "",
              areaId: row.areaId || "",
              code: row.code || `B${current.cutLists.length + index + 1}`,
              itemName: row.itemName || `Imported Cabinet ${index + 1}`,
              cabinetCategory,
              cabinetSubtype,
              cabinetUse: getCutListUse(cabinetCategory, cabinetSubtype),
              inputUnit,
              width: toInches(Number(row.width || 30), inputUnit),
              height: toInches(Number(row.height || 34.5), inputUnit),
              depth: toInches(Number(row.depth || 24), inputUnit),
              quantity: Number(row.quantity || 1),
              interiorMaterial: resolvedMaterial.interiorMaterial,
              customMaterialName: rawMaterial.customMaterialName,
              customMaterialThickness: rawMaterial.customMaterialThickness,
              materialThickness: resolvedMaterial.materialThickness,
              doorThickness: toInches(Number(row.doorThickness || 0.75), inputUnit),
              bumperAllowance: toInches(Number(row.bumperAllowance || 0.125), inputUnit),
              finishedSides: (row.finishedSides || "Front") as CutListRecord["finishedSides"],
              upperBottomCondition: (row.upperBottomCondition ||
                "Regular / Visible Bottom") as CutListRecord["upperBottomCondition"],
              finishedMaterialThicknessM2: toInches(Number(row.finishedMaterialThicknessM2 || 0), inputUnit),
              lightValanceHeight: toInches(Number(row.lightValanceHeight || 0), inputUnit),
              backOption: (row.backOption || "fullBack") as CutListRecord["backOption"],
              shelfQty: Number(row.shelfQty || 0),
              shelfType: (row.shelfType || "Fixed Shelf") as CutListRecord["shelfType"],
              shelfFinish: row.shelfFinish || "White",
              slideType: (row.slideType || row.drawerSlideType || "") as CutListRecord["slideType"],
              slideLength: toInches(Number(row.slideLength || 0), inputUnit),
              drawerQty: Number(row.drawerQty || 0),
              drawerHeights: parseDrawerHeights(row.drawerHeights || "", inputUnit),
              status: (row.status || "Draft") as CutListRecord["status"],
              notes: row.notes || "Imported from CSV import flow.",
              updatedAt: now,
            };
          }),
          ...current.cutLists,
        ]);
      }

      if (moduleKey === "workers") {
        next.workers = sortByUpdatedAt([
          ...rows.map((row, index) => ({
            id: makeId("wrk"),
            name: row.name || `Imported Worker ${index + 1}`,
            role: row.role || "Imported Worker",
            phone: row.phone || "+91 90000 00000",
            projectId:
              current.projects.find((project) => project.name === row.projectName)?.id ??
              current.projects[0]?.id ??
              "",
            assignedMaterials: Number(row.assignedMaterials || 0),
            updatedAt: now,
          })),
          ...current.workers,
        ]);
      }

      if (moduleKey === "locations") {
        next.locations = sortByUpdatedAt([
          ...rows.map((row, index) => ({
            id: makeId("loc"),
            name: row.name || `Imported Location ${index + 1}`,
            type: row.type || "Imported Site",
            manager: row.manager || "Imported Manager",
            capacity: Number(row.capacity || 100),
            updatedAt: now,
          })),
          ...current.locations,
        ]);
      }

      if (moduleKey === "purchaseOrders") {
        next.purchaseOrders = sortByUpdatedAt([
          ...rows.map((row, index) => {
            const projectId =
              current.projects.find((project) => project.name === row.projectName)?.id ?? "";
            const parsedLines = (row.lines || "")
              .split(";")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [description, category, unit, qty, price] = line
                  .split("|")
                  .map((part) => part.trim());
                return {
                  description: description || `Imported Line ${index + 1}`,
                  category: category || "Plywood",
                  sku: generateSku(
                    category || "Plywood",
                    current.purchaseOrders.flatMap((po) => po.lines.map((poLine) => poLine.sku))
                  ),
                  unit: unit || "Nos",
                  qty: Number(qty || 0),
                  price: Number(price || 0),
                };
              });

            return {
              id: makeId("po"),
              number:
                row.number ||
                generateNextNumber(
                  "PO",
                  current.purchaseOrders.map((po) => po.number)
                ),
              vendorId:
                current.vendors.find((vendor) => vendor.name === row.vendorName)?.id ??
                current.vendors[0]?.id ??
                "",
              status: "Open",
              orderDate: row.orderDate || now.slice(0, 10),
              expectedDate: row.expectedDate || now.slice(0, 10),
              projectId,
              orderedBy: row.orderedBy || current.workers[0]?.name || "Imported Buyer",
              lines:
                parsedLines.length > 0
                  ? parsedLines
                  : [
                      {
                        description: `Imported Line ${index + 1}`,
                        category: "Plywood",
                        sku: generateSku(
                          "Plywood",
                          current.purchaseOrders.flatMap((po) =>
                            po.lines.map((poLine) => poLine.sku)
                          )
                        ),
                        unit: "Nos",
                        qty: 10 + index * 5,
                        price: 500,
                      },
                    ],
              updatedAt: now,
            };
          }),
          ...current.purchaseOrders,
        ]);
      }

      if (moduleKey === "receiving") {
        next.receiving = sortByUpdatedAt([
          ...rows.map((row, index) => ({
            id: makeId("rcv"),
            receiptNo: row.receiptNo || `RCV-IMP-${index + 1}`,
            poId:
              current.purchaseOrders.find((po) => po.number === row.poNumber)?.id ??
              current.purchaseOrders[0]?.id ??
              "",
            receivedLocation: row.receivedLocation || "Warehouse",
            receivedBy: row.receivedBy || current.workers[0]?.name || "Imported Receiver",
            packingSlipImage: row.packingSlipImage || "",
            date: row.date || now.slice(0, 10),
            status: row.status || "Partial",
            notes: row.notes || "Imported via CSV bulk upload.",
            lines: [],
            updatedAt: now,
          })),
          ...current.receiving,
        ]);
      }

      return next;
    });

    setImportState(null);
  };

  const saveItemAction = (values: Record<string, FormDataEntryValue>) => {
    if (!itemActionState) {
      return;
    }

    const qty = Number(values.qty ?? 0);
    const target = String(values.target ?? "").trim();
    const note = String(values.note ?? "").trim();
    const action = itemActionState.action;
    const now = new Date().toISOString();

    setRecords((current) => {
      const nextItems = current.items.map((item) => {
        if (item.id !== itemActionState.itemId) {
          return item;
        }

        let stock = item.stock;
        let assignedQty = item.assignedQty;

        if (action === "Issue") {
          stock -= qty;
          assignedQty += qty;
        }
        if (action === "Return") {
          stock += qty;
          assignedQty = Math.max(0, assignedQty - qty);
        }
        if (action === "Waste") {
          stock = Math.max(0, stock - qty);
        }
        if (action === "Adjust") {
          stock = qty;
        }

        return { ...item, stock, assignedQty, updatedAt: now };
      });

      const movement: MovementRecord = {
        id: makeId("mov"),
        itemId: itemActionState.itemId,
        type: action,
        qty,
        target,
        note,
        date: now.slice(0, 10),
      };

      return {
        ...current,
        items: sortByUpdatedAt(nextItems),
        movements: [movement, ...current.movements],
      };
    });

    setItemActionState(null);
  };

  const receivePurchaseOrder = (values: Record<string, FormDataEntryValue>) => {
    if (!receiveState) {
      return;
    }

    const now = new Date().toISOString();
    const text = (key: string) => String(values[key] ?? "").trim();

    setRecords((current) => {
      const po = current.purchaseOrders.find((entry) => entry.id === receiveState.poId);
      if (!po) {
        return current;
      }

      const lines = parseJson<ReceiptRecord["lines"]>(text("lines"), []);
      const hasShortShipment = lines.some((line) => line.receivedQty < line.orderedQty);
      const receipt: ReceiptRecord = {
        id: makeId("rcv"),
        receiptNo: text("receiptNo") || nextReceiptNumber(current),
        poId: po.id,
        receivedLocation: text("receivedLocation") || "Warehouse",
        receivedBy: text("receivedBy") || "Receiving Team",
        packingSlipImage: text("packingSlipImage"),
        date: text("date") || now.slice(0, 10),
        status: hasShortShipment ? "Partial" : "Received In Full",
        notes: text("notes"),
        lines,
        updatedAt: now,
      };

      const locationId = findLocationIdByReceiptLocation(
        current.locations,
        receipt.receivedLocation
      );

      const nextItems = current.items.map((item) => {
        const poLine = po.lines.find((line) => findItemIdByPoLine(current, line) === item.id);
        if (!poLine) {
          return item;
        }

        const receivedLine = lines.find((line) => line.sku === poLine.sku);
        if (!receivedLine || receivedLine.receivedQty <= 0) {
          return item;
        }

        return {
          ...item,
          stock: item.stock + Math.max(receivedLine.receivedQty - receivedLine.damagedQty, 0),
          locationId,
          updatedAt: now,
        };
      });

      const receiptMovements: MovementRecord[] = po.lines
        .map((line) => {
          const itemId = findItemIdByPoLine(current, line);
          const receivedLine = lines.find((entry) => entry.sku === line.sku);
          if (!itemId || !receivedLine || receivedLine.receivedQty <= 0) {
            return null;
          }

          const damageNote =
            receivedLine.damagedQty > 0 ? ` / Damaged ${receivedLine.damagedQty}` : "";
          const slipNote = receipt.packingSlipImage ? " / Packing slip attached" : "";
          return {
            id: makeId("mov"),
            itemId,
            type: "Receipt" as const,
            qty: Math.max(receivedLine.receivedQty - receivedLine.damagedQty, 0),
            target: receipt.receiptNo,
            note: `Received against ${po.number}${damageNote}${slipNote}`,
            date: receipt.date,
          };
        })
        .filter(Boolean) as MovementRecord[];

      return {
        ...current,
        items: sortByUpdatedAt(nextItems),
        receiving: sortByUpdatedAt([receipt, ...current.receiving]),
        movements: [...receiptMovements, ...current.movements],
        purchaseOrders: sortByUpdatedAt(
          current.purchaseOrders.map((entry) =>
            entry.id === po.id
              ? {
                  ...entry,
                  status: hasShortShipment ? "Partially Received" : "Fully Received",
                  updatedAt: now,
                }
              : entry
          )
        ),
      };
    });

    setReceiveState(null);
  };

  const value = {
    theme,
    user,
    records,
    activeModule,
    formState,
    importState,
    itemActionState,
    detailState,
    receiveState,
    projectCutListsState,
    cabinetFormState,
    projectWorkspaceTab,
    query,
    itemDateFilter,
    selectedIds,
    activeList,
    selectedRecord,
    setUser,
    setTheme,
    setActiveModule,
    setQuery,
    setItemDateFilter,
    setFormState,
    setImportState,
    setItemActionState,
    setDetailState,
    setReceiveState,
    setProjectCutListsState,
    setCabinetFormState,
    setProjectWorkspaceTab,
    setSelectedId,
    saveModuleRecord,
    saveProjectAreas,
    removeModuleRecord,
    runImport,
    saveItemAction,
    receivePurchaseOrder,
  } satisfies AppStateContextValue;

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
