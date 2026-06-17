"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/app/context/app-state-context";
import { ModuleTable } from "@/app/(dashboard)/hoc/with-module-workspace/components/ModuleTable";
import {
  CutListPartRow,
  generateAllCabinetRows,
  getGroupedProductionRows,
  groupRowsByCabinet,
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
  } = useAppState();
  const [viewMode, setViewMode] = useState<"cabinet" | "production">("cabinet");

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

        <div className="detail-grid">
          <article className="info-card">
            <small>Cabinet rows</small>
            <strong>{cutLists.length}</strong>
          </article>
          <article className="info-card">
            <small>Generated parts</small>
            <strong>{cabinetRows.length}</strong>
          </article>
          <article className="info-card">
            <small>Production groups</small>
            <strong>{productionRows.length}</strong>
          </article>
          <article className="info-card">
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
      </div>

      <div className="panel">
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
          <CutListRowsTable rows={productionRows} showSource />
        )}
      </div>
    </section>
  );
}
