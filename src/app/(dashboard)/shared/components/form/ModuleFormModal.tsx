"use client";

import { FormEvent, useMemo, useState } from "react";
import { getModuleLabel } from "@/app/configs/navigation";
import { FormState, useAppState } from "@/app/context/app-state-context";
import {
  categoryPrefixMap,
  CutListRecord,
  generateNextNumber,
  generateSku,
  makeId,
  ProjectAreaRecord,
  PurchaseOrderRecord,
  ReceiptRecord,
  RecordsState,
} from "@/lib/inventoryMock";
import BaseFlyout from "@/components/BaseFlyout";
import {
  FormField,
  FormSelectField,
  FormTextArea,
} from "@/app/(dashboard)/shared/components/form/FormFields";

export function ModuleFormModal({ state }: { state: FormState }) {
  const {
    records,
    saveModuleRecord,
    saveProjectAreas,
    setCabinetFormState,
    setFormState,
  } = useAppState();

  const sourceList = records[state.moduleKey];
  const record = sourceList.find((entry) => entry.id === state.recordId) as
    | Record<string, unknown>
    | undefined;
  const formDefaults = {
    ...state.initialValues,
    ...record,
  } as Record<string, unknown>;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    saveModuleRecord(
      state.moduleKey,
      Object.fromEntries(formData.entries()),
      state.recordId
    );
  };

  return (
    <BaseFlyout
      open={!!state}
      onClose={() => setFormState(null)}
      title={`${state.mode === "create" ? "Create" : "Edit"} ${getModuleLabel(state.moduleKey)}`}
      width={680}
      zIndex={1210}
    >
      <form className="flyout-form" onSubmit={submit}>
        <div className="form-grid">
          {state.moduleKey === "items" && <ItemFields record={formDefaults} records={records} />}
          {state.moduleKey === "vendors" && <VendorFields record={formDefaults} records={records} />}
          {state.moduleKey === "projects" && (
            <ProjectFields
              onOpenCabinetForm={(projectId, areaId) => {
                setCabinetFormState({ projectId, areaId });
                setFormState(null);
              }}
              onSaveProjectAreas={saveProjectAreas}
              projectId={state.recordId}
              record={formDefaults}
            />
          )}
          {state.moduleKey === "cutLists" && <CutListFields record={formDefaults} records={records} />}
          {state.moduleKey === "workers" && <WorkerFields record={formDefaults} records={records} />}
          {state.moduleKey === "locations" && <LocationFields record={formDefaults} />}
          {state.moduleKey === "purchaseOrders" && (
            <PurchaseOrderFields record={formDefaults} records={records} />
          )}
          {state.moduleKey === "receiving" && (
            <ReceivingFields record={formDefaults} records={records} />
          )}
        </div>

        <div className="flyout-footer">
          <button className="secondary-button" type="button" onClick={() => setFormState(null)}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            Save
          </button>
        </div>
      </form>
    </BaseFlyout>
  );
}

function ItemFields({
  record,
  records,
}: {
  record?: Record<string, unknown>;
  records: RecordsState;
}) {
  return (
    <>
      <FormField name="title" label="Item Name" defaultValue={String(record?.title ?? "")} />
      <FormField name="sku" label="SKU" defaultValue={String(record?.sku ?? "")} />
      <FormField name="category" label="Category" defaultValue={String(record?.category ?? "")} />
      <FormField name="unit" label="Unit" defaultValue={String(record?.unit ?? "")} />
      <FormField
        name="stock"
        label="Current Stock"
        type="number"
        defaultValue={String(record?.stock ?? 0)}
      />
      <FormField
        name="assignedQty"
        label="Assigned Qty"
        type="number"
        defaultValue={String(record?.assignedQty ?? 0)}
      />
      <FormField
        name="reorderLevel"
        label="Reorder Level"
        type="number"
        defaultValue={String(record?.reorderLevel ?? 0)}
      />
      <FormSelectField
        name="vendorId"
        label="Vendor"
        defaultValue={String(record?.vendorId ?? records.vendors[0]?.id ?? "")}
        options={records.vendors.map((vendor) => ({ value: vendor.id, label: vendor.name }))}
      />
      <FormSelectField
        name="locationId"
        label="Location"
        defaultValue={String(record?.locationId ?? records.locations[0]?.id ?? "")}
        options={records.locations.map((location) => ({
          value: location.id,
          label: location.name,
        }))}
      />
      <FormTextArea name="notes" label="Notes" defaultValue={String(record?.notes ?? "")} />
    </>
  );
}

function VendorFields({
  record,
  records,
}: {
  record?: Record<string, unknown>;
  records: RecordsState;
}) {
  return (
    <>
      <FormField
        name="number"
        label="Vendor Number"
        readOnly
        defaultValue={String(
          record?.number ??
            generateNextNumber(
              "VND",
              records.vendors.map((vendor) => vendor.number)
            )
        )}
      />
      <FormField name="name" label="Vendor Name" defaultValue={String(record?.name ?? "")} />
      <FormField name="contact" label="Contact" defaultValue={String(record?.contact ?? "")} />
      <FormField name="phone" label="Phone" defaultValue={String(record?.phone ?? "")} />
      <FormField name="email" label="Email" defaultValue={String(record?.email ?? "")} />
      <FormField name="category" label="Category" defaultValue={String(record?.category ?? "")} />
      <FormTextArea
        name="address"
        label="Address"
        defaultValue={String(record?.address ?? "")}
        required
      />
    </>
  );
}

function normalizeProjectAreas(value: unknown): ProjectAreaRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((area) => {
    const source = area as Partial<ProjectAreaRecord>;
    const now = new Date().toISOString();
    const createdAt = source.createdAt || now;

    return {
      id: source.id || makeId("area"),
      areaName: source.areaName || "",
      areaCode: (source.areaCode || "").toUpperCase(),
      notes: source.notes || "",
      createdAt,
      updatedAt: source.updatedAt || createdAt,
    };
  });
}

function ProjectFields({
  record,
  projectId,
  onSaveProjectAreas,
  onOpenCabinetForm,
}: {
  record?: Record<string, unknown>;
  projectId?: string;
  onSaveProjectAreas: (projectId: string, areas: ProjectAreaRecord[]) => void;
  onOpenCabinetForm: (projectId: string, areaId: string) => void;
}) {
  const [areas, setAreas] = useState<ProjectAreaRecord[]>(() =>
    normalizeProjectAreas(record?.areas)
  );
  const [areaSaveMessage, setAreaSaveMessage] = useState("");
  const [areaDraft, setAreaDraft] = useState({
    id: "",
    areaName: "",
    areaCode: "",
    notes: "",
  });
  const canSaveArea = Boolean(areaDraft.areaName.trim() && areaDraft.areaCode.trim());

  const resetAreaDraft = () => {
    setAreaDraft({ id: "", areaName: "", areaCode: "", notes: "" });
  };

  const saveArea = () => {
    if (!canSaveArea) {
      return;
    }

    const now = new Date().toISOString();
    const areaName = areaDraft.areaName.trim();
    const nextArea: ProjectAreaRecord = {
      id: areaDraft.id || makeId("area"),
      areaName,
      areaCode: areaDraft.areaCode.trim().toUpperCase(),
      notes: areaDraft.notes.trim(),
      createdAt: areas.find((area) => area.id === areaDraft.id)?.createdAt || now,
      updatedAt: now,
    };
    const nextAreas = areas.some((area) => area.id === nextArea.id)
      ? areas.map((area) => (area.id === nextArea.id ? nextArea : area))
      : [...areas, nextArea];

    setAreas(nextAreas);
    if (projectId) {
      onSaveProjectAreas(projectId, nextAreas);
      setAreaSaveMessage("Area saved. You can add cabinets to it now.");
    } else {
      setAreaSaveMessage("Area saved in this project draft. Save the project to add cabinets.");
    }
    resetAreaDraft();
  };

  const deleteArea = (areaId: string) => {
    const nextAreas = areas.filter((candidate) => candidate.id !== areaId);

    setAreas(nextAreas);
    if (projectId) {
      onSaveProjectAreas(projectId, nextAreas);
      setAreaSaveMessage("Area deleted.");
    }
    if (areaDraft.id === areaId) {
      resetAreaDraft();
    }
  };

  return (
    <>
      <input name="areasJson" type="hidden" value={JSON.stringify(areas)} readOnly />
      <div className="form-section-title field-full">
        <h3>Project Info</h3>
        <p>Site / Address is project metadata. Areas / Rooms are attached below.</p>
      </div>
      <label className="field">
        <span>Project Name</span>
        <input
          defaultValue={String(record?.name ?? "")}
          name="name"
          placeholder="Smith Kitchen"
          type="text"
        />
      </label>
      <label className="field">
        <span>Job Number</span>
        <input
          defaultValue={String(record?.code ?? "")}
          name="code"
          placeholder="J-1001"
          type="text"
        />
      </label>
      <FormField
        name="customerName"
        label="Customer Name"
        required={false}
        defaultValue={String(record?.customerName ?? "")}
        placeholder="Customer name"
      />
      <FormField
        name="projectDate"
        label="Date"
        type="date"
        required={false}
        defaultValue={String(record?.projectDate ?? "")}
      />
      <FormField
        name="preparedBy"
        label="Prepared By"
        required={false}
        defaultValue={String(record?.preparedBy ?? "")}
        placeholder="Prepared by"
      />
      <FormSelectField
        name="status"
        label="Status"
        defaultValue={String(record?.status ?? "Draft")}
        options={["Draft", "In Review", "Final"].map(
          (value) => ({ value, label: value })
        )}
      />
      <FormField
        name="budget"
        label="Budget"
        type="number"
        defaultValue={String(record?.budget ?? 0)}
      />
      <FormTextArea name="notes" label="Notes" defaultValue={String(record?.notes ?? "")} />
      <FormField
        name="siteAddress"
        label="Site / Address"
        required={false}
        defaultValue={String(record?.siteAddress ?? record?.location ?? record?.addressLine1 ?? "")}
        placeholder="Site or address"
      />
      <section className="project-form-section field-full">
        <div className="section-header">
          <div>
            <h3>Areas / Rooms</h3>
            <p>Add Kitchen, Pantry, Bedroom, or any other work area for this project.</p>
          </div>
        </div>
        <div className="area-editor-grid">
          <label className="field">
            <span>Area Name</span>
            <input
              value={areaDraft.areaName}
              onChange={(event) =>
                setAreaDraft((current) => ({ ...current, areaName: event.target.value }))
              }
              placeholder="Kitchen"
              type="text"
            />
          </label>
          <label className="field">
            <span>Area Code</span>
            <input
              value={areaDraft.areaCode}
              onChange={(event) =>
                setAreaDraft((current) => ({ ...current, areaCode: event.target.value }))
              }
              placeholder="KIT"
              type="text"
            />
          </label>
          <label className="field field-full">
            <span>Area Notes</span>
            <textarea
              value={areaDraft.notes}
              onChange={(event) =>
                setAreaDraft((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Area / room notes"
              rows={3}
            />
          </label>
          <div className="pill-actions field-full">
            <button
              className="primary-button"
              disabled={!canSaveArea}
              onClick={saveArea}
              type="button"
            >
              Save Area
            </button>
            {areaDraft.id && (
              <button className="secondary-button" onClick={resetAreaDraft} type="button">
                Cancel Area Edit
              </button>
            )}
          </div>
        </div>
        {areaSaveMessage && <div className="form-message success">{areaSaveMessage}</div>}
        <div className="area-list">
          {areas.map((area) => (
            <article className="area-card" key={area.id}>
              <div className="area-card-header">
                <div>
                  <h3>{area.areaName || "Untitled Area"}</h3>
                  <span className="area-code">{area.areaCode || "No Code"}</span>
                </div>
                {projectId && (
                  <button
                    className="primary-button"
                    onClick={() => onOpenCabinetForm(projectId, area.id)}
                    type="button"
                  >
                    + Add Cabinet / Item
                  </button>
                )}
              </div>
              {area.notes && <p className="area-notes">{area.notes}</p>}
              <div className="pill-actions">
                <button
                  className="secondary-button"
                  onClick={() =>
                    setAreaDraft({
                      id: area.id,
                      areaName: area.areaName,
                      areaCode: area.areaCode,
                      notes: area.notes,
                    })
                  }
                  type="button"
                >
                  Edit Area
                </button>
                <button
                  className="table-action danger"
                  onClick={() => deleteArea(area.id)}
                  type="button"
                >
                  Delete Area
                </button>
              </div>
            </article>
          ))}
          {areas.length === 0 && (
            <div className="empty-state">No areas yet. Add a room before saving if needed.</div>
          )}
        </div>
      </section>
    </>
  );
}

function CutListFields({
  record,
  records,
}: {
  record?: Record<string, unknown>;
  records: RecordsState;
}) {
  const materialOptions = [
    { value: "5/8 White Melamine", label: "5/8 White Melamine" },
    { value: "3/4 White Melamine", label: "3/4 White Melamine" },
    { value: "5/8 Plywood", label: "5/8 Plywood" },
    { value: "3/4 Plywood", label: "3/4 Plywood" },
    { value: "Custom", label: "Custom" },
  ];
  const materialThicknessByName: Record<string, number> = {
    "5/8 White Melamine": 0.625,
    "3/4 White Melamine": 0.75,
    "5/8 Plywood": 0.625,
    "3/4 Plywood": 0.75,
  };
  const defaultMaterial = record?.customMaterialName
    ? "Custom"
    : String(record?.interiorMaterial ?? "5/8 White Melamine");

  return (
    <>
      <FormSelectField
        name="projectId"
        label="Project"
        defaultValue={String(record?.projectId ?? records.projects[0]?.id ?? "")}
        options={records.projects.map((project) => ({
          value: project.id,
          label: `${project.name} (${project.code})`,
        }))}
      />
      <FormField name="code" label="Cabinet Code" defaultValue={String(record?.code ?? "")} />
      <FormField
        name="itemName"
        label="Item Name"
        defaultValue={String(record?.itemName ?? "")}
      />
      <FormSelectField
        name="cabinetCategory"
        label="Cabinet Category"
        defaultValue={String(record?.cabinetCategory ?? "Base")}
        options={["Base", "Upper", "Tower / Tall", "Open"].map((value) => ({ value, label: value }))}
      />
      <FormSelectField
        name="cabinetSubtype"
        label="Cabinet Subtype"
        defaultValue={String(record?.cabinetSubtype ?? "Standard")}
        options={["Standard", "Shelves", "Drawer", "Sink"].map((value) => ({ value, label: value }))}
      />
      <FormSelectField
        name="inputUnit"
        label="Input Unit"
        defaultValue={String(record?.inputUnit ?? "in")}
        options={[
          { value: "in", label: "in" },
          { value: "mm", label: "mm" },
        ]}
      />
      <FormField
        name="width"
        label="Width"
        type="number"
        step="0.001"
        defaultValue={String(record?.width ?? 30)}
      />
      <FormField
        name="height"
        label="Height"
        type="number"
        step="0.001"
        defaultValue={String(record?.height ?? 34.5)}
      />
      <FormField
        name="depth"
        label="Full Cabinet Depth"
        type="number"
        step="0.001"
        defaultValue={String(record?.depth ?? 24)}
      />
      <FormField
        name="quantity"
        label="Cabinet Qty"
        type="number"
        defaultValue={String(record?.quantity ?? 1)}
      />
      <FormSelectField
        name="interiorMaterial"
        label="Interior Material"
        defaultValue={defaultMaterial}
        options={materialOptions}
      />
      <FormField
        name="customMaterialName"
        label="Custom Material Name"
        required={false}
        defaultValue={String(record?.customMaterialName ?? "")}
      />
      <FormField
        name="customMaterialThickness"
        label="Custom Material Thickness"
        type="number"
        step="0.001"
        required={false}
        defaultValue={String(record?.customMaterialThickness ?? 0)}
      />
      <FormField
        name="materialThickness"
        label="Material Thickness"
        type="number"
        step="0.001"
        defaultValue={String(record?.materialThickness ?? materialThicknessByName[defaultMaterial] ?? 0.625)}
      />
      <FormField
        name="doorThickness"
        label="Door Thickness"
        type="number"
        step="0.001"
        defaultValue={String(record?.doorThickness ?? 0.75)}
      />
      <FormField
        name="bumperAllowance"
        label="Bumper Allowance"
        type="number"
        step="0.001"
        defaultValue={String(record?.bumperAllowance ?? 0.125)}
      />
      <FormSelectField
        name="finishedSides"
        label="Finished Sides"
        defaultValue={String(record?.finishedSides ?? "Front")}
        options={[
          { value: "Front", label: "Front" },
          { value: "Front and Back", label: "Front and Back" },
        ]}
      />
      <FormSelectField
        name="upperBottomCondition"
        label="Upper Bottom Condition"
        defaultValue={String(record?.upperBottomCondition ?? "Regular / Visible Bottom")}
        options={[
          { value: "Regular / Visible Bottom", label: "Regular / Visible Bottom" },
          { value: "Finished Bottom", label: "Finished Bottom" },
          { value: "Light Valance", label: "Light Valance" },
        ]}
      />
      <FormField
        name="finishedMaterialThicknessM2"
        label="Finished Material Thickness M2"
        type="number"
        step="0.001"
        required={false}
        defaultValue={String(record?.finishedMaterialThicknessM2 ?? 0)}
      />
      <FormField
        name="lightValanceHeight"
        label="Light Valance Height"
        type="number"
        step="0.001"
        required={false}
        defaultValue={String(record?.lightValanceHeight ?? 0)}
      />
      <FormSelectField
        name="backOption"
        label="Back Option"
        defaultValue={String(record?.backOption ?? "fullBack")}
        options={[
          { value: "fullBack", label: "Full Back" },
          { value: "noBack", label: "No Back / Rails" },
        ]}
      />
      <FormField
        name="shelfQty"
        label="Shelf Qty"
        type="number"
        required={false}
        defaultValue={String(record?.shelfQty ?? 0)}
      />
      <FormSelectField
        name="shelfType"
        label="Shelf Type"
        defaultValue={String(record?.shelfType ?? "Fixed Shelf")}
        options={[
          { value: "Fixed Shelf", label: "Fixed Shelf" },
          { value: "Adjustable Shelf - Pins", label: "Adjustable Shelf - Pins" },
          { value: "Adjustable Shelf - Pilasters", label: "Adjustable Shelf - Pilasters" },
        ]}
      />
      <FormSelectField
        name="shelfFinish"
        label="Shelf Finish"
        defaultValue={String(record?.shelfFinish ?? "White")}
        options={["White", "Black", "Matching"].map((value) => ({ value, label: value }))}
      />
      <FormSelectField
        name="slideType"
        label="Drawer Bank Slide Type"
        defaultValue={String(record?.slideType ?? "")}
        options={[
          { value: "", label: "Not a drawer bank" },
          { value: "ballBearing", label: "Ball Bearing" },
          { value: "undermount", label: "Undermount" },
        ]}
      />
      <FormField
        name="slideLength"
        label="Drawer Bank Slide Length"
        type="number"
        step="0.001"
        required={false}
        defaultValue={String(record?.slideLength ?? 0)}
      />
      <FormField
        name="drawerQty"
        label="Drawer Bank Drawer Qty"
        type="number"
        required={false}
        defaultValue={String(record?.drawerQty ?? 0)}
      />
      <FormField
        name="drawerHeights"
        label="Drawer Heights (comma separated)"
        required={false}
        defaultValue={Array.isArray(record?.drawerHeights) ? record.drawerHeights.join(", ") : ""}
      />
      <FormSelectField
        name="status"
        label="Status"
        defaultValue={String(record?.status ?? "Draft")}
        options={(["Draft", "Ready", "Issued"] as CutListRecord["status"][]).map((value) => ({
          value,
          label: value,
        }))}
      />
      <FormTextArea name="notes" label="Notes" defaultValue={String(record?.notes ?? "")} />
    </>
  );
}

function WorkerFields({
  record,
  records,
}: {
  record?: Record<string, unknown>;
  records: RecordsState;
}) {
  return (
    <>
      <FormField name="name" label="Worker Name" defaultValue={String(record?.name ?? "")} />
      <FormField name="role" label="Role" defaultValue={String(record?.role ?? "")} />
      <FormField name="phone" label="Phone" defaultValue={String(record?.phone ?? "")} />
      <FormSelectField
        name="projectId"
        label="Project"
        defaultValue={String(record?.projectId ?? records.projects[0]?.id ?? "")}
        options={records.projects.map((project) => ({
          value: project.id,
          label: project.name,
        }))}
      />
      <FormField
        name="assignedMaterials"
        label="Assigned Materials"
        type="number"
        defaultValue={String(record?.assignedMaterials ?? 0)}
      />
    </>
  );
}

function LocationFields({ record }: { record?: Record<string, unknown> }) {
  return (
    <>
      <FormField name="name" label="Location Name" defaultValue={String(record?.name ?? "")} />
      <FormField name="type" label="Type" defaultValue={String(record?.type ?? "")} />
      <FormField name="manager" label="Manager" defaultValue={String(record?.manager ?? "")} />
      <FormField
        name="capacity"
        label="Capacity"
        type="number"
        defaultValue={String(record?.capacity ?? 0)}
      />
    </>
  );
}

function PurchaseOrderFields({
  record,
  records,
}: {
  record?: Record<string, unknown>;
  records: RecordsState;
}) {
  const existingSkus = useMemo(
    () => records.purchaseOrders.flatMap((po) => po.lines.map((line) => line.sku)),
    [records.purchaseOrders]
  );

  const initialLines = Array.isArray(record?.lines)
    ? (record.lines as PurchaseOrderRecord["lines"])
    : [
        {
          description: "",
          category: "Plywood",
          sku: generateSku("Plywood", existingSkus),
          unit: "Nos",
          qty: 1,
          price: 0,
        },
      ];

  const [lines, setLines] = useState(initialLines);

  const updateLine = (
    index: number,
    key: keyof PurchaseOrderRecord["lines"][number],
    value: string
  ) => {
    setLines((current) =>
      current.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line;
        }

        if (key === "category") {
          const siblingSkus = [
            ...existingSkus,
            ...current.filter((_, siblingIndex) => siblingIndex !== index).map((entry) => entry.sku),
          ];
          return {
            ...line,
            category: value,
            sku: generateSku(value, siblingSkus),
          };
        }

        if (key === "qty" || key === "price") {
          return {
            ...line,
            [key]: Number(value),
          };
        }

        return {
          ...line,
          [key]: value,
        };
      })
    );
  };

  const addLine = () => {
    const nextCategory = "Plywood";
    setLines((current) => [
      ...current,
      {
        description: "",
        category: nextCategory,
        sku: generateSku(
          nextCategory,
          [...existingSkus, ...current.map((line) => line.sku)]
        ),
        unit: "Nos",
        qty: 1,
        price: 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
  };

  const serializedLines = JSON.stringify(
    lines.filter((line) => line.description.trim() && line.category && line.unit)
  );

  return (
    <>
      <FormField
        name="number"
        label="PO Number"
        readOnly
        defaultValue={String(
          record?.number ??
            generateNextNumber(
              "PO",
              records.purchaseOrders.map((po) => po.number)
            )
        )}
      />
      <FormSelectField
        name="vendorId"
        label="Vendor"
        defaultValue={String(record?.vendorId ?? records.vendors[0]?.id ?? "")}
        options={records.vendors.map((vendor) => ({
          value: vendor.id,
          label: `${vendor.name} (${vendor.number})`,
        }))}
      />
      <FormField
        name="orderedBy"
        label="Order Placed By"
        defaultValue={String(record?.orderedBy ?? "")}
      />
      <FormField
        name="orderDate"
        label="Order Date"
        type="date"
        defaultValue={String(record?.orderDate ?? new Date().toISOString().slice(0, 10))}
      />
      <FormField
        name="expectedDate"
        label="Expected Date"
        type="date"
        defaultValue={String(record?.expectedDate ?? new Date().toISOString().slice(0, 10))}
      />
      <FormSelectField
        name="projectId"
        label="Project Name"
        required={false}
        defaultValue={String(record?.projectId ?? "")}
        options={[
          { value: "", label: "No project linked" },
          ...records.projects.map((project) => ({
            value: project.id,
            label: project.name,
          })),
        ]}
      />
      <input type="hidden" name="lines" value={serializedLines} readOnly />
      <section className="po-lines-section field-full">
        <div className="po-lines-header">
          <div>
            <h3>PO Lines</h3>
            <p>Each line includes category-based SKU generation, unit, qty, and decimal pricing.</p>
          </div>
          <button className="secondary-button" type="button" onClick={addLine}>
            Add Line
          </button>
        </div>
        <div className="po-lines-table">
          <div className="po-lines-row po-lines-create-grid po-lines-row-header">
            <span>Description</span>
            <span>Category</span>
            <span>SKU</span>
            <span>Unit</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Actions</span>
          </div>
          {lines.map((line, index) => (
            <div className="po-lines-row po-lines-create-grid wide" key={`${line.sku}-${index}`}>
              <div className="po-line-cell">
                <span className="po-line-mobile-label">Description</span>
                <input
                  aria-label={`PO line ${index + 1} description`}
                  type="text"
                  value={line.description}
                  onChange={(event) => updateLine(index, "description", event.target.value)}
                />
              </div>
              <div className="po-line-cell">
                <span className="po-line-mobile-label">Category</span>
                <select
                  aria-label={`PO line ${index + 1} category`}
                  value={line.category}
                  onChange={(event) => updateLine(index, "category", event.target.value)}
                >
                  {Object.keys(categoryPrefixMap).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="po-line-cell">
                <span className="po-line-mobile-label">SKU</span>
                <input aria-label={`PO line ${index + 1} sku`} value={line.sku} readOnly />
              </div>
              <div className="po-line-cell">
                <span className="po-line-mobile-label">Unit</span>
                <input
                  aria-label={`PO line ${index + 1} unit`}
                  value={line.unit}
                  onChange={(event) => updateLine(index, "unit", event.target.value)}
                />
              </div>
              <div className="po-line-cell">
                <span className="po-line-mobile-label">Qty</span>
                <input
                  aria-label={`PO line ${index + 1} quantity`}
                  type="number"
                  min="0"
                  value={line.qty}
                  onChange={(event) => updateLine(index, "qty", event.target.value)}
                />
              </div>
              <div className="po-line-cell">
                <span className="po-line-mobile-label">Price</span>
                <input
                  aria-label={`PO line ${index + 1} price`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.price}
                  onChange={(event) => updateLine(index, "price", event.target.value)}
                />
              </div>
              <div className="po-line-cell po-line-actions">
                <button
                  className="table-action danger"
                  type="button"
                  onClick={() => removeLine(index)}
                  disabled={lines.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ReceivingFields({
  record,
  records,
}: {
  record?: Record<string, unknown>;
  records: RecordsState;
}) {
  const defaultLines = Array.isArray(record?.lines)
    ? (record.lines as ReceiptRecord["lines"])
    : [];

  return (
    <>
      <FormField
        name="receiptNo"
        label="Receipt No"
        defaultValue={String(
          record?.receiptNo ??
            generateNextNumber(
              "RCV",
              records.receiving.map((receipt) => receipt.receiptNo)
            )
        )}
        readOnly
      />
      <FormSelectField
        name="poId"
        label="PO"
        defaultValue={String(record?.poId ?? records.purchaseOrders[0]?.id ?? "")}
        options={records.purchaseOrders.map((po) => ({ value: po.id, label: po.number }))}
      />
      <FormSelectField
        name="receivedLocation"
        label="Received Location"
        defaultValue={String(record?.receivedLocation ?? "Warehouse")}
        options={[
          { value: "Warehouse", label: "Warehouse" },
          { value: "Site", label: "Site" },
        ]}
      />
      <FormField
        name="receivedBy"
        label="Received By"
        defaultValue={String(record?.receivedBy ?? "")}
      />
      <FormField
        name="date"
        label="Receipt Date"
        type="date"
        defaultValue={String(record?.date ?? new Date().toISOString().slice(0, 10))}
      />
      <FormField
        name="status"
        label="Status"
        readOnly
        required={false}
        defaultValue={String(record?.status ?? "Auto generated on receipt")}
      />
      <FormField
        name="packingSlipImage"
        label="Packing Slip Image"
        required={false}
        defaultValue={String(record?.packingSlipImage ?? "")}
      />
      <input type="hidden" name="lines" value={JSON.stringify(defaultLines)} readOnly />
      <FormTextArea name="notes" label="Notes" defaultValue={String(record?.notes ?? "")} />
    </>
  );
}
