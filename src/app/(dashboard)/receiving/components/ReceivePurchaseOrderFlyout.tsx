"use client";

import { FormEvent, useState } from "react";
import BaseFlyout from "@/components/BaseFlyout";
import { useAppState } from "@/app/context/app-state-context";
import {
  FormField,
  FormSelectField,
  FormTextArea,
} from "@/app/(dashboard)/shared/components/form/FormFields";

export function ReceivePurchaseOrderFlyout() {
  const { receiveState, records, receivePurchaseOrder, setReceiveState } = useAppState();
  const [receiptNo] = useState(() => `RCV-${Math.floor(Date.now() / 1000)}`);

  if (!receiveState) {
    return null;
  }

  const po = records.purchaseOrders.find((entry) => entry.id === receiveState.poId);
  if (!po) {
    return null;
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    receivePurchaseOrder(Object.fromEntries(formData.entries()));
  };

  return (
    <BaseFlyout
      open={!!receiveState}
      onClose={() => setReceiveState(null)}
      title={`Receive ${po.number}`}
      width={760}
    >
      <form className="flyout-form" onSubmit={submit}>
        <div className="form-grid">
          <FormField
            name="receiptNo"
            label="Receipt No"
            defaultValue={receiptNo}
          />
          <FormSelectField
            name="locationId"
            label="Received Location"
            defaultValue={records.locations[0]?.id ?? ""}
            options={records.locations.map((location) => ({
              value: location.id,
              label: location.name,
            }))}
          />
          <FormField name="receivedBy" label="Received By" defaultValue="Receiving Team" />
          <FormField name="packingSlip" label="Packing Slip" defaultValue="" />
          <FormField
            name="date"
            label="Received Date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
          <FormField name="status" label="Receipt Status" defaultValue="Received" />
        </div>

        <section className="po-lines-section">
          <div className="po-lines-header">
            <h3>PO Lines To Receive</h3>
            <p>Enter received quantity for each PO line. Partial receipts are allowed.</p>
          </div>
          <div className="po-lines-table">
            <div className="po-lines-row po-lines-row-header receive-lines-grid">
              <span>Item</span>
              <span>Ordered</span>
              <span>Unit Price</span>
              <span>Receive Qty</span>
            </div>
            {po.lines.map((line, index) => {
              const item = records.items.find((entry) => entry.id === line.itemId);
              return (
                <div className="po-lines-row receive-lines-grid" key={`${po.id}-${line.itemId}-${index}`}>
                  <span>{item?.title ?? line.itemId}</span>
                  <span>{line.qty}</span>
                  <span>{line.rate}</span>
                  <input
                    name={`receivedQty-${index}`}
                    type="number"
                    min="0"
                    max={line.qty}
                    defaultValue={line.qty}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <FormTextArea name="notes" label="Receiving Notes" defaultValue="" />

        <div className="flyout-footer">
          <button className="secondary-button" type="button" onClick={() => setReceiveState(null)}>
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
