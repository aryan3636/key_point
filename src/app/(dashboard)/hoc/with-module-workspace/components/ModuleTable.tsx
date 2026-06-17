"use client";

import { useState } from "react";
import { ModuleKey, RecordsState } from "@/lib/inventoryMock";

export function ModuleTable({
  moduleKey,
  records,
  recordsState,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onReceive,
  onAllocate,
}: {
  moduleKey: Exclude<ModuleKey, "dashboard">;
  records: Array<Record<string, unknown> & { id: string }>;
  recordsState: RecordsState;
  selectedId?: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReceive?: (id: string) => void;
  onAllocate?: (id: string) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState("");

  const columns =
    moduleKey === "items"
      ? ["Item", "SKU", "Stock", "Updated"]
      : moduleKey === "vendors"
        ? ["Vendor No", "Vendor", "Contact", "Updated"]
        : moduleKey === "projects"
          ? ["Project", "Code", "Status", "Location"]
          : moduleKey === "cutLists"
            ? ["Cabinet", "Project", "Size", "Status"]
            : moduleKey === "workers"
              ? ["Worker", "Role", "Phone", "Assigned"]
              : moduleKey === "locations"
                ? ["Location", "Type", "Manager", "Capacity"]
                : moduleKey === "purchaseOrders"
                  ? ["PO", "Vendor", "Project", "Expected"]
                  : ["PO", "Vendor", "Status", "Expected"];

  const rowForRecord = (record: Record<string, unknown>) => {
    if (moduleKey === "items") {
      return [
        String(record.title),
        String(record.sku),
        `${String(record.stock)} ${String(record.unit)}`,
        String(record.updatedAt).slice(0, 10),
      ];
    }
    if (moduleKey === "vendors") {
      return [
        String(record.number),
        String(record.name),
        String(record.contact),
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
    if (moduleKey === "cutLists") {
      const project = recordsState.projects.find((entry) => entry.id === record.projectId);
      return [
        `${String(record.code)} - ${String(record.itemName)}`,
        project?.name ?? "No project",
        `${String(record.width)} x ${String(record.height)} x ${String(record.depth)}`,
        String(record.status),
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
      const vendor = recordsState.vendors.find((entry) => entry.id === record.vendorId);
      const project = recordsState.projects.find((entry) => entry.id === record.projectId);
      return [
        String(record.number),
        vendor?.name ?? String(record.vendorId),
        project?.name ?? "No project",
        String(record.expectedDate),
      ];
    }
    const vendor = recordsState.vendors.find((entry) => entry.id === record.vendorId);
    return [
      String(record.number),
      vendor?.name ?? String(record.vendorId),
      String(record.status),
      String(record.expectedDate),
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
        <div
          className={`table-row record-row ${selectedId === record.id ? "is-selected" : ""}`}
          key={record.id}
          onClick={() => {
            setOpenMenuId("");
            onSelect(record.id);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpenMenuId("");
              onSelect(record.id);
            }
          }}
          role="button"
          tabIndex={0}
        >
          {rowForRecord(record).map((value, index) => (
            <span key={`${record.id}-${index}`}>{value}</span>
          ))}
          <span className="row-actions">
            {moduleKey === "receiving" ? (
              <button
                className="table-action"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onReceive?.(record.id);
                }}
              >
                Receive
              </button>
            ) : moduleKey === "items" ? (
              <span className="menu-shell">
                <button
                  className="table-action menu-trigger"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenMenuId((current) => (current === record.id ? "" : record.id));
                  }}
                >
                  ...
                </button>
                {openMenuId === record.id && (
                  <span className="action-menu">
                    <button
                      className="table-action"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId("");
                        onAllocate?.(record.id);
                      }}
                    >
                      Allocate
                    </button>
                    <button
                      className="table-action"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId("");
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
                        setOpenMenuId("");
                        onDelete(record.id);
                      }}
                    >
                      Delete
                    </button>
                  </span>
                )}
              </span>
            ) : (
              <>
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
              </>
            )}
          </span>
        </div>
      ))}
      {records.length === 0 && (
        <div className="empty-state">No records match the current search.</div>
      )}
    </div>
  );
}
