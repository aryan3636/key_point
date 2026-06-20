import { ProjectRecord, RecordsState } from "@/lib/inventoryMock";
import { listModuleRecords } from "@/api/shared/localModuleRepository";

export function getProjectsFromLocalRecords(records: RecordsState): ProjectRecord[] {
  return listModuleRecords(records, "projects");
}

export function getProjectFromLocalRecords(records: RecordsState, projectId: string) {
  return getProjectsFromLocalRecords(records).find((project) => project.id === projectId) ?? null;
}
