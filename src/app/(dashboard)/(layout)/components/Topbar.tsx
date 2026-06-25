"use client";

import { navigationItems } from "@/app/configs/navigation";
import { useAppState } from "@/app/context/app-state-context";

export function Topbar() {
  const {
    activeModule,
    projectWorkspaceTab,
    setTheme,
    theme,
    setUser,
    user,
  } = useAppState();
  const activeLabel =
    activeModule === "projects"
      ? projectWorkspaceTab === "areas"
        ? "Areas"
        : projectWorkspaceTab === "cutlists"
          ? "Cut Lists"
          : "Projects"
      : navigationItems.find((item) => item.key === activeModule)?.label;

  return (
    <header className="topbar">
      <h1>{activeLabel}</h1>
      <div className="topbar-actions">
        <button
          className="topbar-icon-button"
          type="button"
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          onClick={() =>
            setTheme((current) => (current === "light" ? "dark" : "light"))
          }
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
        <div className="topbar-user">
          <div className="user-avatar small">{user?.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
        <button className="text-button topbar-signout" type="button" onClick={() => setUser(null)}>
          Sign out
        </button>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" className="topbar-svg-icon" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" className="topbar-svg-icon" viewBox="0 0 24 24">
      <path d="M20.4 15.2A8.2 8.2 0 0 1 8.8 3.6 8.7 8.7 0 1 0 20.4 15.2Z" />
    </svg>
  );
}
