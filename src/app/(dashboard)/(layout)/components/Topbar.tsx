"use client";

import { navigationItems } from "@/app/configs/navigation";
import { useAppState } from "@/app/context/app-state-context";

export function Topbar() {
  const {
    activeModule,
    query,
    setQuery,
    itemDateFilter,
    setItemDateFilter,
    setTheme,
    theme,
    setUser,
  } = useAppState();

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">ag-drive inspired structure</div>
        <h1>{navigationItems.find((item) => item.key === activeModule)?.label}</h1>
      </div>
      <div className="topbar-actions">
        {activeModule !== "dashboard" && (
          <input
            className="search-input"
            placeholder={`Search ${navigationItems.find((item) => item.key === activeModule)?.label}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
        {activeModule === "items" && (
          <>
            <input
              className="search-input compact"
              type="date"
              value={itemDateFilter.from}
              onChange={(event) =>
                setItemDateFilter((current) => ({ ...current, from: event.target.value }))
              }
            />
            <input
              className="search-input compact"
              type="date"
              value={itemDateFilter.to}
              onChange={(event) =>
                setItemDateFilter((current) => ({ ...current, to: event.target.value }))
              }
            />
          </>
        )}
        <button
          className="secondary-button"
          type="button"
          onClick={() =>
            setTheme((current) => (current === "light" ? "dark" : "light"))
          }
        >
          {theme === "light" ? "Dark theme" : "Light theme"}
        </button>
        <button className="secondary-button" type="button" onClick={() => setUser(null)}>
          Sign out
        </button>
      </div>
    </header>
  );
}
