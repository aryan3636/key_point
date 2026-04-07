"use client";

import { ModuleKey } from "@/lib/inventoryMock";

export function ModuleTable({
  moduleKey,
  records,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: {
  moduleKey: Exclude<ModuleKey, "dashboard">;
  records: Array<Record<string, unknown> & { id: string }>;
  selectedId?: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const columns =
    moduleKey === "items"
      ? ["Item", "SKU", "Stock", "Location"]
      : moduleKey === "vendors"
        ? ["Vendor", "Contact", "Category", "Updated"]
        : moduleKey === "projects"
          ? ["Project", "Code", "Status", "Location"]
          : moduleKey === "workers"
            ? ["Worker", "Role", "Phone", "Assigned"]
            : moduleKey === "locations"
              ? ["Location", "Type", "Manager", "Capacity"]
              : moduleKey === "purchaseOrders"
                ? ["PO", "Vendor", "Status", "Expected"]
                : ["Receipt", "PO", "Status", "Date"];

  const rowForRecord = (record: Record<string, unknown>) => {
    if (moduleKey === "items") {
      return [
        String(record.title),
        String(record.sku),
        String(record.stock),
        String(record.locationId),
      ];
    }
    if (moduleKey === "vendors") {
      return [
        String(record.name),
        String(record.contact),
        String(record.category),
        String(record.updatedAt).slice(0, 10),
      ];
    }
    if (moduleKey === "projects") {
      return [
        String(record.name),
        String(record.code),
        String(record.status),
        String(record.location),
      ];
    }
    if (moduleKey === "workers") {
      return [
        String(record.name),
        String(record.role),
        String(record.phone),
        String(record.assignedMaterials),
      ];
    }
    if (moduleKey === "locations") {
      return [
        String(record.name),
        String(record.type),
        String(record.manager),
        String(record.capacity),
      ];
    }
    if (moduleKey === "purchaseOrders") {
      return [
        String(record.number),
        String(record.vendorId),
        String(record.status),
        String(record.expectedDate),
      ];
    }
    return [
      String(record.receiptNo),
      String(record.poId),
      String(record.status),
      String(record.date),
    ];
  };

  return (
    <div className="table-shell">
      <div className="table-header table-row">
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
        <span>Actions</span>
      </div>
      {records.map((record) => (
        <button
          className={`table-row record-row ${selectedId === record.id ? "is-selected" : ""}`}
          key={record.id}
          type="button"
          onClick={() => onSelect(record.id)}
        >
          {rowForRecord(record).map((value, index) => (
            <span key={`${record.id}-${index}`}>{value}</span>
          ))}
          <span className="row-actions">
            <button
              className="table-action"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(record.id);
              }}
            >
              Edit
            </button>
            <button
              className="table-action danger"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(record.id);
              }}
            >
              Delete
            </button>
          </span>
        </button>
      ))}
      {records.length === 0 && (
        <div className="empty-state">No records match the current search.</div>
      )}
    </div>
  );
}
