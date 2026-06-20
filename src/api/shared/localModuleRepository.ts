import { ModuleKey, RecordsState } from "@/lib/inventoryMock";

export type EditableModuleKey = Exclude<ModuleKey, "dashboard">;

export function listModuleRecords<T extends EditableModuleKey>(
  records: RecordsState,
  moduleKey: T
) {
  return records[moduleKey];
}

export function replaceModuleRecords<T extends EditableModuleKey>(
  records: RecordsState,
  moduleKey: T,
  nextRecords: RecordsState[T]
): RecordsState {
  return {
    ...records,
    [moduleKey]: nextRecords,
  };
}

export function upsertModuleRecord<
  T extends EditableModuleKey,
  TRecord extends RecordsState[T][number] & { updatedAt?: string },
>(records: RecordsState, moduleKey: T, record: TRecord): RecordsState {
  const source = records[moduleKey] as unknown as TRecord[];
  const exists = source.some((entry) => entry.id === record.id);
  const nextRecords = exists
    ? source.map((entry) => (entry.id === record.id ? record : entry))
    : [record, ...source];

  return replaceModuleRecords(records, moduleKey, nextRecords as unknown as RecordsState[T]);
}

export function removeModuleRecord<T extends EditableModuleKey>(
  records: RecordsState,
  moduleKey: T,
  recordId: string
): RecordsState {
  return replaceModuleRecords(
    records,
    moduleKey,
    records[moduleKey].filter((entry) => entry.id !== recordId) as RecordsState[T]
  );
}
