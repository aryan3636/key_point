"use client";

import { FormEvent } from "react";
import { useAppState } from "@/app/context/app-state-context";
import {
  FormField,
  FormTextArea,
} from "@/app/(dashboard)/shared/components/form/FormFields";

export function ItemActionModal() {
  const { itemActionState, records, saveItemAction, setItemActionState } = useAppState();

  if (!itemActionState) {
    return null;
  }

  const item = records.items.find((entry) => entry.id === itemActionState.itemId);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    saveItemAction(Object.fromEntries(formData.entries()));
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-panel narrow" onSubmit={submit}>
        <div className="panel-header">
          <div>
            <h2>
              {itemActionState.action === "Issue"
                ? "Issue Material"
                : itemActionState.action === "Return"
                  ? "Return Material"
                  : itemActionState.action === "Waste"
                    ? "Log Waste"
                    : "Adjust Quantity"}
            </h2>
            <p>{item?.title}</p>
          </div>
          <button className="text-button" onClick={() => setItemActionState(null)} type="button">
            Close
          </button>
        </div>
        <FormField
          name="qty"
          label={itemActionState.action === "Adjust" ? "New stock qty" : "Quantity"}
          type="number"
          defaultValue="1"
        />
        <FormField
          name="target"
          label={itemActionState.action === "Issue" ? "Project or worker" : "Reference"}
          defaultValue=""
        />
        <FormTextArea name="note" label="Note" defaultValue="" />
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={() => setItemActionState(null)}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            Save Action
          </button>
        </div>
      </form>
    </div>
  );
}
