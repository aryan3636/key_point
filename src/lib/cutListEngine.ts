import { CutListRecord, ProjectRecord } from "@/lib/inventoryMock";

export type CutListPartRow = {
  sourceCabinetId: string;
  code: string;
  projectName: string;
  sourceItemName: string;
  partName: string;
  width: number | string;
  heightDepth: number | string;
  thickness: number | string;
  edgeBanding: string;
  material: string;
  quantity: number | string;
  finish: string;
  notes: string;
  sourceItems?: string;
};

const PRODUCTION_PART_ORDER = [
  "Back",
  "Back Rail",
  "Gable",
  "Bottom",
  "Top & Bottom",
  "Stretcher",
  "Fixed Shelf",
  "Adjustable Shelf - Pins",
  "Adjustable Shelf - Pilasters",
  "Drawer Side",
  "Drawer Bottom",
  "Drawer Front & Back",
  "Drawer Parts",
];

const UPPER_BOTTOM_CONDITION_FINISHED: CutListRecord["upperBottomCondition"] = "Finished Bottom";
const UPPER_BOTTOM_CONDITION_LIGHT_VALANCE: CutListRecord["upperBottomCondition"] = "Light Valance";
const DRAWER_BOX_WIDTH_CLEARANCE = 1.0625;
const DRAWER_SIDE_HEIGHT_DEDUCTION = 2;
const DRAWER_FRONT_BACK_UNDERMOUNT_DEDUCTION = 0.5;

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function round(value: unknown, increment = 0.001) {
  const number = toNumber(value);
  return Math.round((number + Number.EPSILON) / increment) * increment;
}

function roundToSixteenth(value: unknown) {
  return round(value, 1 / 16);
}

function normalizeFinish(value: string) {
  return value.trim().toUpperCase() || "-";
}

function calculateBoxDepth(cabinet: CutListRecord, roundedDepth = roundToSixteenth(cabinet.depth)) {
  const doorDeduction =
    cabinet.finishedSides === "Front and Back"
      ? cabinet.doorThickness * 2
      : cabinet.doorThickness;
  return round(roundedDepth - doorDeduction - cabinet.bumperAllowance);
}

function getUpperBottomDeduction(cabinet: CutListRecord) {
  if (cabinet.upperBottomCondition === UPPER_BOTTOM_CONDITION_FINISHED) {
    return toNumber(cabinet.finishedMaterialThicknessM2);
  }
  if (cabinet.upperBottomCondition === UPPER_BOTTOM_CONDITION_LIGHT_VALANCE) {
    return toNumber(cabinet.lightValanceHeight);
  }
  return 0;
}

function getUpperBottomConditionNote(cabinet: CutListRecord) {
  if (cabinet.upperBottomCondition === UPPER_BOTTOM_CONDITION_FINISHED) {
    return "Finished bottom layer calculated later with exposed surfaces.";
  }
  if (cabinet.upperBottomCondition === UPPER_BOTTOM_CONDITION_LIGHT_VALANCE) {
    return "Light valance piece calculated later with exposed surfaces.";
  }
  return "-";
}

function calculateUpperBoxDepth(
  cabinet: CutListRecord,
  roundedDepth = roundToSixteenth(cabinet.depth)
) {
  return round(roundedDepth - cabinet.doorThickness - cabinet.bumperAllowance);
}

function calculateUpperBoxHeight(
  cabinet: CutListRecord,
  roundedHeight = roundToSixteenth(cabinet.height)
) {
  return round(roundedHeight - getUpperBottomDeduction(cabinet));
}

function calculateShelfWidth(cabinet: CutListRecord, roundedWidth = roundToSixteenth(cabinet.width)) {
  const clearances: Record<CutListRecord["shelfType"], number> = {
    "Fixed Shelf": 0,
    "Adjustable Shelf - Pins": 0.125,
    "Adjustable Shelf - Pilasters": 0.5,
  };
  return round(roundedWidth - cabinet.materialThickness * 2 - clearances[cabinet.shelfType]);
}

function calculateShelfDepth(cabinet: CutListRecord, boxDepth: number) {
  return round(boxDepth - (cabinet.shelfType === "Fixed Shelf" ? 1 : 2));
}

function calculateStretcherWidth(depth: number) {
  if (depth <= 24) {
    return 3;
  }
  return round(3 + Math.ceil((depth - 24) / 2) * 0.5);
}

function oneEdgeBanding(longCandidate: number, shortCandidate: number) {
  return longCandidate >= shortCandidate ? "1L" : "1S";
}

function getDrawerEdgeBanding(partName: string) {
  const normalized = partName.trim().toLowerCase();
  if (normalized.includes("bottom")) {
    return "None";
  }
  return "1L";
}

function getCabinetMaterial(cabinet: CutListRecord) {
  return cabinet.customMaterialName || cabinet.interiorMaterial;
}

export function getCutListValidationMessage(cabinet: CutListRecord) {
  if (cabinet.cabinetCategory !== "Base" && cabinet.cabinetCategory !== "Upper") {
    return "Cut list formula not implemented yet.";
  }
  if (!cabinet.width) return "Width required.";
  if (!cabinet.height) return "Height required.";
  if (!cabinet.depth) return "Full cabinet depth required.";
  if (!cabinet.interiorMaterial) return "Interior material required.";
  if (!cabinet.materialThickness) return "Material thickness required.";
  if (!cabinet.doorThickness) return "Door thickness required for body depth.";
  if (!cabinet.bumperAllowance) return "Bumper allowance required.";
  if (!cabinet.quantity) return "Quantity is required.";
  if (calculateBoxDepth(cabinet) <= 0) {
    return "Invalid depth: full depth, door thickness, and bumper create zero or negative box depth.";
  }

  if (cabinet.cabinetCategory === "Upper") {
    if (
      cabinet.upperBottomCondition === UPPER_BOTTOM_CONDITION_FINISHED &&
      !cabinet.finishedMaterialThicknessM2
    ) {
      return "Finished material thickness M2 required.";
    }
    if (
      cabinet.upperBottomCondition === UPPER_BOTTOM_CONDITION_LIGHT_VALANCE &&
      !cabinet.lightValanceHeight
    ) {
      return "Light valance height LV required.";
    }
    if (calculateUpperBoxHeight(cabinet) <= 0) {
      return "Invalid upper height: bottom condition creates zero or negative upper box height.";
    }
  }

  if (cabinet.cabinetSubtype === "Shelves") {
    if (!cabinet.shelfQty) return "Shelf quantity required.";
    if (!cabinet.shelfType) return "Shelf type required.";
  }

  if (cabinet.cabinetSubtype === "Drawer") {
    if (!cabinet.slideType) return "Slide type required.";
    if (!cabinet.slideLength) return "Slide length required.";
    if (!cabinet.drawerQty) return "Drawer quantity required.";
    if (
      cabinet.drawerHeights.length !== cabinet.drawerQty ||
      cabinet.drawerHeights.some((height) => !height)
    ) {
      return "Enter height for every drawer.";
    }
  }

  return "";
}

function makeRow(
  cabinet: CutListRecord,
  projectName: string,
  part: Omit<CutListPartRow, "sourceCabinetId" | "code" | "projectName" | "sourceItemName">
): CutListPartRow {
  return {
    sourceCabinetId: cabinet.id,
    code: cabinet.code,
    projectName,
    sourceItemName: cabinet.itemName,
    ...part,
    width: roundDimension(part.width),
    heightDepth: roundDimension(part.heightDepth),
    thickness: roundDimension(part.thickness),
  };
}

function roundDimension(value: number | string) {
  if (typeof value === "string") {
    return value;
  }
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

function sourceLabel(row: CutListPartRow) {
  return [row.code, row.sourceItemName].filter(Boolean).join(" - ");
}

function normalizeProductionPartName(partName: string) {
  const normalized = partName.trim().toUpperCase();
  if (normalized.includes("BACK RAIL")) return "Back Rail";
  if (normalized === "BACK") return "Back";
  if (normalized === "GABLE" || normalized === "GABLES") return "Gable";
  if (normalized === "BOTTOM") return "Bottom";
  if (normalized === "TOP & BOTTOM") return "Top & Bottom";
  if (normalized.includes("STRETCHER")) return "Stretcher";
  if (normalized === "FIXED SHELF") return "Fixed Shelf";
  if (normalized === "ADJUSTABLE SHELF - PINS") return "Adjustable Shelf - Pins";
  if (normalized === "ADJUSTABLE SHELF - PILASTERS") return "Adjustable Shelf - Pilasters";
  if (normalized.includes("DRAWER") && normalized.includes("FRONT & BACK")) return "Drawer Front & Back";
  if (normalized.includes("DRAWER") && normalized.includes("BOTTOM")) return "Drawer Bottom";
  if (normalized.includes("DRAWER") && normalized.includes("SIDE")) return "Drawer Side";
  if (normalized.includes("DRAWER")) return "Drawer Parts";
  return partName || "Other";
}

export function generateCabinetCutListRows(
  cabinet: CutListRecord,
  projects: ProjectRecord[]
): CutListPartRow[] {
  if (getCutListValidationMessage(cabinet)) {
    return [];
  }

  const projectName =
    projects.find((project) => project.id === cabinet.projectId)?.name ?? "No project";
  if (cabinet.cabinetCategory !== "Base" && cabinet.cabinetCategory !== "Upper") {
    return [];
  }

  const quantity = cabinet.quantity || 1;
  const width = roundToSixteenth(cabinet.width);
  const height = roundToSixteenth(cabinet.height);
  const depth = roundToSixteenth(cabinet.depth);
  const insideWidth = width - cabinet.materialThickness * 2;
  const backInsideWidth = cabinet.width - cabinet.materialThickness * 2;
  const boxDepth = calculateBoxDepth(cabinet, depth);
  const material = getCabinetMaterial(cabinet);
  const rows: CutListPartRow[] = [];

  if (cabinet.cabinetCategory === "Upper") {
    if (!["Standard", "Shelves"].includes(cabinet.cabinetSubtype)) {
      return [];
    }
    if (
      cabinet.upperBottomCondition === UPPER_BOTTOM_CONDITION_FINISHED &&
      !toNumber(cabinet.finishedMaterialThicknessM2)
    ) {
      return [];
    }
    if (
      cabinet.upperBottomCondition === UPPER_BOTTOM_CONDITION_LIGHT_VALANCE &&
      !toNumber(cabinet.lightValanceHeight)
    ) {
      return [];
    }

    const upperBoxDepth = calculateUpperBoxDepth(cabinet, depth);
    const upperBoxHeight = calculateUpperBoxHeight(cabinet, height);

    rows.push(
      makeRow(cabinet, projectName, {
        partName: "BACK",
        width: insideWidth,
        heightDepth: upperBoxHeight - cabinet.materialThickness * 2,
        thickness: cabinet.materialThickness,
        edgeBanding: "None",
        material,
        quantity,
        finish: "-",
        notes: "-",
      }),
      makeRow(cabinet, projectName, {
        partName: "GABLES",
        width: upperBoxDepth,
        heightDepth: upperBoxHeight,
        thickness: cabinet.materialThickness,
        edgeBanding: oneEdgeBanding(upperBoxHeight, upperBoxDepth),
        material,
        quantity: 2 * quantity,
        finish: material,
        notes: "MATCHING",
      }),
      makeRow(cabinet, projectName, {
        partName: "TOP & BOTTOM",
        width: insideWidth,
        heightDepth: upperBoxDepth,
        thickness: cabinet.materialThickness,
        edgeBanding: "1L",
        material,
        quantity: 2 * quantity,
        finish: material,
        notes: getUpperBottomConditionNote(cabinet),
      })
    );

    if (cabinet.cabinetSubtype === "Shelves" && cabinet.shelfQty > 0) {
      rows.push(
        makeRow(cabinet, projectName, {
          partName: cabinet.shelfType,
          width: calculateShelfWidth(cabinet, width),
          heightDepth: calculateShelfDepth(cabinet, upperBoxDepth),
          thickness: cabinet.materialThickness,
          edgeBanding: "2S2L",
          material,
          quantity: cabinet.shelfQty * quantity,
          finish: normalizeFinish(cabinet.shelfFinish),
          notes: "-",
        })
      );
    }

    return rows;
  }

  if (cabinet.backOption === "noBack") {
    rows.push(
      makeRow(cabinet, projectName, {
        partName: "BACK RAIL",
        width: backInsideWidth,
        heightDepth: 3,
        thickness: cabinet.materialThickness,
        edgeBanding: "1L",
        material,
        quantity: 2 * quantity,
        finish: "-",
        notes: "-",
      })
    );
  } else {
    rows.push(
      makeRow(cabinet, projectName, {
        partName: "BACK",
        width: backInsideWidth,
        heightDepth: cabinet.height - cabinet.materialThickness,
        thickness: cabinet.materialThickness,
        edgeBanding: "None",
        material,
        quantity,
        finish: "-",
        notes: "-",
      })
    );
  }

  rows.push(
    makeRow(cabinet, projectName, {
      partName: "GABLES",
      width: boxDepth,
      heightDepth: height,
      thickness: cabinet.materialThickness,
      edgeBanding: oneEdgeBanding(height, boxDepth),
      material,
      quantity: 2 * quantity,
      finish: material,
      notes: "MATCHING",
    }),
    makeRow(cabinet, projectName, {
      partName: "BOTTOM",
      width: insideWidth,
      heightDepth: boxDepth,
      thickness: cabinet.materialThickness,
      edgeBanding: "1L",
      material,
      quantity,
      finish: material,
      notes: "MATCHING",
    }),
    makeRow(cabinet, projectName, {
      partName: "STRETCHER",
      width: calculateStretcherWidth(depth),
      heightDepth: insideWidth,
      thickness: cabinet.materialThickness,
      edgeBanding: "1L",
      material,
      quantity: 2 * quantity,
      finish: material,
      notes: normalizeFinish(material),
    })
  );

  if (cabinet.cabinetUse === "shelvingCabinet" && cabinet.shelfQty > 0) {
    rows.push(
      makeRow(cabinet, projectName, {
        partName: cabinet.shelfType,
        width: calculateShelfWidth(cabinet, width),
        heightDepth: calculateShelfDepth(cabinet, boxDepth),
        thickness: cabinet.materialThickness,
        edgeBanding: "2S2L",
        material,
        quantity: cabinet.shelfQty * quantity,
        finish: normalizeFinish(cabinet.shelfFinish),
        notes: "-",
      })
    );
  }

  if (cabinet.cabinetUse === "drawerBank" && cabinet.drawerQty > 0 && cabinet.slideLength > 0) {
    const drawerPartWidth = insideWidth - DRAWER_BOX_WIDTH_CLEARANCE;
    const frontBackSlideDeduction =
      cabinet.slideType === "undermount" ? DRAWER_FRONT_BACK_UNDERMOUNT_DEDUCTION : 0;
    const drawerHeights = Array.isArray(cabinet.drawerHeights)
      ? cabinet.drawerHeights.slice(0, cabinet.drawerQty)
      : [];

    drawerHeights.forEach((drawerHeight, index) => {
      if (!drawerHeight || drawerHeight <= 0) {
        return;
      }

      const drawerNumber = index + 1;
      const note = `Drawer ${drawerNumber}`;
      rows.push(
        makeRow(cabinet, projectName, {
          partName: `Drawer ${drawerNumber} Side`,
          width: cabinet.slideLength,
          heightDepth: drawerHeight - DRAWER_SIDE_HEIGHT_DEDUCTION,
          thickness: cabinet.materialThickness,
          edgeBanding: getDrawerEdgeBanding("Drawer Side"),
          material,
          quantity: 2 * quantity,
          finish: material,
          notes: note,
        }),
        makeRow(cabinet, projectName, {
          partName: `Drawer ${drawerNumber} Bottom`,
          width: cabinet.slideLength,
          heightDepth: drawerPartWidth,
          thickness: cabinet.materialThickness,
          edgeBanding: getDrawerEdgeBanding("Drawer Bottom"),
          material,
          quantity,
          finish: material,
          notes: note,
        }),
        makeRow(cabinet, projectName, {
          partName: `Drawer ${drawerNumber} Front & Back`,
          width: drawerPartWidth,
          heightDepth:
            drawerHeight -
            DRAWER_SIDE_HEIGHT_DEDUCTION -
            cabinet.materialThickness -
            frontBackSlideDeduction,
          thickness: cabinet.materialThickness,
          edgeBanding: getDrawerEdgeBanding("Drawer Front & Back"),
          material,
          quantity: 2 * quantity,
          finish: material,
          notes: note,
        })
      );
    });
  }

  return rows;
}

export function generateAllCabinetRows(cabinets: CutListRecord[], projects: ProjectRecord[]) {
  if (cabinets.some((cabinet) => getCutListValidationMessage(cabinet))) {
    return [];
  }
  return cabinets.flatMap((cabinet) => generateCabinetCutListRows(cabinet, projects));
}

export function groupRowsByCabinet(rows: CutListPartRow[]) {
  const groups = new Map<string, CutListPartRow[]>();
  rows.forEach((row) => {
    const key = `${row.code} - ${row.sourceItemName}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });
  return Array.from(groups.entries()).map(([label, groupRows]) => ({ label, rows: groupRows }));
}

export function getGroupedProductionRows(rows: CutListPartRow[]) {
  const grouped = new Map<string, CutListPartRow & { sourceItemsList: string[]; notesList: string[] }>();

  rows.forEach((row) => {
    const partName = normalizeProductionPartName(row.partName);
    const key = [
      partName,
      row.width,
      row.heightDepth,
      row.thickness,
      row.material,
      row.edgeBanding,
    ].join("__");
    const existing = grouped.get(key);
    const rowQty = toNumber(row.quantity, Number.NaN);

    if (!existing) {
      grouped.set(key, {
        ...row,
        partName,
        quantity: Number.isFinite(rowQty) ? rowQty : row.quantity,
        sourceItemsList: [sourceLabel(row)],
        notesList: row.notes && row.notes !== "-" ? [row.notes] : [],
      });
      return;
    }

    const currentQty = toNumber(existing.quantity, Number.NaN);
    existing.quantity =
      Number.isFinite(currentQty) && Number.isFinite(rowQty)
        ? roundDimension(currentQty + rowQty)
        : existing.quantity;
    if (!existing.sourceItemsList.includes(sourceLabel(row))) {
      existing.sourceItemsList.push(sourceLabel(row));
    }
    if (row.notes && row.notes !== "-" && !existing.notesList.includes(row.notes)) {
      existing.notesList.push(row.notes);
    }
  });

  return Array.from(grouped.values())
    .map(({ sourceItemsList, notesList, ...row }) => ({
      ...row,
      sourceItems: sourceItemsList.join(", "),
      notes: notesList.join("; ") || "-",
    }))
    .sort((a, b) => {
      const orderA = PRODUCTION_PART_ORDER.indexOf(a.partName);
      const orderB = PRODUCTION_PART_ORDER.indexOf(b.partName);
      const partOrderA = orderA === -1 ? PRODUCTION_PART_ORDER.length : orderA;
      const partOrderB = orderB === -1 ? PRODUCTION_PART_ORDER.length : orderB;
      return (
        partOrderA - partOrderB ||
        String(a.partName).localeCompare(String(b.partName)) ||
        toNumber(a.width) - toNumber(b.width) ||
        toNumber(a.heightDepth) - toNumber(b.heightDepth)
      );
    });
}

function getProductionFamilyName(partName: string) {
  if (partName === "Back" || partName === "Back Rail") return "Back / Back Rail";
  if (partName === "Gable") return "Gables";
  if (partName === "Top & Bottom" || partName === "Bottom") return "Bottom";
  if (partName === "Stretcher") return "Stretchers";
  if (
    ["Fixed Shelf", "Adjustable Shelf - Pins", "Adjustable Shelf - Pilasters"].includes(partName)
  ) {
    return "Shelves";
  }
  if (["Drawer Side", "Drawer Bottom", "Drawer Front & Back"].includes(partName)) {
    return "Drawer Parts";
  }
  return "Other";
}

const PRODUCTION_FAMILY_ORDER = [
  "Back / Back Rail",
  "Gables",
  "Bottom",
  "Stretchers",
  "Shelves",
  "Drawer Parts",
  "Other",
];

export function groupProductionRowsByFamily(rows: CutListPartRow[]) {
  const groups = new Map<string, CutListPartRow[]>();

  rows.forEach((row) => {
    const familyName = getProductionFamilyName(row.partName);
    groups.set(familyName, [...(groups.get(familyName) ?? []), row]);
  });

  return Array.from(groups.entries())
    .map(([familyName, groupRows]) => ({
      familyName,
      rows: groupRows,
      totalQuantity: groupRows.reduce((total, row) => {
        const quantity = Number(row.quantity);
        return Number.isFinite(quantity) ? total + quantity : total;
      }, 0),
    }))
    .sort((a, b) => {
      const orderA = PRODUCTION_FAMILY_ORDER.indexOf(a.familyName);
      const orderB = PRODUCTION_FAMILY_ORDER.indexOf(b.familyName);
      return (
        (orderA === -1 ? PRODUCTION_FAMILY_ORDER.length : orderA) -
          (orderB === -1 ? PRODUCTION_FAMILY_ORDER.length : orderB) ||
        a.familyName.localeCompare(b.familyName)
      );
    });
}
