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
    setItemActionState,
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
        onEdit={(id) => setFormState({ moduleKey: detailState.moduleKey, mode: "edit", recordId: id })}
        onItemAction={(itemId, action) => setItemActionState({ itemId, action })}
      />
    </BaseFlyout>
  );
}
