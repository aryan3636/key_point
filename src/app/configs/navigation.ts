import { ModuleKey } from "@/lib/inventoryMock";

export const navigationItems: Array<{
  key: ModuleKey;
  label: string;
  blurb: string;
}> = [
  { key: "purchaseOrders", label: "Purchase Orders", blurb: "PO header, lines, and project tagging" },
  { key: "receiving", label: "Receiving", blurb: "Partial and full receipt tracking" },
  { key: "items", label: "Items", blurb: "Stock, movement history, and issue flows" },
  { key: "vendors", label: "Vendors", blurb: "Supplier roster and details" },
  { key: "projects", label: "Projects", blurb: "Project tagging and material usage" },
  { key: "workers", label: "Workers", blurb: "Assigned materials and returns" },
  // Locations is intentionally hidden for now. Uncomment after client confirmation.
  // { key: "locations", label: "Locations", blurb: "Storage points and capacity" },
  { key: "dashboard", label: "Overview", blurb: "Summary cards and recent activity" },
];

export function getModuleLabel(key: Exclude<ModuleKey, "dashboard">) {
  return navigationItems.find((item) => item.key === key)?.label ?? key;
}
