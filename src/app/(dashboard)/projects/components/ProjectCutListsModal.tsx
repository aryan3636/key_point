"use client";

import BaseModal from "@/components/BaseModal";
import { useAppState } from "@/app/context/app-state-context";
import { generateCabinetCutListRows } from "@/lib/cutListEngine";
import { getProjectCutListsFromLocalRecords } from "@/api/cut-lists/queries";
import { sortCutListsByCode } from "@/lib/cutListSort";

function formatDimension(value: number | string) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  if (typeof value === "string") {
    return value;
  }
  return String(value).replace(/\.?0+$/, "");
}

export function ProjectCutListsModal() {
  const {
    records,
    projectCutListsState,
    setProjectCutListsState,
    setCabinetFormState,
  } = useAppState();

  const project = records.projects.find(
    (entry) => entry.id === projectCutListsState?.projectId
  );
  const cutLists = project
    ? sortCutListsByCode(getProjectCutListsFromLocalRecords(records, project.id))
    : [];

  return (
    <BaseModal
      open={!!projectCutListsState}
      onClose={() => setProjectCutListsState(null)}
      title={project ? `${project.name} Cutlists` : "Project Cutlists"}
      subtitle={project ? `${project.code} / ${project.location}` : undefined}
      width={980}
    >
      <div className="modal-actions project-cutlist-actions">
        <span>{cutLists.length} cabinet rows linked to this project</span>
      </div>

      <div className="cutlist-group-stack">
        {cutLists.map((cutList) => {
          const rows = generateCabinetCutListRows(cutList, records.projects);

          return (
            <section className="detail-section" key={cutList.id}>
              <div className="section-header">
                <div>
                  <h3>
                    {cutList.code} <span className="section-count">{cutList.itemName}</span>
                  </h3>
                  <p>
                    {cutList.cabinetCategory} / {cutList.cabinetSubtype} / {cutList.status}
                  </p>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    const areaId = cutList.areaId || project?.areas[0]?.id || "";

                    setProjectCutListsState(null);
                    if (areaId) {
                      setCabinetFormState({
                        projectId: cutList.projectId,
                        areaId,
                        recordId: cutList.id,
                      });
                    }
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="table-shell compact-table">
                <div className="table-header table-row cutlist-row">
                  <span>Part</span>
                  <span>Qty</span>
                  <span>Size</span>
                  <span>Material</span>
                  <span>Edge</span>
                  <span>Notes</span>
                </div>
                {rows.map((row, index) => (
                  <div
                    className="table-row cutlist-row"
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
                    <span>{row.notes || "-"}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {cutLists.length === 0 && (
          <div className="empty-state">No cutlists are linked to this project yet.</div>
        )}
      </div>
    </BaseModal>
  );
}
