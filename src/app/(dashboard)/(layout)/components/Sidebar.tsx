"use client";

import { menuItems } from "@/app/(dashboard)/(layout)/config/menu-items";
import { useAppState } from "@/app/context/app-state-context";

export function Sidebar() {
  const {
    activeModule,
    projectWorkspaceTab,
    setActiveModule,
    setProjectWorkspaceTab,
    user,
  } = useAppState();

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">KP</div>
        <div>
          <div className="brand-title">Key Point</div>
          <div className="brand-subtitle">V1 App Map</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div className="nav-group" key={item.key}>
            <button
              className={`nav-link ${activeModule === item.key ? "is-active" : ""}`}
              onClick={() => {
                setActiveModule(item.key);
                if (item.key === "projects") {
                  setProjectWorkspaceTab("projects");
                }
              }}
              type="button"
            >
              <span className="nav-copy">
                <strong>{item.label}</strong>
                <small>{item.blurb}</small>
              </span>
            </button>
            {item.key === "projects" && activeModule === "projects" && (
              <div className="sidebar-subnav">
                <button
                  className={projectWorkspaceTab === "areas" ? "is-active" : ""}
                  onClick={() => {
                    setActiveModule("projects");
                    setProjectWorkspaceTab("areas");
                  }}
                  type="button"
                >
                  Area
                </button>
                <button
                  className={projectWorkspaceTab === "cutlists" ? "is-active" : ""}
                  onClick={() => {
                    setActiveModule("projects");
                    setProjectWorkspaceTab("cutlists");
                  }}
                  type="button"
                >
                  Cut Lists
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
