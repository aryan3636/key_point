import { ProjectRecord, RecordsState } from "@/lib/inventoryMock";
import { removeModuleRecord, upsertModuleRecord } from "@/api/shared/localModuleRepository";

export function saveProjectToLocalRecords(records: RecordsState, project: ProjectRecord) {
  return upsertModuleRecord(records, "projects", project);
}

export function deleteProjectFromLocalRecords(records: RecordsState, projectId: string) {
  return removeModuleRecord(records, "projects", projectId);
}
