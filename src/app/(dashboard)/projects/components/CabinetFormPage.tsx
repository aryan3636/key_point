"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useAppState } from "@/app/context/app-state-context";
import { CutListRecord, generateNextNumber } from "@/lib/inventoryMock";

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

function formatNumber(value: number) {
  return Number.isFinite(value) ? String(value).replace(/\.?0+$/, "") : "";
}

function makeDefaults(record: CutListRecord | undefined, nextCode: string): CabinetFormValues {
  return {
    code: record?.code ?? nextCode,
    itemName: record?.itemName ?? "",
    cabinetCategory: record?.cabinetCategory ?? "Base",
    cabinetSubtype: record?.cabinetSubtype ?? "Standard",
    inputUnit: record?.inputUnit ?? "in",
    width: String(record?.width ?? ""),
    height: String(record?.height ?? ""),
    depth: String(record?.depth ?? ""),
    quantity: String(record?.quantity ?? 1),
    interiorMaterial: record?.customMaterialName ? "Custom" : record?.interiorMaterial ?? "5/8 White Melamine",
    customMaterialName: record?.customMaterialName ?? "",
    customMaterialThickness: String(record?.customMaterialThickness ?? ""),
    materialThickness: String(record?.materialThickness ?? 0.625),
    doorThickness: String(record?.doorThickness ?? 0.75),
    bumperAllowance: String(record?.bumperAllowance ?? 0.125),
    finishedSides: record?.finishedSides ?? "Front",
    upperBottomCondition: record?.upperBottomCondition ?? "Regular / Visible Bottom",
    finishedMaterialThicknessM2: String(record?.finishedMaterialThicknessM2 ?? ""),
    lightValanceHeight: String(record?.lightValanceHeight ?? ""),
    backOption: record?.backOption ?? "fullBack",
    shelfQty: String(record?.shelfQty ?? 0),
    shelfType: record?.shelfType ?? "Fixed Shelf",
    shelfFinish: record?.shelfFinish ?? "White",
    slideType: record?.slideType ?? "undermount",
    slideLength: String(record?.slideLength ?? ""),
    drawerQty: String(record?.drawerQty ?? 0),
    drawerHeights: Array.isArray(record?.drawerHeights)
      ? record.drawerHeights.map((height) => String(height))
      : [],
    status: record?.status ?? "Draft",
    notes: record?.notes ?? "",
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
  const nextCode = useMemo(
    () => generateNextNumber("CUT", records.cutLists.map((cutList) => cutList.code)),
    [records.cutLists]
  );
  const [values, setValues] = useState<CabinetFormValues>(() =>
    makeDefaults(existingRecord, nextCode)
  );

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
  const bodyDepth = useMemo(() => {
    const depth = Number(values.depth);
    const doorThickness = Number(values.doorThickness);
    const bumperAllowance = Number(values.bumperAllowance);
    if (!Number.isFinite(depth) || !Number.isFinite(doorThickness) || depth <= 0) {
      return "";
    }
    return formatNumber(depth - doorThickness - (Number.isFinite(bumperAllowance) ? bumperAllowance : 0));
  }, [values.bumperAllowance, values.depth, values.doorThickness]);

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
    setProjectWorkspaceTab("areas");
    setCabinetFormState(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const drawerHeights = showDrawerFields ? values.drawerHeights.filter(Boolean).join(",") : "";
    const savedId = saveModuleRecord(
      "cutLists",
      {
        projectId: project.id,
        areaId: area.id,
        code: values.code,
        itemName: values.itemName || `${area.areaName} cabinet`,
        cabinetCategory: values.cabinetCategory,
        cabinetSubtype: showSubtype ? selectedSubtype : "Standard",
        inputUnit: values.inputUnit,
        width: values.width,
        height: values.height,
        depth: values.depth,
        quantity: values.quantity,
        interiorMaterial: values.interiorMaterial,
        customMaterialName: isCustomMaterial ? values.customMaterialName : "",
        customMaterialThickness: isCustomMaterial ? values.customMaterialThickness : "0",
        materialThickness: values.materialThickness,
        doorThickness: values.doorThickness,
        bumperAllowance: values.bumperAllowance,
        finishedSides: values.cabinetCategory === "Upper" ? "Front" : values.finishedSides,
        upperBottomCondition: showUpperOptions
          ? values.upperBottomCondition
          : "Regular / Visible Bottom",
        finishedMaterialThicknessM2: showFinishedBottom
          ? values.finishedMaterialThicknessM2
          : "0",
        lightValanceHeight: showLightValance ? values.lightValanceHeight : "0",
        backOption: showBackOption ? values.backOption : "fullBack",
        shelfQty: showShelfFields ? values.shelfQty : "0",
        shelfType: showShelfFields ? values.shelfType : "Fixed Shelf",
        shelfFinish: showShelfFields ? values.shelfFinish : "White",
        slideType: showDrawerFields ? values.slideType : "",
        slideLength: showDrawerFields ? values.slideLength : "0",
        drawerQty: showDrawerFields ? values.drawerQty : "0",
        drawerHeights,
        status: values.status,
        notes: values.notes,
      },
      existingRecord?.id
    );

    returnToProject();
    return savedId;
  };

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

        <form className="cabinet-form-page" onSubmit={submit}>
          <fieldset className="form-section">
            <legend>Cabinet Identity</legend>
            <div className="form-grid">
              <Field label="Cabinet Category" required>
                <select
                  value={values.cabinetCategory}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      cabinetCategory: event.target.value as CutListRecord["cabinetCategory"],
                      cabinetSubtype:
                        event.target.value === "Upper"
                          ? "Standard"
                          : event.target.value === "Base"
                            ? baseSubtypes.includes(current.cabinetSubtype)
                              ? current.cabinetSubtype
                              : "Standard"
                            : "Standard",
                    }))
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
                      setValue("cabinetSubtype", event.target.value as CutListRecord["cabinetSubtype"])
                    }
                  >
                    {subtypeOptions.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Auto-generated Code" required>
                <input value={values.code} onChange={(event) => setValue("code", event.target.value)} />
              </Field>
              <Field label="Item Name / Description">
                <input
                  value={values.itemName}
                  onChange={(event) => setValue("itemName", event.target.value)}
                  placeholder={`${area.areaName} cabinet`}
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
            <legend>Material Settings</legend>
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
                    <input value={values.customMaterialName} onChange={(event) => setValue("customMaterialName", event.target.value)} />
                  </Field>
                  <Field label={`Custom Material Thickness (${values.inputUnit})`} required>
                    <input type="number" step="0.001" value={values.customMaterialThickness} onChange={(event) => setValue("customMaterialThickness", event.target.value)} />
                  </Field>
                </>
              )}
              <Field label="Selected Thickness (in)">
                <input readOnly value={values.materialThickness} />
              </Field>
              <Field label={`Door Thickness (${values.inputUnit})`} required={values.cabinetCategory === "Base" || values.cabinetCategory === "Upper"}>
                <input type="number" step="0.001" value={values.doorThickness} onChange={(event) => setValue("doorThickness", event.target.value)} />
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
                <input readOnly value={bodyDepth} />
              </Field>
            </div>
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
                    <input type="number" min="0" step="1" value={values.shelfQty} onChange={(event) => setValue("shelfQty", event.target.value)} />
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
            <div className="live-summary-grid">
              {[
                ["Project", project.name],
                ["Area", area.areaName],
                ["Category", values.cabinetCategory],
                showSubtype ? ["Subtype", selectedSubtype] : null,
                ["Formula status", values.cabinetCategory === "Base" || values.cabinetCategory === "Upper" ? "Enabled" : "Not implemented yet"],
                ["Box depth", bodyDepth || "-"],
                showShelfFields ? ["Shelf qty", values.shelfQty || "0"] : null,
                showDrawerFields ? ["Drawer qty", values.drawerQty || "0"] : null,
                ["Material", isCustomMaterial ? values.customMaterialName || "Custom" : values.interiorMaterial],
              ].filter(Boolean).map((item) => {
                const [label, value] = item as string[];
                return (
                  <article className="summary-item" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                );
              })}
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
            <button className="primary-button" type="submit">
              Save Cabinet
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
