/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const htmlRoot = path.resolve(root, "../millwork-job-sheet-v3");

function loadHtmlEngine() {
  const context = {
    console: { log() {}, error: console.error },
    crypto: { randomUUID: () => "test-id" },
    localStorage: {
      getItem: () => null,
      setItem() {},
      removeItem() {},
    },
  };
  context.window = context;
  vm.createContext(context);

  ["data.js", "formula-engine.js", "cut-list.js"].forEach((filename) => {
    vm.runInContext(fs.readFileSync(path.join(htmlRoot, "js", filename), "utf8"), context);
  });
  vm.runInContext(
    "globalThis.parityApi = { normalizeCabinetRow, generateCutListRowsForCabinet };",
    context
  );
  return context.parityApi;
}

function loadReactEngine() {
  const filename = path.join(root, "src/lib/cutListEngine.ts");
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(output, {
    module: compiledModule,
    exports: compiledModule.exports,
    require,
  });
  return compiledModule.exports;
}

const base = {
  id: "cabinet-1",
  projectId: "project-1",
  areaId: "area-1",
  code: "B1",
  itemName: "Parity cabinet",
  cabinetCategory: "Base",
  cabinetSubtype: "Standard",
  cabinetUse: "standardBaseCabinet",
  inputUnit: "in",
  width: 30.3,
  height: 34.53,
  depth: 24,
  quantity: 2,
  interiorMaterial: "5/8 White Melamine",
  customMaterialName: "",
  customMaterialThickness: 0,
  materialThickness: 0.625,
  doorThickness: 0.75,
  bumperAllowance: 0.125,
  finishedSides: "Front",
  upperBottomCondition: "Regular / Visible Bottom",
  finishedMaterialThicknessM2: 0,
  lightValanceHeight: 0,
  backOption: "fullBack",
  shelfQty: 0,
  shelfType: "Fixed Shelf",
  shelfFinish: "White",
  slideType: "",
  slideLength: 0,
  drawerQty: 0,
  drawerHeights: [],
  status: "Ready",
  notes: "Parity cabinet",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const cases = [
  { name: "base-standard", cabinet: base },
  {
    name: "base-shelves",
    cabinet: {
      ...base,
      code: "B2",
      cabinetSubtype: "Shelves",
      cabinetUse: "shelvingCabinet",
      shelfQty: 2,
      shelfType: "Adjustable Shelf - Pins",
      shelfFinish: "Black",
    },
  },
  {
    name: "base-drawer",
    cabinet: {
      ...base,
      code: "D1",
      cabinetSubtype: "Drawer",
      cabinetUse: "drawerBank",
      slideType: "undermount",
      slideLength: 21.625,
      drawerQty: 2,
      drawerHeights: [7.5, 12.5],
    },
  },
  {
    name: "base-sink-open-back",
    cabinet: {
      ...base,
      code: "S1",
      cabinetSubtype: "Sink",
      cabinetUse: "sinkCabinet",
      backOption: "noBack",
    },
  },
  {
    name: "upper-standard",
    cabinet: {
      ...base,
      code: "U1",
      cabinetCategory: "Upper",
      cabinetSubtype: "Standard",
      cabinetUse: "upperStandardCabinet",
      height: 40,
      depth: 14,
    },
  },
  {
    name: "upper-shelves-valance",
    cabinet: {
      ...base,
      code: "U2",
      cabinetCategory: "Upper",
      cabinetSubtype: "Shelves",
      cabinetUse: "upperShelvingCabinet",
      height: 40,
      depth: 14,
      upperBottomCondition: "Light Valance",
      lightValanceHeight: 2,
      shelfQty: 2,
      shelfType: "Fixed Shelf",
      shelfFinish: "Matching",
    },
  },
  {
    name: "base-front-and-back-custom",
    cabinet: {
      ...base,
      code: "B3",
      interiorMaterial: "Custom",
      customMaterialName: "Walnut Veneer",
      customMaterialThickness: 0.75,
      materialThickness: 0.75,
      finishedSides: "Front and Back",
    },
  },
  {
    name: "unsupported-tall",
    cabinet: {
      ...base,
      code: "T1",
      cabinetCategory: "Tower / Tall",
      cabinetSubtype: "Standard",
      cabinetUse: "unsupportedCabinet",
    },
  },
  {
    name: "unsupported-open",
    cabinet: {
      ...base,
      code: "O1",
      cabinetCategory: "Open",
      cabinetSubtype: "Standard",
      cabinetUse: "unsupportedCabinet",
    },
  },
];

function comparable(row) {
  return {
    partName: row.partName,
    width: row.width,
    heightDepth: row.heightDepth,
    thickness: row.thickness,
    edgeBanding: row.edgeBanding,
    material: row.material,
    quantity: row.quantity,
    finish: row.finish,
    notes: row.notes,
  };
}

const html = loadHtmlEngine();
const react = loadReactEngine();
let failures = 0;

cases.forEach(({ name, cabinet }) => {
  const htmlRows = Array.from(
    html.generateCutListRowsForCabinet(html.normalizeCabinetRow(cabinet)),
    comparable
  );
  const reactRows = Array.from(
    react.generateCabinetCutListRows(cabinet, [{ id: cabinet.projectId, name: "Parity" }]),
    comparable
  );
  const htmlJson = JSON.stringify(htmlRows);
  const reactJson = JSON.stringify(reactRows);

  if (htmlJson !== reactJson) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error("HTML ", htmlJson);
    console.error("React", reactJson);
  } else {
    console.log(`PASS ${name} (${reactRows.length} rows)`);
  }
});

if (failures) {
  process.exitCode = 1;
} else {
  console.log(`All ${cases.length} HTML/React cut-list parity cases passed.`);
}
