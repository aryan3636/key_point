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
import { ProjectCutListsModal } from "@/app/(dashboard)/projects/components/ProjectCutListsModal";
import { CabinetFormPage } from "@/app/(dashboard)/projects/components/CabinetFormPage";
import { ProjectWorkspace } from "@/app/(dashboard)/projects/components/ProjectWorkspace";
import { useAppState } from "@/app/context/app-state-context";
import { useEffect, useState } from "react";

export function DashboardShell() {
  const {
    user,
    activeModule,
    formState,
    importState,
    cabinetFormState,
    workspaceNavigationKey,
  } = useAppState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-shell">
        <Topbar />
        {cabinetFormState ? (
          <CabinetFormPage />
        ) : activeModule === "dashboard" ? (
          <DashboardView key={workspaceNavigationKey} />
        ) : activeModule === "cutLists" ? (
          <CutListWorkspace key={workspaceNavigationKey} />
        ) : activeModule === "projects" ? (
          <ProjectWorkspace key={workspaceNavigationKey} />
        ) : (
          <WithModuleWorkspace key={workspaceNavigationKey} />
        )}
      </main>
      {!cabinetFormState && formState && (
        <ModuleFormModal
          key={`${formState.moduleKey}-${formState.mode}-${formState.recordId ?? "new"}`}
          state={formState}
        />
      )}
      {!cabinetFormState && importState && <ModuleImportModal moduleKey={importState.moduleKey} />}
      {!cabinetFormState && <ModuleDetailFlyout />}
      {!cabinetFormState && <ReceivePurchaseOrderFlyout />}
      {!cabinetFormState && <ProjectCutListsModal />}
      {!cabinetFormState && <ItemActionModal />}
    </div>
  );
}
