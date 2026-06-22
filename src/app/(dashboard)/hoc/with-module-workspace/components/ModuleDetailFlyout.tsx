"use client";

import BaseFlyout from "@/components/BaseFlyout";
import { useAppState } from "@/app/context/app-state-context";
import { ModuleDetail } from "@/app/(dashboard)/hoc/with-module-workspace/components/ModuleDetail";
import { getModuleLabel } from "@/app/configs/navigation";

export function ModuleDetailFlyout() {
  const {
    detailState,
    records,
    setDetailState,
    setFormState,
    setCabinetFormState,
  } = useAppState();

  if (!detailState) {
    return null;
  }

  const record =
    records[detailState.moduleKey].find((entry) => entry.id === detailState.recordId) ??
    null;

  return (
    <BaseFlyout
      open={!!detailState}
      onClose={() => setDetailState(null)}
      title={`${getModuleLabel(detailState.moduleKey)} Details`}
      width={680}
    >
      <ModuleDetail
        moduleKey={detailState.moduleKey}
        record={record as (Record<string, unknown> & { id: string }) | null}
        records={records}
        onEdit={(id, targetModuleKey) => {
          if ((targetModuleKey ?? detailState.moduleKey) === "cutLists") {
            const cutList = records.cutLists.find((entry) => entry.id === id);
            const project = records.projects.find((entry) => entry.id === cutList?.projectId);
            const areaId = cutList?.areaId || project?.areas[0]?.id || "";

            if (cutList && areaId) {
              setCabinetFormState({ projectId: cutList.projectId, areaId, recordId: cutList.id });
              setDetailState(null);
            }
            return;
          }

          setFormState({
            moduleKey: targetModuleKey ?? detailState.moduleKey,
            mode: "edit",
            recordId: id,
          });
        }}
        onOpenCabinetForm={(projectId, areaId, recordId) => {
          setCabinetFormState({ projectId, areaId, recordId });
          setDetailState(null);
        }}
      />
    </BaseFlyout>
  );
}
