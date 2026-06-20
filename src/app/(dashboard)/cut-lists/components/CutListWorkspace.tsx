"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/app/context/app-state-context";
import { ModuleTable } from "@/app/(dashboard)/hoc/with-module-workspace/components/ModuleTable";
import {
  CutListPartRow,
  generateAllCabinetRows,
  getGroupedProductionRows,
  groupRowsByCabinet,
  groupProductionRowsByFamily,
} from "@/lib/cutListEngine";

function formatDimension(value: number | string) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  if (typeof value === "string") {
    return value;
  }
  return String(value).replace(/\.?0+$/, "");
}

function CutListRowsTable({
  rows,
  showSource = false,
}: {
  rows: CutListPartRow[];
  showSource?: boolean;
}) {
  if (rows.length === 0) {
    return <div className="empty-state">No cut list rows generated yet.</div>;
  }

  return (
    <div className="table-shell compact-table">
      <div className={`table-header table-row ${showSource ? "cutlist-row with-source" : "cutlist-row"}`}>
        <span>Part</span>
        <span>Qty</span>
        <span>Size</span>
        <span>Material</span>
        <span>Edge</span>
        {showSource && <span>Source</span>}
        <span>Notes</span>
      </div>
      {rows.map((row, index) => (
        <div
          className={`table-row cutlist-row ${showSource ? "with-source" : ""}`}
          key={`${row.sourceCabinetId}-${row.partName}-${index}`}
        >
          <span>{row.partName}</span>
          <span>{row.quantity}</span>
          <span>
            {formatDimension(row.width)} x {formatDimension(row.heightDepth)} x{" "}
            {formatDimension(row.thickness)}
          </span>
          <span>{row.material}</span>
          <span>{row.edgeBanding}</span>
          {showSource && <span>{row.sourceItems ?? row.code}</span>}
          <span>{row.notes || "-"}</span>
        </div>
      ))}
    </div>
  );
}

function escapeCsvCell(value: unknown) {
  const cell = String(value ?? "");
  const escaped = cell.replaceAll('"', '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function exportCutListCsv(rows: CutListPartRow[]) {
  const columns = [
    { header: "Part", value: (row: CutListPartRow) => row.partName },
    { header: "Width", value: (row: CutListPartRow) => row.width },
    { header: "Length", value: (row: CutListPartRow) => row.heightDepth },
    { header: "Thickness", value: (row: CutListPartRow) => row.thickness },
    { header: "Qty", value: (row: CutListPartRow) => row.quantity },
    { header: "Material", value: (row: CutListPartRow) => row.material },
    { header: "Edge Banding", value: (row: CutListPartRow) => row.edgeBanding },
    { header: "Source Items", value: (row: CutListPartRow) => row.sourceItems ?? row.code },
    { header: "Notes", value: (row: CutListPartRow) => row.notes },
  ];
  const csv = [
    columns.map((column) => escapeCsvCell(column.header)).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsvCell(column.value(row))).join(",")),
  ].join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "cut-list.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function CutListWorkspace() {
  const {
    activeList,
    records,
    selectedIds,
    setSelectedId,
    removeModuleRecord,
    setFormState,
    setImportState,
    setDetailState,
    query,
    setQuery,
  } = useAppState();
  const [viewMode, setViewMode] = useState<"cabinet" | "production">("cabinet");
  const [showCutListDetails, setShowCutListDetails] = useState(false);

  const activeIds = useMemo(
    () => new Set(activeList.map((record) => record.id)),
    [activeList]
  );
  const cutLists = useMemo(
    () => records.cutLists.filter((record) => activeIds.has(record.id)),
    [activeIds, records.cutLists]
  );
  const cabinetRows = useMemo(
    () => generateAllCabinetRows(cutLists, records.projects),
    [cutLists, records.projects]
  );
  const cabinetGroups = useMemo(() => groupRowsByCabinet(cabinetRows), [cabinetRows]);
  const productionRows = useMemo(() => getGroupedProductionRows(cabinetRows), [cabinetRows]);
  const productionFamilies = useMemo(
    () => groupProductionRowsByFamily(productionRows),
    [productionRows]
  );
  const activeProjects = new Set(cutLists.map((row) => row.projectId));

  return (
    <section className="workspace-grid single-column">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Cut Lists</h2>
            <p>Project-linked cabinet rows with cabinet-level and batched production cut lists.</p>
          </div>
          <div className="header-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => setImportState({ moduleKey: "cutLists" })}
            >
              Import
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => setFormState({ moduleKey: "cutLists", mode: "create" })}
            >
              Create Cabinet
            </button>
          </div>
        </div>

        <div className="module-toolbar">
          <input
            className="search-input module-search"
            placeholder="Search Cut Lists"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="cutlist-metric-strip">
          <article className="cutlist-metric-card">
            <small>Cabinet rows</small>
            <strong>{cutLists.length}</strong>
          </article>
          <article className="cutlist-metric-card">
            <small>Generated parts</small>
            <strong>{cabinetRows.length}</strong>
          </article>
          <article className="cutlist-metric-card">
            <small>Production groups</small>
            <strong>{productionRows.length}</strong>
          </article>
          <article className="cutlist-metric-card">
            <small>Linked projects</small>
            <strong>{activeProjects.size}</strong>
          </article>
        </div>

        <ModuleTable
          moduleKey="cutLists"
          records={activeList}
          recordsState={records}
          selectedId={selectedIds.cutLists}
          onSelect={(id) => {
            setSelectedId("cutLists", id);
            setDetailState({ moduleKey: "cutLists", recordId: id });
          }}
          onEdit={(id) => setFormState({ moduleKey: "cutLists", mode: "edit", recordId: id })}
          onDelete={(id) => removeModuleRecord("cutLists", id)}
        />

        <div className="cutlist-reveal-bar">
          <div>
            <h3>Cabinet Cut List</h3>
            <p>Rows grouped by cabinet code for review before release.</p>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setShowCutListDetails((current) => !current)}
          >
            {showCutListDetails ? "Hide Cabinet Cut List" : "View Cabinet Cut List"}
          </button>
        </div>

        <div className={`cutlist-detail-reveal ${showCutListDetails ? "is-open" : ""}`}>
          <div className="cutlist-detail-panel">
            <div className="panel-header">
              <div>
                <h2>{viewMode === "cabinet" ? "Cabinet Cut List" : "Production Batch"}</h2>
                <p>
                  {viewMode === "cabinet"
                    ? "Rows grouped by cabinet code for review before release."
                    : "Matching parts grouped across cabinets for shop production."}
                </p>
              </div>
              <div className="segmented-control">
                {viewMode === "production" && (
                  <button
                    type="button"
                    onClick={() => exportCutListCsv(productionRows)}
                    disabled={productionRows.length === 0}
                  >
                    Export CSV
                  </button>
                )}
                <button
                  className={viewMode === "cabinet" ? "is-active" : ""}
                  type="button"
                  onClick={() => setViewMode("cabinet")}
                >
                  Cabinet
                </button>
                <button
                  className={viewMode === "production" ? "is-active" : ""}
                  type="button"
                  onClick={() => setViewMode("production")}
                >
                  Production
                </button>
              </div>
            </div>

            {viewMode === "cabinet" ? (
              <div className="cutlist-group-stack">
                {cabinetGroups.map((group) => (
                  <section className="detail-section" key={group.label}>
                    <h3>{group.label}</h3>
                    <CutListRowsTable rows={group.rows} />
                  </section>
                ))}
                {cabinetGroups.length === 0 && (
                  <div className="empty-state">Create a cabinet row to generate a cut list.</div>
                )}
              </div>
            ) : (
              <div className="cutlist-group-stack">
                {productionFamilies.map((group) => (
                  <section className="detail-section" key={group.familyName}>
                    <h3>
                      {group.familyName} <span className="section-count">Total qty: {group.totalQuantity}</span>
                    </h3>
                    <CutListRowsTable rows={group.rows} showSource />
                  </section>
                ))}
                {productionFamilies.length === 0 && (
                  <div className="empty-state">Create a cabinet row to generate a production batch.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
