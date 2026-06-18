"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useAppState } from "@/app/context/app-state-context";
import { ModuleKey } from "@/lib/inventoryMock";
import { importTemplates } from "@/app/configs/import-config";
import BaseFlyout from "@/components/BaseFlyout";

export function ModuleImportModal({
  moduleKey,
}: {
  moduleKey: Exclude<ModuleKey, "dashboard">;
}) {
  const { runImport, setImportState } = useAppState();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<Array<Record<string, string>>>([]);
  const [error, setError] = useState("");

  const config = importTemplates[moduleKey];
  const previewCount = useMemo(() => Math.min(parsedRows.length, 3), [parsedRows.length]);

  const handleDownloadSample = () => {
    const csv = [
      config.headers.join(","),
      ...config.sampleRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = config.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCsv = (content: string) => {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return [];
    }

    const parseLine = (line: string) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const nextChar = line[index + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            index += 1;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }

        if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
          continue;
        }

        current += char;
      }

      values.push(current.trim());
      return values;
    };

    const headers = parseLine(lines[0]);
    return lines.slice(1).map((line) => {
      const values = parseLine(line);
      return headers.reduce<Record<string, string>>((accumulator, header, index) => {
        accumulator[header] = values[index] ?? "";
        return accumulator;
      }, {});
    });
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadedFileName(file.name);
    setError("");

    try {
      const content = await file.text();
      const rows = parseCsv(content);
      if (rows.length === 0) {
        setParsedRows([]);
        setError("The uploaded CSV is empty or only contains headers.");
        return;
      }
      setParsedRows(rows);
    } catch {
      setParsedRows([]);
      setError("Could not read the uploaded CSV file.");
    }
  };

  const handlePrimaryAction = () => {
    if (parsedRows.length === 0) {
      fileInputRef.current?.click();
      return;
    }

    runImport(moduleKey, parsedRows);
  };

  return (
    <BaseFlyout
      open={true}
      onClose={() => setImportState(null)}
      title={config.title}
      width={650}
      zIndex={1210}
    >
      <div className="import-flyout">
        <div className="import-callout">
          <div>
            <h3>{config.title}</h3>
            <p>{config.description}</p>
          </div>
          <button className="text-button" onClick={handleDownloadSample} type="button">
            Download Sample File
          </button>
        </div>

        <div className="import-section">
          <h4>Instructions</h4>
          <div className="import-instructions">
            {config.instructions.map((instruction, index) => (
              <div className="import-instruction-row" key={instruction}>
                <span>{index + 1}.</span>
                <p>{instruction}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="import-upload-box">
          <div className="import-upload-copy">
            <strong>Add or drop CSV file</strong>
            <p>Upload the updated sample file for this module.</p>
          </div>
          <label className="import-upload-button">
            Choose CSV
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              hidden
            />
          </label>
        </div>

        {uploadedFileName && (
          <div className="import-file-meta">
            <strong>{uploadedFileName}</strong>
            <span>{parsedRows.length} records ready to import</span>
          </div>
        )}

        {error && <div className="import-error">{error}</div>}

        {parsedRows.length > 0 && (
          <div className="import-preview">
            <h4>Preview</h4>
            {parsedRows.slice(0, previewCount).map((row, index) => (
              <pre key={`${uploadedFileName}-${index}`}>{JSON.stringify(row, null, 2)}</pre>
            ))}
          </div>
        )}

        <div className="flyout-footer">
          <button className="secondary-button" onClick={() => setImportState(null)} type="button">
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={handlePrimaryAction}
            type="button"
          >
            {parsedRows.length === 0 ? "Select CSV File" : "Import Records"}
          </button>
        </div>
      </div>
    </BaseFlyout>
  );
}
