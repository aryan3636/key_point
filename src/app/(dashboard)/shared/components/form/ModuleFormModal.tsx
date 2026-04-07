"use client";

import { FormEvent } from "react";
import { getModuleLabel } from "@/app/configs/navigation";
import { FormState, useAppState } from "@/app/context/app-state-context";
import { RecordsState } from "@/lib/inventoryMock";
import BaseFlyout from "@/components/BaseFlyout";
import {
  FormField,
  FormSelectField,
  FormTextArea,
} from "@/app/(dashboard)/shared/components/form/FormFields";

export function ModuleFormModal({ state }: { state: FormState }) {
  const { records, saveModuleRecord, setFormState } = useAppState();

  const sourceList = records[state.moduleKey];
  const record = sourceList.find((entry) => entry.id === state.recordId) as
    | Record<string, unknown>
    | undefined;

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
    >
      <form className="flyout-form" onSubmit={submit}>
        <div className="form-grid">
          {state.moduleKey === "items" && <ItemFields record={record} records={records} />}
          {state.moduleKey === "vendors" && <VendorFields record={record} />}
          {state.moduleKey === "projects" && <ProjectFields record={record} />}
          {state.moduleKey === "workers" && <WorkerFields record={record} records={records} />}
          {state.moduleKey === "locations" && <LocationFields record={record} />}
          {state.moduleKey === "purchaseOrders" && (
            <PurchaseOrderFields record={record} records={records} />
          )}
          {state.moduleKey === "receiving" && (
            <ReceivingFields record={record} records={records} />
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
      <FormField name="stock" label="Current Stock" type="number" defaultValue={String(record?.stock ?? 0)} />
      <FormField name="assignedQty" label="Assigned Qty" type="number" defaultValue={String(record?.assignedQty ?? 0)} />
      <FormField name="reorderLevel" label="Reorder Level" type="number" defaultValue={String(record?.reorderLevel ?? 0)} />
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

function VendorFields({ record }: { record?: Record<string, unknown> }) {
  return (
    <>
      <FormField name="name" label="Vendor Name" defaultValue={String(record?.name ?? "")} />
      <FormField name="contact" label="Contact" defaultValue={String(record?.contact ?? "")} />
      <FormField name="phone" label="Phone" defaultValue={String(record?.phone ?? "")} />
      <FormField name="email" label="Email" defaultValue={String(record?.email ?? "")} />
      <FormField name="category" label="Category" defaultValue={String(record?.category ?? "")} />
    </>
  );
}

function ProjectFields({ record }: { record?: Record<string, unknown> }) {
  return (
    <>
      <FormField name="name" label="Project Name" defaultValue={String(record?.name ?? "")} />
      <FormField name="code" label="Code" defaultValue={String(record?.code ?? "")} />
      <FormField name="status" label="Status" defaultValue={String(record?.status ?? "Planning")} />
      <FormField name="location" label="Location" defaultValue={String(record?.location ?? "")} />
      <FormField name="budget" label="Budget" type="number" defaultValue={String(record?.budget ?? 0)} />
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
      <FormField name="capacity" label="Capacity" type="number" defaultValue={String(record?.capacity ?? 0)} />
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
  const lines = Array.isArray(record?.lines)
    ? (record.lines as Array<{ itemId: string; qty: number; rate: number }>)
        .map((line) => `${line.itemId}, ${line.qty}, ${line.rate}`)
        .join("\n")
    : "item-1, 10, 450";

  return (
    <>
      <FormField name="number" label="PO Number" defaultValue={String(record?.number ?? "")} />
      <FormSelectField
        name="vendorId"
        label="Vendor"
        defaultValue={String(record?.vendorId ?? records.vendors[0]?.id ?? "")}
        options={records.vendors.map((vendor) => ({ value: vendor.id, label: vendor.name }))}
      />
      <FormField name="status" label="Status" defaultValue={String(record?.status ?? "Open")} />
      <FormField
        name="orderDate"
        label="Order Date"
        type="date"
        defaultValue={String(record?.orderDate ?? "2026-04-06")}
      />
      <FormField
        name="expectedDate"
        label="Expected Date"
        type="date"
        defaultValue={String(record?.expectedDate ?? "2026-04-12")}
      />
      <FormField
        name="projectIds"
        label="Project IDs (comma separated)"
        defaultValue={
          Array.isArray(record?.projectIds)
            ? String((record.projectIds as string[]).join(", "))
            : ""
        }
      />
      <FormTextArea name="lines" label="PO Lines" defaultValue={lines} />
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
  return (
    <>
      <FormField name="receiptNo" label="Receipt No" defaultValue={String(record?.receiptNo ?? "")} />
      <FormSelectField
        name="poId"
        label="PO"
        defaultValue={String(record?.poId ?? records.purchaseOrders[0]?.id ?? "")}
        options={records.purchaseOrders.map((po) => ({ value: po.id, label: po.number }))}
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
      <FormField name="receivedBy" label="Received By" defaultValue={String(record?.receivedBy ?? "")} />
      <FormField name="packingSlip" label="Packing Slip" defaultValue={String(record?.packingSlip ?? "")} />
      <FormField name="date" label="Receipt Date" type="date" defaultValue={String(record?.date ?? "2026-04-06")} />
      <FormField name="status" label="Status" defaultValue={String(record?.status ?? "Partial")} />
      <FormTextArea name="notes" label="Notes" defaultValue={String(record?.notes ?? "")} />
    </>
  );
}
