"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import BaseFlyout from "@/components/BaseFlyout";
import { useAppState } from "@/app/context/app-state-context";
import { generateNextNumber, PurchaseOrderRecord, ReceiptRecord } from "@/lib/inventoryMock";
import {
  FormField,
  FormSelectField,
  FormTextArea,
} from "@/app/(dashboard)/shared/components/form/FormFields";

type ReceiveLineState = ReceiptRecord["lines"][number];

export function ReceivePurchaseOrderFlyout() {
  const { receiveState, records, receivePurchaseOrder, setReceiveState } = useAppState();

  const po = useMemo(
    () => records.purchaseOrders.find((entry) => entry.id === receiveState?.poId),
    [receiveState?.poId, records.purchaseOrders]
  );

  const receiptNo = useMemo(
    () =>
      generateNextNumber(
        "RCV",
        records.receiving.map((receipt) => receipt.receiptNo)
      ),
    [records.receiving]
  );

  if (!receiveState || !po) {
    return null;
  }

  return (
    <ReceivePurchaseOrderForm
      key={po.id}
      po={po}
      receiptNo={receiptNo}
      onClose={() => setReceiveState(null)}
      onSave={receivePurchaseOrder}
    />
  );
}

function ReceivePurchaseOrderForm({
  po,
  receiptNo,
  onClose,
  onSave,
}: {
  po: PurchaseOrderRecord;
  receiptNo: string;
  onClose: () => void;
  onSave: (values: Record<string, FormDataEntryValue>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [packingSlipImage, setPackingSlipImage] = useState("");
  const [error, setError] = useState("");
  const [lines, setLines] = useState<ReceiveLineState[]>(
    po.lines.map((line) => ({
      sku: line.sku,
      orderedQty: line.qty,
      receivedQty: line.qty,
      qtyOnPackingSlip: 0,
      damagedQty: 0,
    }))
  );

  const isShortShipped = lines.some((line) => line.receivedQty < line.orderedQty);

  const updateLine = (
    index: number,
    key: "receivedQty" | "qtyOnPackingSlip" | "damagedQty",
    value: string
  ) => {
    setLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [key]: Number(value) } : line
      )
    );
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to load file"));
      reader.readAsDataURL(file);
    });

    setPackingSlipImage(dataUrl);
    setError("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isShortShipped) {
      const invalidSlipQty = lines.some(
        (line) => line.receivedQty < line.orderedQty && line.qtyOnPackingSlip <= 0
      );
      if (invalidSlipQty) {
        setError("Qty on packing slip is required for every short-shipped line.");
        return;
      }
      if (!packingSlipImage) {
        setError("Attach the packing slip photo before receiving a short-shipped order.");
        return;
      }
    }

    setError("");
    const formData = new FormData(event.currentTarget);
    onSave(Object.fromEntries(formData.entries()));
  };

  return (
    <BaseFlyout
      open={true}
      onClose={onClose}
      title={`Receive ${po.number}`}
      width={880}
    >
      <form className="flyout-form" onSubmit={submit}>
        <div className="form-grid">
          <FormField name="receiptNo" label="Receipt No" defaultValue={receiptNo} readOnly />
          <FormSelectField
            name="receivedLocation"
            label="Received Location"
            defaultValue="Warehouse"
            options={[
              { value: "Warehouse", label: "Warehouse" },
              { value: "Site", label: "Site" },
            ]}
          />
          <FormField name="receivedBy" label="Received By" defaultValue="Receiving Team" />
          <FormField
            name="date"
            label="Received Date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            readOnly
          />
          <input type="hidden" name="packingSlipImage" value={packingSlipImage} readOnly />
          <input type="hidden" name="lines" value={JSON.stringify(lines)} readOnly />
        </div>

        <section className="upload-card">
          <div>
            <h3>Packing Slip</h3>
            <p>
              Upload only when the shipment is short. Full receipts can be completed without a slip.
            </p>
          </div>
          <div className="upload-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileUpload}
            />
          </div>
          {packingSlipImage && (
            <div className="image-preview-shell">
              <Image
                className="image-preview"
                src={packingSlipImage}
                alt="Packing slip preview"
                width={1200}
                height={900}
                unoptimized
              />
            </div>
          )}
        </section>

        <section className="po-lines-section">
          <div className="po-lines-header">
            <h3>PO Lines To Receive</h3>
            <p>Short shipments require both packing-slip quantity and a photo attachment.</p>
          </div>
          <div className="po-lines-table">
            <div className="po-lines-row receive-lines-grid po-lines-row-header">
              <span>SKU</span>
              <span>Description</span>
              <span>Ordered</span>
              <span>Receive Qty</span>
              <span>Qty On Packing Slip</span>
              <span>Damaged Qty</span>
            </div>
            {po.lines.map((line, index) => (
              <div className="po-lines-row receive-lines-grid wide" key={`${po.id}-${line.sku}-${index}`}>
                <span>{line.sku}</span>
                <span>{line.description}</span>
                <span>{line.qty}</span>
                <input
                  aria-label={`Received quantity for ${line.sku}`}
                  type="number"
                  min="0"
                  max={line.qty}
                  value={lines[index]?.receivedQty ?? line.qty}
                  onChange={(event) => updateLine(index, "receivedQty", event.target.value)}
                />
                <input
                  aria-label={`Packing slip quantity for ${line.sku}`}
                  type="number"
                  min="0"
                  value={lines[index]?.qtyOnPackingSlip ?? 0}
                  onChange={(event) =>
                    updateLine(index, "qtyOnPackingSlip", event.target.value)
                  }
                />
                <input
                  aria-label={`Damaged quantity for ${line.sku}`}
                  type="number"
                  min="0"
                  max={lines[index]?.receivedQty ?? line.qty}
                  value={lines[index]?.damagedQty ?? 0}
                  onChange={(event) => updateLine(index, "damagedQty", event.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        <FormTextArea name="notes" label="Receiving Notes" defaultValue="" />

        {error && <p className="form-error">{error}</p>}

        <div className="flyout-footer">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            Save Receipt
          </button>
        </div>
      </form>
    </BaseFlyout>
  );
}
