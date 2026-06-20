export const CUT_LISTS = "cut-lists";

const PROJECTS_ENDPOINT = "projects";

export const CUT_LIST = (cutListId: string) => `${CUT_LISTS}/${cutListId}`;

export const PROJECT_CUT_LISTS = (projectId: string) =>
  `${PROJECTS_ENDPOINT}/${projectId}/cut-lists`;
