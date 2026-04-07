"use client";

import { useMemo } from "react";
import { useAppState } from "@/app/context/app-state-context";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardView() {
  const { records, setActiveModule } = useAppState();

  const stats = useMemo(() => {
    const lowStock = records.items.filter((item) => item.stock <= item.reorderLevel);
    const openPOs = records.purchaseOrders.filter((po) => po.status !== "Closed");
    const assignedQty = records.items.reduce(
      (total, item) => total + item.assignedQty,
      0
    );
    const stockValue = records.purchaseOrders.reduce((total, po) => {
      const poValue = po.lines.reduce((sum, line) => sum + line.qty * line.rate, 0);
      return total + poValue;
    }, 0);

    return [
      { label: "Items in stock", value: String(records.items.length), meta: "Tracked SKUs" },
      { label: "Assigned material", value: String(assignedQty), meta: "Issued to teams and projects" },
      { label: "Low stock items", value: String(lowStock.length), meta: "Need reorder attention" },
      { label: "Open PO value", value: formatCurrency(stockValue), meta: `${openPOs.length} active purchase orders` },
    ];
  }, [records]);

  const lowStock = records.items.filter((item) => item.stock <= item.reorderLevel);
  const openPOs = records.purchaseOrders.filter((po) => po.status !== "Closed");

  return (
    <section className="dashboard-grid">
      <div className="card-grid">
        {stats.map((card) => (
          <article className="stat-card" key={card.label}>
            <small>{card.label}</small>
            <strong>{card.value}</strong>
            <span>{card.meta}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-panels">
        <DashboardPanel
          title="Recent receipts"
          actionLabel="Open receiving"
          onAction={() => setActiveModule("receiving")}
          rows={records.receiving.slice(0, 4).map((receipt) => [
            receipt.receiptNo,
            receipt.status,
            formatDate(receipt.date),
          ])}
        />
        <DashboardPanel
          title="Recent item movements"
          actionLabel="Open items"
          onAction={() => setActiveModule("items")}
          rows={records.movements.slice(0, 4).map((movement) => [
            movement.type,
            movement.target,
            `${movement.qty} units`,
          ])}
        />
        <DashboardPanel
          title="Low stock items"
          actionLabel="Review stock"
          onAction={() => setActiveModule("items")}
          rows={lowStock.slice(0, 4).map((item) => [
            item.title,
            `${item.stock} ${item.unit}`,
            `Reorder at ${item.reorderLevel}`,
          ])}
        />
        <DashboardPanel
          title="Open purchase orders"
          actionLabel="Open POs"
          onAction={() => setActiveModule("purchaseOrders")}
          rows={openPOs.slice(0, 4).map((po) => [
            po.number,
            po.status,
            formatDate(po.expectedDate),
          ])}
        />
      </div>
    </section>
  );
}

function DashboardPanel({
  title,
  actionLabel,
  onAction,
  rows,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
  rows: string[][];
}) {
  return (
    <article className="panel dashboard-panel">
      <div className="panel-header compact">
        <h2>{title}</h2>
        <button className="text-button" onClick={onAction} type="button">
          {actionLabel}
        </button>
      </div>
      <div className="mini-table">
        {rows.map((row, index) => (
          <div className="mini-row" key={`${title}-${index}`}>
            <span>{row[0]}</span>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
