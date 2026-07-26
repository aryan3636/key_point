"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useAppState } from "@/app/context/app-state-context";
import {
  CutListRecord,
  ProjectSettings,
  generateNextCabinetCode,
  getCabinetCodePrefix,
} from "@/lib/inventoryMock";

const baseSubtypes: CutListRecord["cabinetSubtype"][] = ["Standard", "Shelves", "Drawer", "Sink"];
const upperSubtypes: CutListRecord["cabinetSubtype"][] = ["Standard", "Shelves"];

const materialThicknessByName: Record<string, number> = {
  "5/8 White Melamine": 0.625,
  "3/4 White Melamine": 0.75,
  "5/8 Plywood": 0.625,
  "3/4 Plywood": 0.75,
};

type CabinetFormValues = {
  code: string;
  itemName: string;
  cabinetCategory: CutListRecord["cabinetCategory"];
  cabinetSubtype: CutListRecord["cabinetSubtype"];
  inputUnit: CutListRecord["inputUnit"];
  width: string;
  height: string;
  depth: string;
  quantity: string;
  interiorMaterial: string;
  customMaterialName: string;
  customMaterialThickness: string;
  materialThickness: string;
  doorThickness: string;
  bumperAllowance: string;
  finishedSides: CutListRecord["finishedSides"];
  upperBottomCondition: CutListRecord["upperBottomCondition"];
  finishedMaterialThicknessM2: string;
  lightValanceHeight: string;
  backOption: CutListRecord["backOption"];
  shelfQty: string;
  shelfType: CutListRecord["shelfType"];
  shelfFinish: string;
  slideType: CutListRecord["slideType"];
  slideLength: string;
  drawerQty: string;
  drawerHeights: string[];
  status: CutListRecord["status"];
  notes: string;
};

function getCabinetUse(
  category: CutListRecord["cabinetCategory"],
  subtype: CutListRecord["cabinetSubtype"]
) {
  if (category === "Upper") {
    return subtype === "Shelves" ? "upperShelvingCabinet" : "upperStandardCabinet";
  }
  if (category !== "Base") {
    return "unsupportedCabinet";
  }
  if (subtype === "Shelves") {
    return "shelvingCabinet";
  }
  if (subtype === "Drawer") {
    return "drawerBank";
  }
  if (subtype === "Sink") {
    return "sinkCabinet";
  }
  return "standardBaseCabinet";
}

function toInches(value: string, unit: CutListRecord["inputUnit"]) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return unit === "mm" ? number / 25.4 : number;
}

function materialThickness(values: CabinetFormValues) {
  if (values.interiorMaterial === "Custom") {
    return toInches(values.customMaterialThickness, values.inputUnit);
  }

  return Number(values.materialThickness) || materialThicknessByName[values.interiorMaterial] || 0;
}

function isPositiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

function getBoxDepth(values: CabinetFormValues) {
  const fullDepth = toInches(values.depth, values.inputUnit);
  const doorThickness = toInches(values.doorThickness, values.inputUnit);
  const bumperAllowance = Number(values.bumperAllowance) || 0;

  if (values.cabinetCategory === "Upper") {
    return fullDepth - doorThickness - bumperAllowance;
  }

  const doorDeduction =
    values.finishedSides === "Front and Back" ? doorThickness * 2 : doorThickness;
  return fullDepth - doorDeduction - bumperAllowance;
}

function formatDimension(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "";
  }
  const rounded = Math.round((number + Number.EPSILON) * 1000) / 1000;
  const text = String(rounded);
  return text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
}

function addSummaryItem(items: Array<[string, string]>, label: string, value: unknown) {
  const cleanValue = String(value ?? "").trim();
  if (cleanValue) {
    items.push([label, cleanValue]);
  }
}

function getUpperBottomDeduction(values: CabinetFormValues) {
  if (values.upperBottomCondition === "Finished Bottom") {
    return toInches(values.finishedMaterialThicknessM2, values.inputUnit);
  }
  if (values.upperBottomCondition === "Light Valance") {
    return toInches(values.lightValanceHeight, values.inputUnit);
  }
  return 0;
}

function getLiveSummaryItems(
  values: CabinetFormValues,
  subtype: CutListRecord["cabinetSubtype"]
) {
  const cabinetUse = getCabinetUse(values.cabinetCategory, subtype);
  const items: Array<[string, string]> = [];
  const boxDepth = getBoxDepth(values);

  addSummaryItem(items, "Code", values.code || "Not set");
  addSummaryItem(items, "Cabinet category", values.cabinetCategory);
  if (values.cabinetCategory === "Base") addSummaryItem(items, "Cabinet subtype", subtype);
  if (values.cabinetCategory === "Upper") {
    addSummaryItem(items, "Upper subtype", subtype);
    addSummaryItem(
      items,
      "Formula status",
      subtype === "Shelves" ? "Upper Shelves formula enabled" : "Upper Standard formula enabled"
    );
  }
  if (values.cabinetCategory !== "Base" && values.cabinetCategory !== "Upper") {
    addSummaryItem(items, "Formula status", "Cut list formula not implemented yet.");
  }
  if (cabinetUse === "drawerBank" || cabinetUse === "sinkCabinet") {
    addSummaryItem(items, "Back option", values.backOption === "noBack" ? "No Back" : "Full Back");
  }
  addSummaryItem(items, "Width", values.width);
  addSummaryItem(items, "Height", values.height);
  addSummaryItem(items, "Full cabinet depth", values.depth);
  if (values.cabinetCategory !== "Upper") {
    addSummaryItem(items, "Finished sides", values.finishedSides);
  }
  addSummaryItem(items, "Box depth", boxDepth > 0 ? formatDimension(boxDepth) : "");
  addSummaryItem(items, "Unit", values.inputUnit);
  if (values.cabinetCategory === "Upper") {
    const upperBoxHeight = toInches(values.height, values.inputUnit) - getUpperBottomDeduction(values);
    addSummaryItem(items, "Bottom condition", values.upperBottomCondition);
    if (values.upperBottomCondition === "Finished Bottom") {
      addSummaryItem(items, "M2", values.finishedMaterialThicknessM2);
    }
    if (values.upperBottomCondition === "Light Valance") {
      addSummaryItem(items, "LV", values.lightValanceHeight);
    }
    addSummaryItem(items, "Upper box height", upperBoxHeight > 0 ? formatDimension(upperBoxHeight) : "");
  }
  if (cabinetUse === "shelvingCabinet" || cabinetUse === "upperShelvingCabinet") {
    addSummaryItem(items, "Shelf quantity", values.shelfQty);
    addSummaryItem(items, "Shelf type", values.shelfType);
  }
  if (cabinetUse === "drawerBank") {
    addSummaryItem(items, "Slide type", values.slideType === "ballBearing" ? "Ball Bearing" : "Undermount");
    addSummaryItem(items, "Slide length", values.slideLength);
    addSummaryItem(items, "Drawer quantity", values.drawerQty);
    addSummaryItem(
      items,
      "Drawer heights",
      values.drawerHeights
        .filter(Boolean)
        .map((height, index) => `D${index + 1}: ${height}`)
        .join(", ")
    );
  }
  addSummaryItem(items, "Interior material", values.interiorMaterial);
  if (values.interiorMaterial === "Custom") {
    addSummaryItem(items, "Custom material name", values.customMaterialName);
  }
  addSummaryItem(items, "Material thickness", values.materialThickness);
  addSummaryItem(items, "Door thickness", values.doorThickness);

  return items;
}

function getNextAvailableCodeFromLastCode(lastCode: string, rows: CutListRecord[]) {
  const existingCodes = new Set(rows.map((row) => String(row.code || "").toUpperCase()));
  const normalizedCode = String(lastCode || "").trim().toUpperCase();
  const match = normalizedCode.match(/^([A-Z]+)(\d+)$/);

  if (!match) {
    const baseCode = normalizedCode || "B";
    let copyNumber = 1;
    let fallbackCode = `${baseCode}-COPY`;

    while (existingCodes.has(fallbackCode)) {
      copyNumber += 1;
      fallbackCode = `${baseCode}-COPY${copyNumber}`;
    }

    return fallbackCode;
  }

  const prefix = match[1];
  const matchingNumbers = rows
    .map((row) => String(row.code || "").toUpperCase().match(new RegExp(`^${prefix}(\\d+)$`)))
    .filter(Boolean)
    .map((codeMatch) => Number(codeMatch?.[1]))
    .filter((number) => Number.isFinite(number));
  let nextNumber = Math.max(Number(match[2]), ...matchingNumbers) + 1;
  let nextCode = `${prefix}${nextNumber}`;

  while (existingCodes.has(nextCode)) {
    nextNumber += 1;
    nextCode = `${prefix}${nextNumber}`;
  }

  return nextCode;
}

function validateCabinetValues({
  existingRecordId,
  savedCabinets,
  subtype,
  values,
}: {
  existingRecordId?: string;
  savedCabinets: CutListRecord[];
  subtype: CutListRecord["cabinetSubtype"];
  values: CabinetFormValues;
}) {
  const code = values.code.trim().toUpperCase();

  if (!code) return "Code is required.";

  const duplicate = savedCabinets.find(
    (savedCabinet) =>
      savedCabinet.code.trim().toUpperCase() === code && savedCabinet.id !== existingRecordId
  );
  if (duplicate) return "Code already exists.";

  if (values.cabinetCategory !== "Base" && values.cabinetCategory !== "Upper") {
    return "";
  }

  if (values.cabinetCategory === "Base" && !subtype) return "Cabinet subtype required.";
  if (!isPositiveNumber(toInches(values.width, values.inputUnit))) return "Width required.";
  if (!isPositiveNumber(toInches(values.height, values.inputUnit))) return "Height required.";
  if (!isPositiveNumber(toInches(values.depth, values.inputUnit))) return "Full cabinet depth required.";
  if (!values.interiorMaterial) return "Interior material required.";
  if (values.interiorMaterial === "Custom" && !values.customMaterialName.trim()) {
    return "Custom material name required.";
  }
  if (values.interiorMaterial === "Custom" && !isPositiveNumber(materialThickness(values))) {
    return "Custom material thickness required.";
  }
  if (!isPositiveNumber(materialThickness(values))) return "Material thickness required.";
  if (!isPositiveNumber(toInches(values.doorThickness, values.inputUnit))) {
    return "Door thickness required for body depth.";
  }
  if (!isPositiveNumber(values.bumperAllowance)) {
    return "Bumper allowance required.";
  }
  if (!values.finishedSides) return "Finished sides required.";
  if (!isPositiveNumber(Number(values.quantity))) return "Quantity is required.";

  if (getBoxDepth(values) <= 0) {
    return "Invalid depth: full depth, door thickness, and bumper create zero or negative box depth.";
  }

  if (values.cabinetCategory === "Upper") {
    const bottomDeduction =
      values.upperBottomCondition === "Finished Bottom"
        ? toInches(values.finishedMaterialThicknessM2, values.inputUnit)
        : values.upperBottomCondition === "Light Valance"
          ? toInches(values.lightValanceHeight, values.inputUnit)
          : 0;

    if (
      values.upperBottomCondition === "Finished Bottom" &&
      !isPositiveNumber(bottomDeduction)
    ) {
      return "Finished material thickness M2 required.";
    }

    if (
      values.upperBottomCondition === "Light Valance" &&
      !isPositiveNumber(bottomDeduction)
    ) {
      return "Light valance height LV required.";
    }

    if (toInches(values.height, values.inputUnit) - bottomDeduction <= 0) {
      return "Invalid upper height: bottom condition creates zero or negative upper box height.";
    }
  }

  if (subtype === "Shelves") {
    if (!isPositiveNumber(Number(values.shelfQty))) return "Shelf quantity required.";
    if (!values.shelfType) return "Shelf type required.";
  }

  if (subtype === "Drawer") {
    const drawerQty = Math.max(0, Math.round(Number(values.drawerQty) || 0));
    const drawerHeights = values.drawerHeights
      .slice(0, drawerQty)
      .map((height) => toInches(height, values.inputUnit));

    if (!values.backOption) return "Back option required.";
    if (!values.slideType) return "Slide type required.";
    if (!isPositiveNumber(toInches(values.slideLength, values.inputUnit))) {
      return "Slide length required.";
    }
    if (!isPositiveNumber(drawerQty)) return "Drawer quantity required.";
    if (
      drawerHeights.length !== drawerQty ||
      drawerHeights.some((height) => !isPositiveNumber(height))
    ) {
      return "Enter height for every drawer.";
    }
  }

  if (subtype === "Sink" && !values.backOption) return "Back option required.";

  return "";
}

function makeDefaults(
  record: CutListRecord | undefined,
  nextCode: string,
  preserveCode = true,
  projectSettings?: ProjectSettings
): CabinetFormValues {
  const settings = projectSettings;
  return {
    code: preserveCode && record?.code ? record.code : nextCode,
    itemName: record?.itemName ?? "",
    cabinetCategory: record?.cabinetCategory ?? "Base",
    cabinetSubtype: record?.cabinetSubtype ?? "Standard",
    inputUnit: record?.inputUnit ?? settings?.inputUnit ?? "in",
    width: String(record?.width ?? ""),
    height: String(record?.height ?? ""),
    depth: String(record?.depth ?? ""),
    quantity: String(record?.quantity ?? 1),
    interiorMaterial: record
      ? record.customMaterialName
        ? "Custom"
        : record.interiorMaterial
      : settings?.interiorMaterial ?? "",
    customMaterialName: record?.customMaterialName ?? settings?.customMaterialName ?? "",
    customMaterialThickness: String(record?.customMaterialThickness ?? settings?.customMaterialThickness ?? ""),
    materialThickness: String(record?.materialThickness ?? settings?.materialThickness ?? ""),
    doorThickness: String(record?.doorThickness ?? settings?.doorThickness ?? ""),
    bumperAllowance: String(record?.bumperAllowance ?? settings?.bumperAllowance ?? 0.125),
    finishedSides: record?.finishedSides ?? "Front",
    upperBottomCondition: record?.upperBottomCondition ?? "Regular / Visible Bottom",
    finishedMaterialThicknessM2: String(record?.finishedMaterialThicknessM2 ?? ""),
    lightValanceHeight: String(record?.lightValanceHeight ?? ""),
    backOption: record?.backOption ?? "fullBack",
    shelfQty: String(record?.shelfQty ?? 0),
    shelfType: record?.shelfType ?? settings?.shelfType ?? "Fixed Shelf",
    shelfFinish: record?.shelfFinish ?? settings?.shelfFinish ?? "White",
    slideType: record?.slideType ?? settings?.slideType ?? "undermount",
    slideLength: String(record?.slideLength ?? ""),
    drawerQty: String(record?.drawerQty ?? 0),
    drawerHeights: Array.isArray(record?.drawerHeights)
      ? record.drawerHeights.map((height) => String(height))
      : [],
    status: record?.status ?? settings?.cabinetStatus ?? "Draft",
    notes: record?.notes ?? record?.itemName ?? "",
  };
}

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

export function CabinetFormPage() {
  const {
    records,
    cabinetFormState,
    saveModuleRecord,
    removeModuleRecord,
    setCabinetFormState,
    setDetailState,
    setProjectWorkspaceTab,
  } = useAppState();

  const project = records.projects.find((entry) => entry.id === cabinetFormState?.projectId);
  const area = project?.areas.find((entry) => entry.id === cabinetFormState?.areaId);
  const existingRecord = records.cutLists.find((entry) => entry.id === cabinetFormState?.recordId);
  const duplicateRecord = records.cutLists.find(
    (entry) => entry.id === cabinetFormState?.duplicateFromId
  );
  const defaultRecord = existingRecord ?? duplicateRecord;
  const makeCabinetCode = (
    category: CutListRecord["cabinetCategory"],
    subtype: CutListRecord["cabinetSubtype"]
  ) =>
    generateNextCabinetCode(
      getCabinetCodePrefix(category, subtype),
      records.cutLists
        .filter((cutList) => cutList.id !== existingRecord?.id)
        .map((cutList) => cutList.code)
    );
  const nextCode = makeCabinetCode(
    defaultRecord?.cabinetCategory ?? "Base",
    defaultRecord?.cabinetSubtype ?? "Standard"
  );
  const [values, setValues] = useState<CabinetFormValues>(() =>
    makeDefaults(defaultRecord, nextCode, Boolean(existingRecord), project?.settings)
  );
  const [showProjectOverrides, setShowProjectOverrides] = useState(Boolean(defaultRecord));
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("Enter cabinet dimensions, then save the row.");

  const subtypeOptions =
    values.cabinetCategory === "Upper"
      ? upperSubtypes
      : values.cabinetCategory === "Base"
        ? baseSubtypes
        : [];
  const selectedSubtype = subtypeOptions.includes(values.cabinetSubtype)
    ? values.cabinetSubtype
    : subtypeOptions[0] ?? "Standard";
  const cabinetUse = getCabinetUse(values.cabinetCategory, selectedSubtype);
  const showSubtype = subtypeOptions.length > 0;
  const showShelfFields = cabinetUse === "shelvingCabinet" || cabinetUse === "upperShelvingCabinet";
  const showDrawerFields = cabinetUse === "drawerBank";
  const showBackOption = cabinetUse === "drawerBank" || cabinetUse === "sinkCabinet";
  const showUpperOptions = values.cabinetCategory === "Upper";
  const showFinishedBottom =
    showUpperOptions && values.upperBottomCondition === "Finished Bottom";
  const showLightValance =
    showUpperOptions && values.upperBottomCondition === "Light Valance";
  const isCustomMaterial = values.interiorMaterial === "Custom";

  if (!cabinetFormState || !project || !area) {
    return (
      <section className="workspace-grid single-column">
        <div className="panel">
          <div className="empty-state">Select an area from a project to create a cabinet.</div>
        </div>
      </section>
    );
  }

  const setValue = <Key extends keyof CabinetFormValues>(
    key: Key,
    value: CabinetFormValues[Key]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const returnToProject = () => {
    setDetailState(null);
    setProjectWorkspaceTab(cabinetFormState.returnTab ?? "areas");
    setCabinetFormState(null);
  };

  const showCabinetList = () => {
    setDetailState(null);
    setProjectWorkspaceTab("cutlists");
    setCabinetFormState(null);
  };

  const saveCabinet = (sourceValues: CabinetFormValues) => {
    const sourceSubtypeOptions =
      sourceValues.cabinetCategory === "Upper"
        ? upperSubtypes
        : sourceValues.cabinetCategory === "Base"
          ? baseSubtypes
          : [];
    const sourceSubtype = sourceSubtypeOptions.includes(sourceValues.cabinetSubtype)
      ? sourceValues.cabinetSubtype
      : sourceSubtypeOptions[0] ?? "Standard";
    const sourceCabinetUse = getCabinetUse(sourceValues.cabinetCategory, sourceSubtype);
    const sourceShowShelfFields =
      sourceCabinetUse === "shelvingCabinet" || sourceCabinetUse === "upperShelvingCabinet";
    const sourceShowDrawerFields = sourceCabinetUse === "drawerBank";
    const sourceShowBackOption =
      sourceCabinetUse === "drawerBank" || sourceCabinetUse === "sinkCabinet";
    const sourceShowUpperOptions = sourceValues.cabinetCategory === "Upper";
    const sourceShowFinishedBottom =
      sourceShowUpperOptions && sourceValues.upperBottomCondition === "Finished Bottom";
    const sourceShowLightValance =
      sourceShowUpperOptions && sourceValues.upperBottomCondition === "Light Valance";
    const sourceIsCustomMaterial = sourceValues.interiorMaterial === "Custom";
    const drawerHeights = sourceShowDrawerFields
      ? sourceValues.drawerHeights.filter(Boolean).join(",")
      : "";
    const validationMessage = validateCabinetValues({
      existingRecordId: existingRecord?.id,
      savedCabinets: records.cutLists,
      subtype: sourceSubtype,
      values: sourceValues,
    });

    if (validationMessage) {
      setFormError(validationMessage);
      return "";
    }

    const savedId = saveModuleRecord(
      "cutLists",
      {
        projectId: project.id,
        areaId: area.id,
        code: sourceValues.code,
        itemName: sourceValues.itemName || `${area.areaName} cabinet`,
        cabinetCategory: sourceValues.cabinetCategory,
        cabinetSubtype: sourceSubtypeOptions.length > 0 ? sourceSubtype : "Standard",
        inputUnit: sourceValues.inputUnit,
        width: sourceValues.width,
        height: sourceValues.height,
        depth: sourceValues.depth,
        quantity: sourceValues.quantity,
        interiorMaterial: sourceValues.interiorMaterial,
        customMaterialName: sourceIsCustomMaterial ? sourceValues.customMaterialName : "",
        customMaterialThickness: sourceIsCustomMaterial ? sourceValues.customMaterialThickness : "0",
        materialThickness: sourceValues.materialThickness,
        doorThickness: sourceValues.doorThickness,
        bumperAllowance: sourceValues.bumperAllowance,
        finishedSides: sourceValues.cabinetCategory === "Upper" ? "Front" : sourceValues.finishedSides,
        upperBottomCondition: sourceShowUpperOptions
          ? sourceValues.upperBottomCondition
          : "Regular / Visible Bottom",
        finishedMaterialThicknessM2: sourceShowFinishedBottom
          ? sourceValues.finishedMaterialThicknessM2
          : "0",
        lightValanceHeight: sourceShowLightValance ? sourceValues.lightValanceHeight : "0",
        backOption: sourceShowBackOption ? sourceValues.backOption : "fullBack",
        shelfQty: sourceShowShelfFields ? sourceValues.shelfQty : "0",
        shelfType: sourceShowShelfFields ? sourceValues.shelfType : "Fixed Shelf",
        shelfFinish: sourceShowShelfFields ? sourceValues.shelfFinish : "White",
        slideType: sourceShowDrawerFields ? sourceValues.slideType : "",
        slideLength: sourceShowDrawerFields ? sourceValues.slideLength : "0",
        drawerQty: sourceShowDrawerFields ? sourceValues.drawerQty : "0",
        drawerHeights,
        status: sourceValues.status,
        notes: sourceValues.itemName,
      },
      existingRecord?.id
    );

    setFormError("");
    setFormMessage(existingRecord ? "Cabinet row updated." : "Cabinet row saved.");
    showCabinetList();
    return savedId;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveCabinet(values);
  };

  const clearCabinetForm = (message = "Form cleared.", reservedCode = "") => {
    const nextBaseCode = generateNextCabinetCode(
      getCabinetCodePrefix("Base", "Standard"),
      [...records.cutLists.map((cutList) => cutList.code), reservedCode].filter(Boolean)
    );
    setValues(makeDefaults(undefined, nextBaseCode, false, project.settings));
    setShowProjectOverrides(false);
    setFormError("");
    setFormMessage(message);
  };

  const copyLastRowToForm = () => {
    const lastRow = records.cutLists[0];
    if (!lastRow) {
      setFormError("No saved row to copy yet.");
      return;
    }

    setValues(
      makeDefaults(
        lastRow,
        getNextAvailableCodeFromLastCode(lastRow.code, records.cutLists),
        false
      )
    );
    setFormError("");
    setFormMessage("Last row copied to form. Edit values and save as a new row.");
  };

  const liveSummaryItems = getLiveSummaryItems(values, selectedSubtype);

  return (
    <section className="workspace-grid single-column">
      <div className="panel cabinet-page">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{project.name} / {area.areaName}</p>
            <h2>{existingRecord ? "Edit Cabinet" : "Create Cabinet"}</h2>
            <p>
              Cabinet rows are created from project areas and will show only under their area.
            </p>
          </div>
          <button
            className="secondary-button"
            onClick={returnToProject}
            type="button"
          >
            Back to Project
          </button>
        </div>

        {values.cabinetCategory !== "Base" && values.cabinetCategory !== "Upper" && (
          <div className="form-message error">
            Cut list formula is not implemented yet for this cabinet category.
          </div>
        )}
        {!formError && <div className="form-message">{formMessage}</div>}
        {formError && <div className="form-message error">{formError}</div>}

        <form className="cabinet-form-page" onSubmit={submit}>
          <fieldset className="form-section">
            <legend>Cabinet Identity</legend>
            <div className="form-grid">
              <Field label="Cabinet Category" required>
                <select
                  value={values.cabinetCategory}
                  onChange={(event) =>
                    setValues((current) => {
                      const cabinetCategory = event.target.value as CutListRecord["cabinetCategory"];
                      const cabinetSubtype =
                        cabinetCategory === "Upper"
                          ? "Standard"
                          : cabinetCategory === "Base"
                            ? baseSubtypes.includes(current.cabinetSubtype)
                              ? current.cabinetSubtype
                              : "Standard"
                            : "Standard";

                      return {
                        ...current,
                        cabinetCategory,
                        cabinetSubtype,
                        code: existingRecord?.code ?? makeCabinetCode(cabinetCategory, cabinetSubtype),
                      };
                    })
                  }
                >
                  {["Base", "Upper", "Tower / Tall", "Open"].map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </Field>
              {showSubtype && (
                <Field label={values.cabinetCategory === "Upper" ? "Upper Subtype" : "Cabinet Subtype"} required>
                  <select
                    value={selectedSubtype}
                    onChange={(event) =>
                      setValues((current) => {
                        const cabinetSubtype = event.target.value as CutListRecord["cabinetSubtype"];

                        return {
                          ...current,
                          cabinetSubtype,
                          code:
                            existingRecord?.code ??
                            makeCabinetCode(current.cabinetCategory, cabinetSubtype),
                        };
                      })
                    }
                  >
                    {subtypeOptions.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Auto-generated Code" required>
                <input
                  readOnly
                  value={values.code}
                />
              </Field>
              <Field label="Item Name / Description">
                <input
                  value={values.itemName}
                  onChange={(event) => setValue("itemName", event.target.value)}
                  placeholder="Optional"
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Cabinet Dimensions</legend>
            <div className="form-grid">
              <Field label={`Width (${values.inputUnit})`} required>
                <input type="number" step="0.001" value={values.width} onChange={(event) => setValue("width", event.target.value)} />
              </Field>
              <Field label={`Height (${values.inputUnit})`} required>
                <input type="number" step="0.001" value={values.height} onChange={(event) => setValue("height", event.target.value)} />
              </Field>
              <Field label={`Full Cabinet Depth (${values.inputUnit})`} required>
                <input type="number" step="0.001" value={values.depth} onChange={(event) => setValue("depth", event.target.value)} />
              </Field>
              <Field label="Measurement Unit">
                <select value={values.inputUnit} onChange={(event) => setValue("inputUnit", event.target.value as CutListRecord["inputUnit"])}>
                  <option value="in">in</option>
                  <option value="mm">mm</option>
                </select>
              </Field>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Project Defaults</legend>
            <div className="project-defaults-bar">
              <p>
                {defaultRecord ? "Cabinet-specific values:" : "Using Project Settings:"}{" "}
                <strong>{values.interiorMaterial}</strong>, {values.doorThickness} {values.inputUnit} doors,
                and {values.bumperAllowance} in bumper allowance.
              </p>
              <button className="secondary-button" type="button" onClick={() => setShowProjectOverrides((current) => !current)}>
                {showProjectOverrides ? "Hide Overrides" : "Override for this Cabinet"}
              </button>
            </div>
            {showProjectOverrides && <>
            <div className="form-grid">
              <Field label="Interior Material" required>
                <select
                  value={values.interiorMaterial}
                  onChange={(event) => {
                    const interiorMaterial = event.target.value;

                    setValues((current) => ({
                      ...current,
                      interiorMaterial,
                      customMaterialName: interiorMaterial === "Custom" ? current.customMaterialName : "",
                      customMaterialThickness:
                        interiorMaterial === "Custom" ? current.customMaterialThickness : "",
                      materialThickness:
                        interiorMaterial === "Custom"
                          ? current.materialThickness
                          : String(materialThicknessByName[interiorMaterial] ?? 0.625),
                    }));
                  }}
                >
                  <option value="">Select interior material</option>
                  <option value="5/8 White Melamine">5/8 White Melamine</option>
                  <option value="3/4 White Melamine">3/4 White Melamine</option>
                  <option value="5/8 Plywood">5/8 Plywood</option>
                  <option value="3/4 Plywood">3/4 Plywood</option>
                  <option value="Custom">Custom</option>
                </select>
              </Field>
              {isCustomMaterial && (
                <>
                  <Field label="Custom Material Name" required>
                    <input placeholder="Enter custom material name" value={values.customMaterialName} onChange={(event) => setValue("customMaterialName", event.target.value)} />
                  </Field>
                  <Field label={`Custom Material Thickness (${values.inputUnit})`} required>
                    <input min="0" placeholder="Enter custom thickness" type="number" step="0.001" value={values.customMaterialThickness} onChange={(event) => setValue("customMaterialThickness", event.target.value)} />
                  </Field>
                </>
              )}
              <Field label="Selected Thickness (in)">
                <input readOnly value={values.materialThickness} />
              </Field>
              <Field label={`Door Thickness (${values.inputUnit})`} required={values.cabinetCategory === "Base" || values.cabinetCategory === "Upper"}>
                <input placeholder="Required for body depth" type="number" step="0.001" value={values.doorThickness} onChange={(event) => setValue("doorThickness", event.target.value)} />
              </Field>
              <Field label="Bumper Allowance">
                <input readOnly value={values.bumperAllowance} />
              </Field>
              {values.cabinetCategory !== "Upper" && (
                <Field label="Finished Sides" required>
                  <select value={values.finishedSides} onChange={(event) => setValue("finishedSides", event.target.value as CutListRecord["finishedSides"])}>
                    <option value="Front">Front</option>
                    <option value="Front and Back">Front and Back</option>
                  </select>
                </Field>
              )}
              <Field label="Box Depth (calculated)">
                <input readOnly value={getBoxDepth(values) > 0 ? formatDimension(getBoxDepth(values)) : ""} />
              </Field>
            </div>
            </>}
          </fieldset>

          {showUpperOptions && (
            <fieldset className="form-section">
              <legend>Upper Options</legend>
              <div className="form-grid">
                <Field label="Bottom Condition">
                  <select
                    value={values.upperBottomCondition}
                    onChange={(event) =>
                      setValue("upperBottomCondition", event.target.value as CutListRecord["upperBottomCondition"])
                    }
                  >
                    <option value="Regular / Visible Bottom">Regular / Visible Bottom</option>
                    <option value="Finished Bottom">Finished Bottom</option>
                    <option value="Light Valance">Light Valance</option>
                  </select>
                </Field>
                {showFinishedBottom && (
                  <Field label={`Finished Material Thickness (M2) (${values.inputUnit})`} required>
                    <input type="number" step="0.001" value={values.finishedMaterialThicknessM2} onChange={(event) => setValue("finishedMaterialThicknessM2", event.target.value)} />
                  </Field>
                )}
                {showLightValance && (
                  <Field label={`Light Valance Height (LV) (${values.inputUnit})`} required>
                    <input type="number" step="0.001" value={values.lightValanceHeight} onChange={(event) => setValue("lightValanceHeight", event.target.value)} />
                  </Field>
                )}
              </div>
            </fieldset>
          )}

          <fieldset className="form-section">
            <legend>Cabinet Configuration</legend>
            <div className="form-grid">
              <Field label="Cabinet Qty">
                <input type="number" min="1" step="1" value={values.quantity} onChange={(event) => setValue("quantity", event.target.value)} />
              </Field>
              {showBackOption && (
                <Field label="Back Option">
                  <select value={values.backOption} onChange={(event) => setValue("backOption", event.target.value as CutListRecord["backOption"])}>
                    <option value="fullBack">Full Back</option>
                    <option value="noBack">No Back</option>
                  </select>
                </Field>
              )}
              {showShelfFields && (
                <>
                  <Field label="Shelf Qty per Cabinet">
                    <input placeholder="Enter shelf quantity" type="number" min="1" step="1" value={values.shelfQty} onChange={(event) => setValue("shelfQty", event.target.value)} />
                  </Field>
                  <Field label="Shelf Type" required={Number(values.shelfQty) > 0}>
                    <select value={values.shelfType} onChange={(event) => setValue("shelfType", event.target.value as CutListRecord["shelfType"])}>
                      <option value="Fixed Shelf">Fixed Shelf</option>
                      <option value="Adjustable Shelf - Pins">Adjustable Shelf - Pins</option>
                      <option value="Adjustable Shelf - Pilasters">Adjustable Shelf - Pilasters</option>
                    </select>
                  </Field>
                  <Field label="Shelf Finish">
                    <select value={values.shelfFinish} onChange={(event) => setValue("shelfFinish", event.target.value)}>
                      <option value="White">White</option>
                      <option value="Black">Black</option>
                      <option value="Matching">Matching</option>
                    </select>
                  </Field>
                </>
              )}
            </div>
          </fieldset>

          {showDrawerFields && (
            <fieldset className="form-section">
              <legend>Drawer Bank Inputs</legend>
              <div className="form-grid">
                <Field label="Slide Type" required>
                  <select value={values.slideType || "undermount"} onChange={(event) => setValue("slideType", event.target.value as CutListRecord["slideType"])}>
                    <option value="ballBearing">Ball Bearing</option>
                    <option value="undermount">Undermount</option>
                  </select>
                </Field>
                <Field label={`Slide Length (${values.inputUnit})`} required>
                  <input type="number" min="0" step="0.001" value={values.slideLength} onChange={(event) => setValue("slideLength", event.target.value)} />
                </Field>
                <Field label="Number of Drawers" required>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={values.drawerQty}
                    onChange={(event) => {
                      const drawerQty = event.target.value;
                      const drawerCount = Math.max(0, Math.round(Number(drawerQty) || 0));

                      setValues((current) => ({
                        ...current,
                        drawerQty,
                        drawerHeights: Array.from(
                          { length: drawerCount },
                          (_, index) => current.drawerHeights[index] ?? ""
                        ),
                      }));
                    }}
                  />
                </Field>
              </div>
              <div className="form-grid drawer-height-grid">
                {values.drawerHeights.map((height, index) => (
                  <Field label={`Drawer ${index + 1} Height (${values.inputUnit})`} key={index} required>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={height}
                      onChange={(event) => {
                        const nextHeights = [...values.drawerHeights];
                        nextHeights[index] = event.target.value;
                        setValue("drawerHeights", nextHeights);
                      }}
                    />
                  </Field>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="form-section">
            <legend>Live Cabinet Summary</legend>
            <div className="live-summary-grid" aria-live="polite">
              {liveSummaryItems.length > 0 ? (
                liveSummaryItems.map(([label, value]) => (
                  <div className="live-summary-item" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))
              ) : (
                <div className="summary-empty">Enter cabinet values to preview this item.</div>
              )}
            </div>
          </fieldset>

          <div className="flyout-footer cabinet-page-footer">
            {existingRecord && (
              <button
                className="table-action danger"
                onClick={() => {
                  removeModuleRecord("cutLists", existingRecord.id);
                  returnToProject();
                }}
                type="button"
              >
                Delete Cabinet
              </button>
            )}
            <button className="secondary-button" onClick={returnToProject} type="button">
              Cancel
            </button>
            {!existingRecord && (
              <button className="secondary-button" onClick={copyLastRowToForm} type="button">
                Copy Last Row to Form
              </button>
            )}
            {!existingRecord && (
              <button className="secondary-button" onClick={() => clearCabinetForm()} type="button">
                Clear Form
              </button>
            )}
            <button className="primary-button" type="submit">
              Save Cabinet Row
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
