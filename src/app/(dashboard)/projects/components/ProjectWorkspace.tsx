"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAppState } from "@/app/context/app-state-context";
import { CutListRecord, makeId, ProjectAreaRecord, ProjectRecord } from "@/lib/inventoryMock";
import { generateCabinetCutListRows } from "@/lib/cutListEngine";
import { sortCutListsByCode } from "@/lib/cutListSort";

type ProjectMode = "workspace" | "detail" | "form" | "areaDetail";
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
                <input name="name" defaultValue={project?.name ?? ""} required />
              </label>
              <label className="field">
                <span>Job Number</span>
                <input name="code" defaultValue={project?.code ?? ""} required />
              </label>
              <label className="field">
                <span>Customer Name</span>
                <input name="customerName" defaultValue={project?.customerName ?? ""} />
              </label>
              <label className="field">
                <span>Status</span>
                <select name="status" defaultValue={project?.status ?? "Planning"}>
                  {["Planning", "Active", "Draft", "In Review", "Final", "Completed"].map((value) => (
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
                <span>Location</span>
                <input name="location" defaultValue={project?.location ?? ""} />
              </label>
              <label className="field">
                <span>Budget</span>
                <input name="budget" type="number" defaultValue={String(project?.budget ?? 0)} />
              </label>
              <label className="field field-full">
                <span>Site / Address</span>
                <input name="siteAddress" defaultValue={project?.siteAddress ?? project?.location ?? ""} />
              </label>
              <label className="field field-full">
                <span>Notes</span>
                <textarea name="notes" defaultValue={project?.notes ?? ""} rows={5} />
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
                        onClick={() => setCabinetFormState({ projectId: project.id, areaId: area.id })}
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
  onEditCabinet,
}: {
  cutLists: CutListRecord[];
  onEditCabinet: (cutList: CutListRecord) => void;
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
              <CutListRow cutList={cutList} key={cutList.id} onEditCabinet={onEditCabinet} />
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
              <CutListRow cutList={cutList} key={cutList.id} onEditCabinet={onEditCabinet} />
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
  onEditCabinet,
}: {
  cutList: CutListRecord;
  onEditCabinet: (cutList: CutListRecord) => void;
}) {
  const { records } = useAppState();
  const parts = generateCabinetCutListRows(cutList, records.projects);

  return (
    <div className="table-row record-row cutlist-list-row">
      <span>{cutList.code}</span>
      <span>{cutList.itemName}</span>
      <span>{cutList.cabinetCategory} / {cutList.cabinetSubtype}</span>
      <span>{cutList.status}</span>
      <span>{parts.length}</span>
      <span className="row-actions">
        <button className="table-action" onClick={() => onEditCabinet(cutList)} type="button">
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
  onViewCutlists,
}: {
  project: ProjectRecord;
  area: ProjectAreaRecord;
  onBack: () => void;
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
              onClick={() => setCabinetFormState({ projectId: project.id, areaId: area.id })}
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
          <CutListMiniTable cutLists={areaCutLists} onEditCabinet={(cutList) => setCabinetFormState({ projectId: project.id, areaId: area.id, recordId: cutList.id })} />
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
  const [projectFilter, setProjectFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  const selectedProject = records.projects.find((project) => project.id === selectedProjectId);
  const selectedArea = selectedProject?.areas.find((area) => area.id === selectedAreaId);
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

  const openProjectDetail = (projectId: string) => {
    setSelectedProjectId(projectId);
    setMode("detail");
  };

  const editCabinet = (cutList: CutListRecord) => {
    const project = records.projects.find((entry) => entry.id === cutList.projectId);
    const areaId = cutList.areaId || project?.areas[0]?.id || "";

    if (areaId) {
      setCabinetFormState({ projectId: cutList.projectId, areaId, recordId: cutList.id });
    }
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
        onBack={() => setMode("workspace")}
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

  return (
    <section className="workspace-grid single-column">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Projects</h2>
            <p>
              {projectWorkspaceTab === "projects"
                ? "Browse projects and open project details."
                : projectWorkspaceTab === "areas"
                  ? "Browse area information, filtered by project."
                  : "Review area-wise cabinet cutlists."}
            </p>
          </div>
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
            <CutListMiniTable cutLists={cutLists} onEditCabinet={editCabinet} />
          </>
        )}
      </div>
    </section>
  );
}
