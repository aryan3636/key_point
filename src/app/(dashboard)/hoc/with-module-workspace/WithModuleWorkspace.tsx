"use client";

import { getModuleLabel } from "@/app/configs/navigation";
import { useAppState } from "@/app/context/app-state-context";
import { ModuleTable } from "@/app/(dashboard)/hoc/with-module-workspace/components/ModuleTable";

export function WithModuleWorkspace() {
  const {
    activeModule,
    activeList,
    records,
    selectedIds,
    setSelectedId,
    removeModuleRecord,
    setFormState,
    setImportState,
    setItemActionState,
    setDetailState,
    setReceiveState,
  } = useAppState();

  if (activeModule === "dashboard") {
    return null;
  }

  return (
    <section className="workspace-grid single-column">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>{getModuleLabel(activeModule)}</h2>
            <p>
              MVP workspace for day-to-day purchasing, receiving, and inventory tracking.
            </p>
          </div>
          <div className="header-actions">
            {activeModule !== "receiving" && (
              <button
                className="secondary-button"
                type="button"
                onClick={() => setImportState({ moduleKey: activeModule })}
              >
                Import
              </button>
            )}
            {activeModule !== "receiving" && (
              <button
                className="primary-button"
                type="button"
                onClick={() => setFormState({ moduleKey: activeModule, mode: "create" })}
              >
                Create
              </button>
            )}
          </div>
        </div>
        <ModuleTable
          moduleKey={activeModule}
          records={activeList}
          recordsState={records}
          selectedId={selectedIds[activeModule]}
          onSelect={(id) => {
            setSelectedId(activeModule, id);
            setDetailState({
              moduleKey: activeModule === "receiving" ? "purchaseOrders" : activeModule,
              recordId: id,
            });
          }}
          onEdit={(id) => setFormState({ moduleKey: activeModule, mode: "edit", recordId: id })}
          onDelete={(id) => removeModuleRecord(activeModule, id)}
          onReceive={(id) => setReceiveState({ poId: id })}
          onAllocate={(id) => setItemActionState({ itemId: id, action: "Issue" })}
        />
      </div>
    </section>
  );
}
