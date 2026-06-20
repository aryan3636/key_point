import { CutListRecord, RecordsState } from "@/lib/inventoryMock";
import { listModuleRecords } from "@/api/shared/localModuleRepository";

export function getCutListsFromLocalRecords(records: RecordsState): CutListRecord[] {
  return listModuleRecords(records, "cutLists");
}

export function getProjectCutListsFromLocalRecords(
  records: RecordsState,
  projectId: string
): CutListRecord[] {
  return getCutListsFromLocalRecords(records).filter(
    (cutList) => cutList.projectId === projectId
  );
}
