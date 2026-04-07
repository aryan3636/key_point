"use client";

import {
  AUTH_KEY,
  AuthUser,
  ItemRecord,
  LocationRecord,
  makeId,
  ModuleKey,
  MovementRecord,
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

type AppStateContextValue = {
  theme: ThemeMode;
  user: AuthUser | null;
  records: RecordsState;
  activeModule: ModuleKey;
  formState: FormState | null;
  importState: ImportState | null;
  itemActionState: ItemActionState | null;
  detailState: DetailState | null;
  query: string;
  selectedIds: Record<string, string>;
  activeList: Array<Record<string, unknown> & { id: string }>;
  selectedRecord: (Record<string, unknown> & { id: string }) | null;
  setUser: (user: AuthUser | null) => void;
  setTheme: (updater: ThemeMode | ((current: ThemeMode) => ThemeMode)) => void;
  setActiveModule: (moduleKey: ModuleKey) => void;
  setQuery: (value: string) => void;
  setFormState: (state: FormState | null) => void;
  setImportState: (state: ImportState | null) => void;
  setItemActionState: (state: ItemActionState | null) => void;
  setDetailState: (state: DetailState | null) => void;
  setSelectedId: (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    id: string
  ) => void;
  saveModuleRecord: (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    values: Record<string, FormDataEntryValue>,
    existingId?: string
  ) => void;
  removeModuleRecord: (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    id: string
  ) => void;
  runImport: (
    moduleKey: Exclude<ModuleKey, "dashboard">,
    rows: Array<Record<string, string>>
  ) => void;
  saveItemAction: (values: Record<string, FormDataEntryValue>) => void;
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

function readStoredRecords(): RecordsState {
  if (typeof window === "undefined") {
    return seedRecords();
  }
  const savedState = window.localStorage.getItem(STORAGE_KEY);
  return savedState ? (JSON.parse(savedState) as RecordsState) : seedRecords();
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
  const [query, setQuery] = useState("");
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
    const sourceList = records[activeModule];
    if (!query.trim()) {
      return sourceList as Array<Record<string, unknown> & { id: string }>;
    }

    const lower = query.toLowerCase();
    return sourceList.filter((entry) =>
      JSON.stringify(entry).toLowerCase().includes(lower)
    ) as Array<Record<string, unknown> & { id: string }>;
  }, [activeModule, query, records]);

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
          name: text("name"),
          contact: text("contact"),
          phone: text("phone"),
          email: text("email"),
          category: text("category"),
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
          status: text("status"),
          location: text("location"),
          budget: number("budget"),
          updatedAt: now,
        };
        next.projects = sortByUpdatedAt(
          existingId
            ? current.projects.map((item) => (item.id === id ? record : item))
            : [record, ...current.projects]
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
        const lines = text("lines")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [itemId, qty, rate] = line.split(",").map((part) => part.trim());
            return { itemId, qty: Number(qty), rate: Number(rate) };
          });

        const record: PurchaseOrderRecord = {
          id,
          number: text("number"),
          vendorId: text("vendorId"),
          status: text("status"),
          orderDate: text("orderDate"),
          expectedDate: text("expectedDate"),
          projectIds: text("projectIds")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
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
        const record: ReceiptRecord = {
          id,
          receiptNo: text("receiptNo"),
          poId: text("poId"),
          locationId: text("locationId"),
          receivedBy: text("receivedBy"),
          packingSlip: text("packingSlip"),
          date: text("date"),
          status: text("status"),
          notes: text("notes"),
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
            name: row.name || `Imported Vendor ${index + 1}`,
            contact: row.contact || `Imported Contact ${index + 1}`,
            phone: row.phone || "+91 90000 00000",
            email:
              row.email ||
              `${(row.name || `vendor.${index + 1}`).toLowerCase().replace(/\s+/g, ".")}@import.test`,
            category: row.category || "Imported",
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
            name: row.name || `Imported Project ${index + 1}`,
            code: row.code || `IMP-${index + 10}`,
            status: row.status || "Planning",
            location: row.location || "Imported Location",
            budget: Number(row.budget || 1000000 * (index + 1)),
            updatedAt: now,
          })),
          ...current.projects,
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
            const parsedLines = (row.lines || "")
              .split(";")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [itemName, qty, rate] = line.split("|").map((part) => part.trim());
                return {
                  itemId:
                    current.items.find((item) => item.title === itemName)?.id ??
                    current.items[index % current.items.length]?.id ??
                    "",
                  qty: Number(qty || 0),
                  rate: Number(rate || 0),
                };
              });

            return {
              id: makeId("po"),
              number: row.number || `PO-IMP-${index + 1}`,
              vendorId:
                current.vendors.find((vendor) => vendor.name === row.vendorName)?.id ??
                current.vendors[0]?.id ??
                "",
              status: row.status || "Open",
              orderDate: row.orderDate || "2026-04-06",
              expectedDate: row.expectedDate || "2026-04-15",
              projectIds: (row.projectNames || "")
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
                .map(
                  (projectName) =>
                    current.projects.find((project) => project.name === projectName)?.id
                )
                .filter(Boolean) as string[],
              lines:
                parsedLines.length > 0
                  ? parsedLines
                  : [
                      {
                        itemId: current.items[index % current.items.length]?.id ?? "",
                        qty: 10 + index * 5,
                        rate: 500,
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
            locationId:
              current.locations.find((location) => location.name === row.locationName)?.id ??
              current.locations[0]?.id ??
              "",
            receivedBy: row.receivedBy || current.workers[0]?.name || "Imported Receiver",
            packingSlip: row.packingSlip || "IMPORTED-SLIP",
            date: row.date || "2026-04-06",
            status: row.status || "Partial",
            notes: row.notes || "Imported via CSV bulk upload.",
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

  const value = {
    theme,
    user,
    records,
    activeModule,
    formState,
    importState,
    itemActionState,
    detailState,
    query,
    selectedIds,
    activeList,
    selectedRecord,
    setUser,
    setTheme,
    setActiveModule,
    setQuery,
    setFormState,
    setImportState,
    setItemActionState,
    setDetailState,
    setSelectedId,
    saveModuleRecord,
    removeModuleRecord,
    runImport,
    saveItemAction,
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
