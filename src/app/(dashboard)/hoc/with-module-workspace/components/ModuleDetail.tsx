"use client";

import {
  ItemRecord,
  CutListRecord,
  LocationRecord,
  ModuleKey,
  ProjectRecord,
  PurchaseOrderRecord,
  ReceiptRecord,
  RecordsState,
  VendorRecord,
  WorkerRecord,
} from "@/lib/inventoryMock";
import { generateCabinetCutListRows } from "@/lib/cutListEngine";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="info-card">
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function DetailScaffold({
  title,
  subtitle,
  onEdit,
  sections,
}: {
  title: string;
  subtitle: string;
  onEdit: () => void;
  sections: Array<[string, string]>;
}) {
  return (
    <div className="detail-stack">
      <div className="detail-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button className="primary-button" onClick={onEdit} type="button">
          Edit
        </button>
      </div>
      <section className="detail-section">
        {sections.map(([label, value]) => (
          <div className="detail-line" key={label}>
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

export function ModuleDetail({
  moduleKey,
  record,
  records,
  onEdit,
}: {
  moduleKey: Exclude<ModuleKey, "dashboard">;
  record: (Record<string, unknown> & { id: string }) | null;
  records: RecordsState;
  onEdit: (id: string) => void;
}) {
  if (!record) {
    return (
      <div className="empty-detail">
        Select a record to preview how the detail screen works.
      </div>
    );
  }

  if (moduleKey === "items") {
    const item = record as unknown as ItemRecord;
    const location = records.locations.find((entry) => entry.id === item.locationId);
    const vendor = records.vendors.find((entry) => entry.id === item.vendorId);
    const movements = records.movements.filter((entry) => entry.itemId === item.id);
    const availableQty = item.stock - item.assignedQty;
    const allocatedProjects = Array.from(
      new Set(
        records.movements
          .filter((movement) => movement.itemId === item.id && movement.type === "Issue")
          .map((movement) => movement.target)
      )
    );

    return (
      <div className="detail-stack">
        <div className="detail-header">
          <div>
            <h2>{item.title}</h2>
            <p>{item.sku}</p>
          </div>
          <button className="primary-button" onClick={() => onEdit(item.id)} type="button">
            Edit item
          </button>
        </div>
        <div className="detail-grid">
          <InfoCard label="Current stock" value={`${item.stock} ${item.unit}`} />
          <InfoCard label="Assigned / issued" value={`${item.assignedQty} ${item.unit}`} />
          <InfoCard label="Available qty" value={`${availableQty} ${item.unit}`} />
          <InfoCard label="Reorder point" value={`${item.reorderLevel} ${item.unit}`} />
        </div>
        <section className="detail-section">
          <h3>Basic Info</h3>
          <p>Category: {item.category}</p>
          <p>Vendor: {vendor?.name ?? "Not linked"}</p>
          <p>Location: {location?.name ?? "Not linked"}</p>
          <p>
            Projects allocated:{" "}
            {allocatedProjects.length > 0 ? allocatedProjects.join(", ") : "Not allocated yet"}
          </p>
          <p>Notes: {item.notes || "No notes yet."}</p>
        </section>
        <section className="detail-section">
          <h3>Movement History</h3>
          <div className="timeline">
            {movements.map((movement) => (
              <div className="timeline-row" key={movement.id}>
                <strong>{movement.type}</strong>
                <span>{movement.target}</span>
                <span>{movement.qty}</span>
                <span>{movement.note}</span>
                <span>{formatDate(movement.date)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (moduleKey === "vendors") {
    const vendor = record as unknown as VendorRecord;
    const relatedPOs = records.purchaseOrders.filter((po) => po.vendorId === vendor.id);
    return (
      <DetailScaffold
        title={vendor.name}
        subtitle={vendor.number}
        onEdit={() => onEdit(vendor.id)}
        sections={[
          ["Contact", vendor.contact],
          ["Phone", vendor.phone],
          ["Email", vendor.email],
          ["Address", vendor.address],
          ["Open purchase orders", String(relatedPOs.length)],
        ]}
      />
    );
  }

  if (moduleKey === "projects") {
    const project = record as unknown as ProjectRecord;
    const taggedPOs = records.purchaseOrders.filter((po) => po.projectId === project.id);
    const issuedMaterials = records.movements.filter((movement) => movement.target === project.name);
    return (
      <DetailScaffold
        title={project.name}
        subtitle={project.code}
        onEdit={() => onEdit(project.id)}
        sections={[
          ["Status", project.status],
          ["Location", project.location],
          ["Budget", formatCurrency(project.budget)],
          ["Related PO Lines", String(taggedPOs.reduce((count, po) => count + po.lines.length, 0))],
          ["Issued materials", String(issuedMaterials.length)],
        ]}
      />
    );
  }

  if (moduleKey === "cutLists") {
    const cutList = record as unknown as CutListRecord;
    const project = records.projects.find((entry) => entry.id === cutList.projectId);
    const generatedRows = generateCabinetCutListRows(cutList, records.projects);

    return (
      <div className="detail-stack">
        <div className="detail-header">
          <div>
            <h2>{cutList.code}</h2>
            <p>{cutList.itemName}</p>
          </div>
          <button className="primary-button" onClick={() => onEdit(cutList.id)} type="button">
            Edit cabinet
          </button>
        </div>
        <div className="detail-grid">
          <InfoCard label="Project" value={project?.name ?? "No project"} />
          <InfoCard label="Status" value={cutList.status} />
          <InfoCard label="Cabinet qty" value={String(cutList.quantity)} />
          <InfoCard label="Generated rows" value={String(generatedRows.length)} />
        </div>
        <section className="detail-section">
          <h3>Cabinet Inputs</h3>
          <p>Type: {cutList.cabinetCategory} / {cutList.cabinetSubtype}</p>
          <p>Size: {cutList.width} x {cutList.height} x {cutList.depth} in</p>
          <p>Material: {cutList.interiorMaterial} ({cutList.materialThickness} in)</p>
          <p>Back option: {cutList.backOption === "fullBack" ? "Full Back" : "No Back / Rails"}</p>
          <p>Notes: {cutList.notes || "No notes yet."}</p>
        </section>
        <section className="detail-section">
          <h3>Generated Parts</h3>
          <div className="timeline">
            {generatedRows.map((row, index) => (
              <div className="timeline-row po-line-summary" key={`${row.partName}-${index}`}>
                <strong>{row.partName}</strong>
                <span>{row.quantity}</span>
                <span>{row.width} x {row.heightDepth} x {row.thickness}</span>
                <span>{row.edgeBanding}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (moduleKey === "workers") {
    const worker = record as unknown as WorkerRecord;
    const project = records.projects.find((entry) => entry.id === worker.projectId);
    const returns = records.movements.filter(
      (movement) => movement.type === "Return" && movement.target === worker.name
    );
    return (
      <DetailScaffold
        title={worker.name}
        subtitle={worker.role}
        onEdit={() => onEdit(worker.id)}
        sections={[
          ["Phone", worker.phone],
          ["Assigned project", project?.name ?? "Not linked"],
          ["Assigned materials", String(worker.assignedMaterials)],
          ["Return history", String(returns.length)],
        ]}
      />
    );
  }

  if (moduleKey === "locations") {
    const location = record as unknown as LocationRecord;
    return (
      <DetailScaffold
        title={location.name}
        subtitle={location.type}
        onEdit={() => onEdit(location.id)}
        sections={[
          ["Manager", location.manager],
          ["Capacity", `${location.capacity} units`],
          ["Items stored", String(records.items.filter((item) => item.locationId === location.id).length)],
        ]}
      />
    );
  }

  if (moduleKey === "purchaseOrders") {
    const po = record as unknown as PurchaseOrderRecord;
    const vendor = records.vendors.find((entry) => entry.id === po.vendorId);
    const project = records.projects.find((entry) => entry.id === po.projectId);
    return (
      <div className="detail-stack">
        <div className="detail-header">
          <div>
            <h2>{po.number}</h2>
            <p>{po.status}</p>
          </div>
          <button className="primary-button" onClick={() => onEdit(po.id)} type="button">
            Edit PO
          </button>
        </div>
        <div className="detail-grid">
          <InfoCard label="Vendor" value={vendor?.name ?? po.vendorId} />
          <InfoCard label="Order date" value={formatDate(po.orderDate)} />
          <InfoCard label="Expected" value={formatDate(po.expectedDate)} />
          <InfoCard label="Project" value={project?.name ?? "No project"} />
        </div>
        <section className="detail-section">
          <h3>PO Overview</h3>
          <p>Order placed by: {po.orderedBy}</p>
          <p>Vendor address: {vendor?.address ?? "Not available"}</p>
        </section>
        <section className="detail-section">
          <h3>PO Lines</h3>
          <div className="timeline">
            {po.lines.map((line, index) => (
              <div className="timeline-row po-line-summary" key={`${po.id}-${index}`}>
                <strong>{line.description}</strong>
                <span>{line.sku}</span>
                <span>{line.category}</span>
                <span>
                  {line.qty} {line.unit}
                </span>
                <span>{formatCurrency(line.price)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const receipt = record as unknown as ReceiptRecord;
  const po = records.purchaseOrders.find((entry) => entry.id === receipt.poId);
  return (
    <div className="detail-stack">
      <div className="detail-header">
        <div>
          <h2>{receipt.receiptNo}</h2>
          <p>{receipt.status}</p>
        </div>
        <button className="primary-button" onClick={() => onEdit(receipt.id)} type="button">
          Edit
        </button>
      </div>
      <section className="detail-section">
        <div className="detail-line">
          <strong>Purchase order</strong>
          <span>{po?.number ?? receipt.poId}</span>
        </div>
        <div className="detail-line">
          <strong>Received by</strong>
          <span>{receipt.receivedBy}</span>
        </div>
        <div className="detail-line">
          <strong>Date</strong>
          <span>{formatDate(receipt.date)}</span>
        </div>
        <div className="detail-line">
          <strong>Location</strong>
          <span>{receipt.receivedLocation}</span>
        </div>
        <div className="detail-line">
          <strong>Packing slip</strong>
          <span>{receipt.packingSlipImage ? "Image attached" : "Not required"}</span>
        </div>
        <div className="detail-line">
          <strong>Notes</strong>
          <span>{receipt.notes || "No notes"}</span>
        </div>
      </section>
      <section className="detail-section">
        <h3>Receipt Lines</h3>
        <div className="timeline">
          {receipt.lines.map((line) => (
            <div className="timeline-row po-line-summary" key={`${receipt.id}-${line.sku}`}>
              <strong>{line.sku}</strong>
              <span>Ordered {line.orderedQty}</span>
              <span>Received {line.receivedQty}</span>
              <span>Slip qty {line.qtyOnPackingSlip}</span>
              <span>Damaged {line.damagedQty}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
