import { ItemRecord, RecordsState } from "@/lib/inventoryMock";
import { listModuleRecords } from "@/api/shared/localModuleRepository";

export function getItemsFromLocalRecords(records: RecordsState): ItemRecord[] {
  return listModuleRecords(records, "items");
}

export function getItemFromLocalRecords(records: RecordsState, itemId: string) {
  return getItemsFromLocalRecords(records).find((item) => item.id === itemId) ?? null;
}
