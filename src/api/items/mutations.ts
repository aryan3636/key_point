import { ItemRecord, RecordsState } from "@/lib/inventoryMock";
import { removeModuleRecord, upsertModuleRecord } from "@/api/shared/localModuleRepository";

export function saveItemToLocalRecords(records: RecordsState, item: ItemRecord) {
  return upsertModuleRecord(records, "items", item);
}

export function deleteItemFromLocalRecords(records: RecordsState, itemId: string) {
  return removeModuleRecord(records, "items", itemId);
}
