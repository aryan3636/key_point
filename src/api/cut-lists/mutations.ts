import { CutListRecord, RecordsState } from "@/lib/inventoryMock";
import { removeModuleRecord, upsertModuleRecord } from "@/api/shared/localModuleRepository";

export function saveCutListToLocalRecords(records: RecordsState, cutList: CutListRecord) {
  return upsertModuleRecord(records, "cutLists", cutList);
}

export function deleteCutListFromLocalRecords(records: RecordsState, cutListId: string) {
  return removeModuleRecord(records, "cutLists", cutListId);
}
