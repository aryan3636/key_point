"use client";

import { Sidebar } from "@/app/(dashboard)/(layout)/components/Sidebar";
import { Topbar } from "@/app/(dashboard)/(layout)/components/Topbar";
import { DashboardView } from "@/app/(dashboard)/dashboard/components/DashboardView";
import { CutListWorkspace } from "@/app/(dashboard)/cut-lists/components/CutListWorkspace";
import { ItemActionModal } from "@/app/(dashboard)/items/components/ItemActionModal";
import { LoginScreen } from "@/app/(dashboard)/shared/components/LoginScreen";
import { ModuleFormModal } from "@/app/(dashboard)/shared/components/form/ModuleFormModal";
import { ModuleImportModal } from "@/app/(dashboard)/shared/components/import/ModuleImportModal";
import { WithModuleWorkspace } from "@/app/(dashboard)/hoc/with-module-workspace/WithModuleWorkspace";
import { ModuleDetailFlyout } from "@/app/(dashboard)/hoc/with-module-workspace/components/ModuleDetailFlyout";
import { ReceivePurchaseOrderFlyout } from "@/app/(dashboard)/receiving/components/ReceivePurchaseOrderFlyout";
import { useAppState } from "@/app/context/app-state-context";

export function DashboardShell() {
  const { user, activeModule, formState, importState } = useAppState();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-shell">
        <Topbar />
        {activeModule === "dashboard" ? (
          <DashboardView />
        ) : activeModule === "cutLists" ? (
          <CutListWorkspace />
        ) : (
          <WithModuleWorkspace />
        )}
      </main>
      {formState && <ModuleFormModal state={formState} />}
      {importState && <ModuleImportModal moduleKey={importState.moduleKey} />}
      <ModuleDetailFlyout />
      <ReceivePurchaseOrderFlyout />
      <ItemActionModal />
    </div>
  );
}
