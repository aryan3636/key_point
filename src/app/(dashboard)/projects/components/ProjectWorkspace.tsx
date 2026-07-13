"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAppState } from "@/app/context/app-state-context";
import {
  CutListRecord,
  makeId,
  ProjectAreaRecord,
  ProjectRecord,
} from "@/lib/inventoryMock";
import {
  CutListPartRow,
  generateAllCabinetRows,
  generateCabinetCutListRows,
  getGroupedProductionRows,
  groupProductionRowsByFamily,
} from "@/lib/cutListEngine";
import { sortCutListsByCode } from "@/lib/cutListSort";

type ProjectMode = "workspace" | "detail" | "form" | "areaDetail" | "cutlistDetail";
function currency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ProjectFormPage({
  project,
  onBack,
}: {
  project?: ProjectRecord;
  onBack: (projectId?: string) => void;
}) {
  const { saveModuleRecord } = useAppState();
  const projectStatuses = ["Draft", "In Review", "Final"];
  const statusOptions =
    project?.status && !projectStatuses.includes(project.status)
      ? [project.status, ...projectStatuses]
      : projectStatuses;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const savedId = saveModuleRecord(
      "projects",
      {
        ...Object.fromEntries(formData.entries()),
        areasJson: JSON.stringify(project?.areas ?? []),
      },
      project?.id
    );

    onBack(savedId);
  };

  return (
    <section className="workspace-grid single-column">
      <div className="panel project-page-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Projects</p>
            <h2>{project ? "Edit Project" : "Create Project"}</h2>
            <p>Project details are managed on a full page so the form has room to breathe.</p>
          </div>
          <button className="secondary-button" onClick={() => onBack(project?.id)} type="button">
            Back
          </button>
        </div>

        <form className="project-page-form" onSubmit={submit}>
          <fieldset className="form-section">
            <legend>Project Info</legend>
            <div className="form-grid">
              <label className="field">
                <span>Project Name</span>
                <input
                  name="name"
                  defaultValue={project?.name ?? ""}
                  placeholder="Smith Kitchen"
                />
              </label>
              <label className="field">
                <span>Job Number</span>
                <input
                  name="code"
                  defaultValue={project?.code ?? ""}
                  placeholder="J-1001"
                />
              </label>
              <label className="field">
                <span>Customer Name</span>
                <input name="customerName" defaultValue={project?.customerName ?? ""} />
              </label>
              <label className="field">
                <span>Status</span>
                <select name="status" defaultValue={project?.status ?? "Draft"}>
                  {statusOptions.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Date</span>
                <input name="projectDate" type="date" defaultValue={project?.projectDate ?? ""} />
              </label>
              <label className="field">
                <span>Prepared By</span>
                <input name="preparedBy" defaultValue={project?.preparedBy ?? ""} />
              </label>
              <label className="field">
                <span>Budget</span>
                <input name="budget" type="number" defaultValue={String(project?.budget ?? 0)} />
              </label>
              <label className="field field-full">
                <span>Notes</span>
                <textarea name="notes" defaultValue={project?.notes ?? ""} rows={5} />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Site / Address</legend>
            <div className="form-grid">
              <label className="field field-full">
                <span>Site / Address</span>
                <input
                  name="siteAddress"
                  defaultValue={project?.siteAddress ?? project?.location ?? project?.addressLine1 ?? ""}
                  placeholder="Site or address"
                />
              </label>
            </div>
          </fieldset>

          <div className="flyout-footer project-page-footer">
            <button className="secondary-button" onClick={() => onBack(project?.id)} type="button">
              Cancel
            </button>
            <button className="primary-button" type="submit">
              Save Project
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function ProjectDetailPage({
  project,
  onBack,
  onEdit,
  onViewAreaCutlists,
}: {
  project: ProjectRecord;
  onBack: () => void;
  onEdit: () => void;
  onViewAreaCutlists: (areaId: string) => void;
}) {
  const { records, saveProjectAreas, setCabinetFormState } = useAppState();
  const [areaDraft, setAreaDraft] = useState({ id: "", areaName: "", areaCode: "", notes: "" });
  const [message, setMessage] = useState("");
  const projectCutLists = sortCutListsByCode(
    records.cutLists.filter((cutList) => cutList.projectId === project.id)
  );
  const canSaveArea = Boolean(areaDraft.areaName.trim() && areaDraft.areaCode.trim());

  const saveArea = () => {
    if (!canSaveArea) {
      return;
    }

    const now = new Date().toISOString();
    const nextArea: ProjectAreaRecord = {
      id: areaDraft.id || makeId("area"),
      areaName: areaDraft.areaName.trim(),
      areaCode: areaDraft.areaCode.trim().toUpperCase(),
      notes: areaDraft.notes.trim(),
      createdAt:
        project.areas.find((area) => area.id === areaDraft.id)?.createdAt ?? now,
      updatedAt: now,
    };
    const nextAreas = project.areas.some((area) => area.id === nextArea.id)
      ? project.areas.map((area) => (area.id === nextArea.id ? nextArea : area))
      : [...project.areas, nextArea];

    saveProjectAreas(project.id, nextAreas);
    setAreaDraft({ id: "", areaName: "", areaCode: "", notes: "" });
    setMessage("Area saved. You can add cabinets to it now.");
  };

  const deleteArea = (areaId: string) => {
    saveProjectAreas(project.id, project.areas.filter((area) => area.id !== areaId));
    setMessage("Area deleted.");
  };

  return (
    <section className="workspace-grid single-column">
      <div className="panel project-page-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{project.code}</p>
            <h2>{project.name}</h2>
            <p>{project.customerName || "No customer"} / {project.siteAddress || project.location || "No address"}</p>
          </div>
          <div className="header-actions">
            <button className="secondary-button" onClick={onBack} type="button">Back</button>
            <button className="primary-button" onClick={onEdit} type="button">Edit Project</button>
          </div>
        </div>

        <div className="detail-grid">
          <article className="info-card"><small>Status</small><strong>{project.status}</strong></article>
          <article className="info-card"><small>Date</small><strong>{formatDate(project.projectDate)}</strong></article>
          <article className="info-card"><small>Budget</small><strong>{currency(project.budget)}</strong></article>
          <article className="info-card"><small>Areas</small><strong>{project.areas.length}</strong></article>
        </div>

        <section className="detail-section">
          <h3>Project Notes</h3>
          <p>{project.notes || "No notes yet."}</p>
        </section>

        <section className="detail-section">
          <div className="section-header">
            <div>
              <h3>Areas</h3>
              <p>Save an area first, then add cabinets from the saved area card.</p>
            </div>
          </div>
          <div className="area-editor-grid">
            <label className="field">
              <span>Area Name</span>
              <input
                value={areaDraft.areaName}
                onChange={(event) => setAreaDraft((current) => ({ ...current, areaName: event.target.value }))}
                placeholder="Kitchen"
              />
            </label>
            <label className="field">
              <span>Area Code</span>
              <input
                value={areaDraft.areaCode}
                onChange={(event) => setAreaDraft((current) => ({ ...current, areaCode: event.target.value }))}
                placeholder="KIT"
              />
            </label>
            <label className="field field-full">
              <span>Area Notes</span>
              <textarea
                value={areaDraft.notes}
                onChange={(event) => setAreaDraft((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
              />
            </label>
            <div className="pill-actions field-full">
              <button className="primary-button" disabled={!canSaveArea} onClick={saveArea} type="button">
                Save Area
              </button>
              {areaDraft.id && (
                <button
                  className="secondary-button"
                  onClick={() => setAreaDraft({ id: "", areaName: "", areaCode: "", notes: "" })}
                  type="button"
                >
                  Cancel Area Edit
                </button>
              )}
            </div>
          </div>
          {message && <div className="form-message success">{message}</div>}

          <div className="area-list">
            {project.areas.map((area) => {
              const areaCutLists = projectCutLists.filter((cutList) => cutList.areaId === area.id);

              return (
                <article className="area-card" key={area.id}>
                  <div className="area-card-header">
                    <div>
                      <h3>{area.areaName}</h3>
                      <span className="area-code">{area.areaCode}</span>
                    </div>
                    <div className="pill-actions">
                      <button className="secondary-button" onClick={() => onViewAreaCutlists(area.id)} type="button">
                        View Cutlists ({areaCutLists.length})
                      </button>
                      <button
                        className="primary-button"
                        onClick={() => setCabinetFormState({ projectId: project.id, areaId: area.id, returnTab: "areas" })}
                        type="button"
                      >
                        + Add Cabinet / Item
                      </button>
                    </div>
                  </div>
                  {area.notes && <p className="area-notes">{area.notes}</p>}
                  <div className="pill-actions">
                    <button
                      className="table-action"
                      onClick={() => setAreaDraft({
                        id: area.id,
                        areaName: area.areaName,
                        areaCode: area.areaCode,
                        notes: area.notes,
                      })}
                      type="button"
                    >
                      Edit Area
                    </button>
                    <button className="table-action danger" onClick={() => deleteArea(area.id)} type="button">
                      Delete Area
                    </button>
                  </div>
                </article>
              );
            })}
            {project.areas.length === 0 && <div className="empty-state">No areas saved yet.</div>}
          </div>
        </section>
      </div>
    </section>
  );
}

function CutListMiniTable({
  cutLists,
  onDuplicateCabinet,
  onEditCabinet,
  onOpenCutList,
}: {
  cutLists: CutListRecord[];
  onDuplicateCabinet: (cutList: CutListRecord) => void;
  onEditCabinet: (cutList: CutListRecord) => void;
  onOpenCutList: (cutList: CutListRecord) => void;
}) {
  const { records } = useAppState();
  const groups = records.projects.flatMap((project) =>
    project.areas.map((area) => ({
      area,
      project,
      cutLists: cutLists.filter((cutList) => cutList.projectId === project.id && cutList.areaId === area.id),
    }))
  );
  const visibleGroups = groups.filter((group) => group.cutLists.length > 0);
  const groupedIds = new Set(visibleGroups.flatMap((group) => group.cutLists.map((cutList) => cutList.id)));
  const unassignedCutLists = cutLists.filter((cutList) => !groupedIds.has(cutList.id));

  return (
    <div className="cutlist-area-groups">
      {visibleGroups.map((group) => (
        <section className="cutlist-area-group" key={group.area.id}>
          <div className="cutlist-area-heading">
            <div>
              <h3>{group.area.areaName}</h3>
              <p>Project: {group.project.name} / Area code: {group.area.areaCode}</p>
            </div>
            <span>{group.cutLists.length} cutlists</span>
          </div>
          <div className="table-shell compact-table">
            <div className="table-header table-row cutlist-list-row">
              <span>Cabinet code</span>
              <span>Cabinet name</span>
              <span>Type</span>
              <span>Status</span>
              <span>Parts</span>
              <span>Actions</span>
            </div>
            {group.cutLists.map((cutList) => (
              <CutListRow
                cutList={cutList}
                key={cutList.id}
                onDuplicateCabinet={onDuplicateCabinet}
                onEditCabinet={onEditCabinet}
                onOpenCutList={onOpenCutList}
              />
            ))}
          </div>
        </section>
      ))}
      {unassignedCutLists.length > 0 && (
        <section className="cutlist-area-group">
          <div className="cutlist-area-heading">
            <div>
              <h3>Unassigned Area</h3>
              <p>Cabinets without an area link.</p>
            </div>
            <span>{unassignedCutLists.length} cutlists</span>
          </div>
          <div className="table-shell compact-table">
            <div className="table-header table-row cutlist-list-row">
              <span>Cabinet code</span>
              <span>Cabinet name</span>
              <span>Type</span>
              <span>Status</span>
              <span>Parts</span>
              <span>Actions</span>
            </div>
            {unassignedCutLists.map((cutList) => (
              <CutListRow
                cutList={cutList}
                key={cutList.id}
                onDuplicateCabinet={onDuplicateCabinet}
                onEditCabinet={onEditCabinet}
                onOpenCutList={onOpenCutList}
              />
            ))}
          </div>
        </section>
      )}
      {cutLists.length === 0 && <div className="empty-state">No cutlists match this filter.</div>}
    </div>
  );
}

function CutListRow({
  cutList,
  onDuplicateCabinet,
  onEditCabinet,
  onOpenCutList,
}: {
  cutList: CutListRecord;
  onDuplicateCabinet: (cutList: CutListRecord) => void;
  onEditCabinet: (cutList: CutListRecord) => void;
  onOpenCutList: (cutList: CutListRecord) => void;
}) {
  const { records } = useAppState();
  const parts = generateCabinetCutListRows(cutList, records.projects);

  return (
    <div
      className="table-row record-row cutlist-list-row"
      onClick={() => onOpenCutList(cutList)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenCutList(cutList);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span>{cutList.code}</span>
      <span>{cutList.itemName}</span>
      <span>{cutList.cabinetCategory} / {cutList.cabinetSubtype}</span>
      <span>{cutList.status}</span>
      <span>{parts.length}</span>
      <span className="row-actions">
        <button
          className="table-action"
          onClick={(event) => {
            event.stopPropagation();
            onDuplicateCabinet(cutList);
          }}
          type="button"
        >
          Duplicate
        </button>
        <button
          className="table-action"
          onClick={(event) => {
            event.stopPropagation();
            onEditCabinet(cutList);
          }}
          type="button"
        >
          Edit
        </button>
      </span>
    </div>
  );
}

function LabeledLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="labeled-line">
      <span>{label}:</span>
      <strong>{value}</strong>
    </div>
  );
}

function getPartSideLabel(partName: string) {
  const normalized = partName.trim().toUpperCase();
  if (normalized === "GABLES" || normalized === "GABLE") return "Gables - left/right side";
  if (normalized === "BACK") return "Back panel";
  if (normalized === "BACK RAIL") return "Back rails";
  if (normalized === "BOTTOM") return "Bottom panel";
  if (normalized === "TOP & BOTTOM") return "Top and bottom panels";
  if (normalized.includes("STRETCHER")) return "Stretchers";
  if (normalized.includes("SHELF")) return partName;
  if (normalized.includes("DRAWER") && normalized.includes("SIDE")) return "Drawer sides";
  if (normalized.includes("DRAWER") && normalized.includes("BOTTOM")) return "Drawer bottoms";
  if (normalized.includes("DRAWER") && normalized.includes("FRONT & BACK")) return "Drawer front/back";
  return partName;
}

function CalculatedCutListTable({ cutList }: { cutList: CutListRecord }) {
  const { records } = useAppState();
  const rows = generateCabinetCutListRows(cutList, records.projects);

  return rows.length > 0 ? (
    <div className="table-shell compact-table">
      <div className="table-header table-row cutlist-preview-row">
        <span>Part / Side</span>
        <span>Qty</span>
        <span>Width</span>
        <span>Height / Depth</span>
        <span>Thick</span>
        <span>Material</span>
        <span>Edge Banding</span>
        <span>Finish / Notes</span>
      </div>
      {rows.map((row, index) => (
        <div className="table-row cutlist-preview-row" key={`${row.partName}-${row.width}-${row.heightDepth}-${index}`}>
          <span>
            <strong>{getPartSideLabel(row.partName)}</strong>
            <small>{row.partName}</small>
          </span>
          <span>{row.quantity}</span>
          <span>{row.width}</span>
          <span>{row.heightDepth}</span>
          <span>{row.thickness}</span>
          <span>{row.material}</span>
          <span>{row.edgeBanding}</span>
          <span>{[row.finish, row.notes].filter((value) => value && value !== "-").join(" / ") || "-"}</span>
        </div>
      ))}
    </div>
  ) : (
    <div className="empty-state">
      No calculated cutlist rows yet. Check dimensions, material thickness, and formula support for this category.
    </div>
  );
}

function ProductionRowsTable({ rows }: { rows: CutListPartRow[] }) {
  return (
    <div className="table-shell compact-table">
      <div className="table-header table-row cutlist-preview-row">
        <span>Part / Side</span>
        <span>Qty</span>
        <span>Width</span>
        <span>Height / Depth</span>
        <span>Thick</span>
        <span>Material</span>
        <span>Edge Banding</span>
        <span>Source / Notes</span>
      </div>
      {rows.map((row, index) => (
        <div className="table-row cutlist-preview-row" key={`${row.partName}-${row.width}-${row.heightDepth}-${index}`}>
          <span>
            <strong>{getPartSideLabel(row.partName)}</strong>
            <small>{row.partName}</small>
          </span>
          <span>{row.quantity}</span>
          <span>{row.width}</span>
          <span>{row.heightDepth}</span>
          <span>{row.thickness}</span>
          <span>{row.material}</span>
          <span>{row.edgeBanding}</span>
          <span>{[row.sourceItems ?? row.code, row.notes].filter((value) => value && value !== "-").join(" / ") || "-"}</span>
        </div>
      ))}
    </div>
  );
}

function ProductionBatchView({ cutLists }: { cutLists: CutListRecord[] }) {
  const { records } = useAppState();
  const cabinetRows = generateAllCabinetRows(cutLists, records.projects);
  const productionRows = getGroupedProductionRows(cabinetRows);
  const productionFamilies = groupProductionRowsByFamily(productionRows);

  return (
    <div className="cutlist-group-stack">
      {productionFamilies.map((group) => (
        <section className="detail-section" key={group.familyName}>
          <h3>
            {group.familyName} <span className="section-count">Total qty: {group.totalQuantity}</span>
          </h3>
          <ProductionRowsTable rows={group.rows} />
        </section>
      ))}
      {productionFamilies.length === 0 && (
        <div className="empty-state">Create a cabinet row to generate a production batch.</div>
      )}
    </div>
  );
}

function CutListDetailPage({
  cutList,
  onBack,
  onEdit,
}: {
  cutList: CutListRecord;
  onBack: () => void;
  onEdit: () => void;
}) {
  const { records } = useAppState();
  const project = records.projects.find((entry) => entry.id === cutList.projectId);
  const area = project?.areas.find((entry) => entry.id === cutList.areaId);
  const rows = generateCabinetCutListRows(cutList, records.projects);

  return (
    <section className="workspace-grid single-column">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{project?.name ?? "No project"} / {area?.areaName ?? "No area"}</p>
            <h2>{cutList.code}</h2>
            <p>{cutList.itemName || "Cabinet item"}</p>
          </div>
          <div className="header-actions">
            <button className="secondary-button" onClick={onBack} type="button">Back to Cut Lists</button>
            <button className="primary-button" onClick={onEdit} type="button">Edit Cabinet</button>
          </div>
        </div>

        <div className="detail-grid">
          <article className="info-card"><small>Category</small><strong>{cutList.cabinetCategory}</strong></article>
          <article className="info-card"><small>Subtype</small><strong>{cutList.cabinetSubtype}</strong></article>
          <article className="info-card"><small>Quantity</small><strong>{cutList.quantity}</strong></article>
          <article className="info-card"><small>Calculated parts</small><strong>{rows.length}</strong></article>
        </div>

        <section className="detail-section">
          <h3>Cabinet Details</h3>
          <div className="labeled-stack">
            <LabeledLine label="Project" value={project?.name ?? "-"} />
            <LabeledLine label="Area" value={area?.areaName ?? "-"} />
            <LabeledLine label="Dimensions" value={`${cutList.width} x ${cutList.height} x ${cutList.depth} in`} />
            <LabeledLine label="Material" value={cutList.interiorMaterial} />
            <LabeledLine label="Door thickness" value={`${cutList.doorThickness} in`} />
            <LabeledLine label="Bumper allowance" value={`${cutList.bumperAllowance} in`} />
            <LabeledLine label="Finished sides" value={cutList.finishedSides} />
            <LabeledLine label="Notes" value={cutList.notes || "-"} />
          </div>
        </section>

        <section className="detail-section">
          <h3>Calculated Cutlist</h3>
          <CalculatedCutListTable cutList={cutList} />
        </section>
      </div>
    </section>
  );
}

function AreaTableRow({
  project,
  area,
  cutListCount,
  onOpenArea,
}: {
  project: ProjectRecord;
  area: ProjectAreaRecord;
  cutListCount: number;
  onOpenArea: () => void;
}) {
  return (
    <div
      className="table-row record-row project-area-row"
      onClick={onOpenArea}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenArea();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span>{area.areaName}</span>
      <span>{area.areaCode}</span>
      <span>{project.name}</span>
      <span>{area.notes || "-"}</span>
      <span>{cutListCount}</span>
    </div>
  );
}

function ProjectListCard({
  project,
  cutListCount,
  onOpenProject,
}: {
  project: ProjectRecord;
  cutListCount: number;
  onOpenProject: () => void;
}) {
  return (
    <article className="area-card">
      <div className="area-card-header">
        <div className="labeled-stack">
          <LabeledLine label="Project" value={project.name} />
          <LabeledLine label="Project code" value={project.code} />
          <LabeledLine label="Customer" value={project.customerName || "-"} />
          <LabeledLine label="Areas" value={String(project.areas.length)} />
          <LabeledLine label="Cutlists" value={String(cutListCount)} />
        </div>
        <button className="secondary-button" onClick={onOpenProject} type="button">
          Project Details
        </button>
      </div>
    </article>
  );
}

function AreaDetailPage({
  project,
  area,
  onBack,
  onOpenCutList,
  onViewCutlists,
}: {
  project: ProjectRecord;
  area: ProjectAreaRecord;
  onBack: () => void;
  onOpenCutList: (cutList: CutListRecord) => void;
  onViewCutlists: () => void;
}) {
  const { records, setCabinetFormState } = useAppState();
  const areaCutLists = sortCutListsByCode(
    records.cutLists.filter((cutList) => cutList.projectId === project.id && cutList.areaId === area.id)
  );

  return (
    <section className="workspace-grid single-column">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{project.name}</p>
            <h2>{area.areaName}</h2>
            <p>{area.notes || "No area notes yet."}</p>
          </div>
          <div className="header-actions">
            <button className="secondary-button" onClick={onBack} type="button">Back to Areas</button>
            <button className="secondary-button" onClick={onViewCutlists} type="button">
              View Cutlists ({areaCutLists.length})
            </button>
            <button
              className="primary-button"
              onClick={() => setCabinetFormState({ projectId: project.id, areaId: area.id, returnTab: "areas" })}
              type="button"
            >
              + Add Cabinet / Item
            </button>
          </div>
        </div>
        <div className="detail-grid">
          <article className="info-card"><small>Project</small><strong>{project.name}</strong></article>
          <article className="info-card"><small>Area code</small><strong>{area.areaCode}</strong></article>
          <article className="info-card"><small>Cabinets</small><strong>{areaCutLists.length}</strong></article>
          <article className="info-card"><small>Generated parts</small><strong>{areaCutLists.reduce((total, cutList) => total + generateCabinetCutListRows(cutList, records.projects).length, 0)}</strong></article>
        </div>
        <section className="detail-section">
          <h3>Cabinets and Cutlists</h3>
          <CutListMiniTable
            cutLists={areaCutLists}
            onDuplicateCabinet={(cutList) =>
              setCabinetFormState({
                projectId: project.id,
                areaId: area.id,
                duplicateFromId: cutList.id,
                returnTab: "areas",
              })
            }
            onEditCabinet={(cutList) =>
              setCabinetFormState({
                projectId: project.id,
                areaId: area.id,
                recordId: cutList.id,
                returnTab: "areas",
              })
            }
            onOpenCutList={onOpenCutList}
          />
        </section>
      </div>
    </section>
  );
}
export function ProjectWorkspace() {
  const {
    records,
    query,
    projectWorkspaceTab,
    setQuery,
    setCabinetFormState,
    setImportState,
    setProjectWorkspaceTab,
  } = useAppState();
  const [mode, setMode] = useState<ProjectMode>("workspace");
  const [selectedProjectId, setSelectedProjectId] = useState(records.projects[0]?.id ?? "");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [selectedCutListId, setSelectedCutListId] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [cutListViewMode, setCutListViewMode] = useState<"cabinet" | "production">("cabinet");

  const selectedProject = records.projects.find((project) => project.id === selectedProjectId);
  const selectedArea = selectedProject?.areas.find((area) => area.id === selectedAreaId);
  const selectedCutList = records.cutLists.find((cutList) => cutList.id === selectedCutListId);
  const filteredProjects = projectFilter
    ? records.projects.filter((project) => project.id === projectFilter)
    : records.projects;
  const areaRows = filteredProjects.flatMap((project) =>
    project.areas.map((area) => ({ project, area }))
  );
  const visibleAreaRows = query.trim()
    ? areaRows.filter(({ project, area }) =>
        `${project.name} ${project.code} ${area.areaName} ${area.areaCode} ${area.notes}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : areaRows;
  const areaOptions = useMemo(
    () =>
      records.projects.flatMap((project) =>
        project.areas.map((area) => ({ project, area }))
      ),
    [records.projects]
  );
  const cutLists = sortCutListsByCode(
    records.cutLists.filter((cutList) => {
      if (projectFilter && cutList.projectId !== projectFilter) {
        return false;
      }
      if (areaFilter && cutList.areaId !== areaFilter) {
        return false;
      }
      if (!query.trim()) {
        return true;
      }
      return JSON.stringify(cutList).toLowerCase().includes(query.toLowerCase());
    })
  );
  const workspaceTitle =
    projectWorkspaceTab === "projects"
      ? "Projects"
      : projectWorkspaceTab === "areas"
        ? "Areas"
        : "Cut Lists";
  const workspaceDescription =
    projectWorkspaceTab === "projects"
      ? "Browse projects and open project details."
      : projectWorkspaceTab === "areas"
        ? "Browse area information, filtered by project."
        : "Review area-wise cabinet cutlists and production batches.";

  const openProjectDetail = (projectId: string) => {
    setSelectedProjectId(projectId);
    setMode("detail");
  };

  const editCabinet = (cutList: CutListRecord) => {
    const project = records.projects.find((entry) => entry.id === cutList.projectId);
    const areaId = cutList.areaId || project?.areas[0]?.id || "";

    if (areaId) {
      setCabinetFormState({ projectId: cutList.projectId, areaId, recordId: cutList.id, returnTab: "cutlists" });
    }
  };

  const duplicateCabinet = (cutList: CutListRecord) => {
    const project = records.projects.find((entry) => entry.id === cutList.projectId);
    const areaId = cutList.areaId || project?.areas[0]?.id || "";

    if (areaId) {
      setCabinetFormState({
        projectId: cutList.projectId,
        areaId,
        duplicateFromId: cutList.id,
        returnTab: "cutlists",
      });
    }
  };

  const openCutListDetail = (cutList: CutListRecord) => {
    const project = records.projects.find((entry) => entry.id === cutList.projectId);
    setSelectedProjectId(cutList.projectId);
    setSelectedAreaId(cutList.areaId || project?.areas[0]?.id || "");
    setSelectedCutListId(cutList.id);
    setMode("cutlistDetail");
  };

  if (mode === "form") {
    return (
      <ProjectFormPage
        onBack={(projectId) => {
          if (projectId) {
            setSelectedProjectId(projectId);
            setMode("detail");
          } else {
            setMode("workspace");
          }
        }}
        project={selectedProject}
      />
    );
  }

  if (mode === "detail" && selectedProject) {
    return (
      <ProjectDetailPage
        onBack={() => setMode("workspace")}
        onEdit={() => setMode("form")}
        onViewAreaCutlists={(areaId) => {
          setProjectFilter(selectedProject.id);
          setAreaFilter(areaId);
          setProjectWorkspaceTab("cutlists");
          setMode("workspace");
        }}
        project={selectedProject}
      />
    );
  }

  if (mode === "areaDetail" && selectedProject && selectedArea) {
    return (
      <AreaDetailPage
        area={selectedArea}
        onBack={() => {
          setProjectWorkspaceTab("areas");
          setMode("workspace");
        }}
        onOpenCutList={openCutListDetail}
        onViewCutlists={() => {
          setProjectFilter(selectedProject.id);
          setAreaFilter(selectedArea.id);
          setProjectWorkspaceTab("cutlists");
          setMode("workspace");
        }}
        project={selectedProject}
      />
    );
  }

  if (mode === "cutlistDetail" && selectedCutList) {
    return (
      <CutListDetailPage
        cutList={selectedCutList}
        onBack={() => {
          setProjectWorkspaceTab("cutlists");
          setMode("workspace");
        }}
        onEdit={() => editCabinet(selectedCutList)}
      />
    );
  }

  return (
    <section className="workspace-grid single-column">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>{workspaceTitle}</h2>
            <p>{workspaceDescription}</p>
          </div>
          {projectWorkspaceTab === "projects" && (
            <div className="header-actions">
              <button className="secondary-button" onClick={() => setImportState({ moduleKey: "projects" })} type="button">
                Import
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setSelectedProjectId("");
                  setMode("form");
                }}
                type="button"
              >
                Create Project
              </button>
            </div>
          )}
        </div>

        {projectWorkspaceTab === "projects" && (
          <>
            <div className="module-toolbar project-filter-bar">
              <input
                className="search-input module-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects"
                value={query}
              />
            </div>
            <div className="area-list">
              {records.projects
                .filter((project) =>
                  query.trim()
                    ? JSON.stringify(project).toLowerCase().includes(query.toLowerCase())
                    : true
                )
                .map((project) => (
                  <ProjectListCard
                    cutListCount={records.cutLists.filter((cutList) => cutList.projectId === project.id).length}
                    key={project.id}
                    onOpenProject={() => openProjectDetail(project.id)}
                    project={project}
                  />
                ))}
            </div>
          </>
        )}

        {projectWorkspaceTab === "areas" && (
          <>
            <div className="module-toolbar project-filter-bar">
              <input
                className="search-input module-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search areas"
                value={query}
              />
              <select className="search-input compact" onChange={(event) => setProjectFilter(event.target.value)} value={projectFilter}>
                <option value="">All projects</option>
                {records.projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div className="table-shell compact-table">
              <div className="table-header table-row project-area-row">
                <span>Area name</span>
                <span>Area code</span>
                <span>Project</span>
                <span>Notes</span>
                <span>Cutlists</span>
              </div>
              {visibleAreaRows.map(({ project, area }) => (
                <AreaTableRow
                  area={area}
                  cutListCount={records.cutLists.filter((cutList) => cutList.areaId === area.id).length}
                  key={area.id}
                  onOpenArea={() => {
                    setSelectedProjectId(project.id);
                    setSelectedAreaId(area.id);
                    setMode("areaDetail");
                  }}
                  project={project}
                />
              ))}
              {visibleAreaRows.length === 0 && <div className="empty-state">No areas match this filter.</div>}
            </div>
          </>
        )}
        {projectWorkspaceTab === "cutlists" && (
          <>
            <div className="module-toolbar project-filter-bar">
              <input
                className="search-input module-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search cutlists"
                value={query}
              />
              <select className="search-input compact" onChange={(event) => setProjectFilter(event.target.value)} value={projectFilter}>
                <option value="">All projects</option>
                {records.projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <select className="search-input compact" onChange={(event) => setAreaFilter(event.target.value)} value={areaFilter}>
                <option value="">All areas</option>
                {areaOptions
                  .filter(({ project }) => !projectFilter || project.id === projectFilter)
                  .map(({ project, area }) => (
                    <option key={area.id} value={area.id}>{project.name} / {area.areaName}</option>
                  ))}
              </select>
            </div>
            <div className="cutlist-reveal-bar">
              <div>
                <h3>{cutListViewMode === "cabinet" ? "Cabinet Cut List" : "Production Batch"}</h3>
                <p>
                  {cutListViewMode === "cabinet"
                    ? "Cabinet rows grouped area-wise."
                    : "Matching parts grouped across cabinets for shop production."}
                </p>
              </div>
              <div className="segmented-control">
                <button
                  className={cutListViewMode === "cabinet" ? "is-active" : ""}
                  onClick={() => setCutListViewMode("cabinet")}
                  type="button"
                >
                  Cabinet
                </button>
                <button
                  className={cutListViewMode === "production" ? "is-active" : ""}
                  onClick={() => setCutListViewMode("production")}
                  type="button"
                >
                  Production
                </button>
              </div>
            </div>
            {cutListViewMode === "cabinet" ? (
              <CutListMiniTable
                cutLists={cutLists}
                onDuplicateCabinet={duplicateCabinet}
                onEditCabinet={editCabinet}
                onOpenCutList={openCutListDetail}
              />
            ) : (
              <ProductionBatchView cutLists={cutLists} />
            )}
          </>
        )}
      </div>
    </section>
  );
}
