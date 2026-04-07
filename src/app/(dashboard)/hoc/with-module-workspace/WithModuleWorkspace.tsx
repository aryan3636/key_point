"use client";

import { getModuleLabel } from "@/app/configs/navigation";
import { useAppState } from "@/app/context/app-state-context";
import { ModuleTable } from "@/app/(dashboard)/hoc/with-module-workspace/components/ModuleTable";

export function WithModuleWorkspace() {
  const {
    activeModule,
    activeList,
    selectedIds,
    setSelectedId,
    removeModuleRecord,
    setFormState,
    setImportState,
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
              Mocked list page with create, edit, delete, detail, and import
              interactions.
            </p>
          </div>
          <div className="header-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => setImportState({ moduleKey: activeModule })}
            >
              Import
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => setFormState({ moduleKey: activeModule, mode: "create" })}
            >
              Create
            </button>
          </div>
        </div>
        <ModuleTable
          moduleKey={activeModule}
          records={activeList}
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
        />
      </div>
    </section>
  );
}
