"use client";

import { menuItems } from "@/app/(dashboard)/(layout)/config/menu-items";
import { useAppState } from "@/app/context/app-state-context";

export function Sidebar() {
  const { activeModule, setActiveModule, user } = useAppState();

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
          <button
            key={item.key}
            className={`nav-link ${activeModule === item.key ? "is-active" : ""}`}
            onClick={() => setActiveModule(item.key)}
            type="button"
          >
            <span className="nav-copy">
              <strong>{item.label}</strong>
              <small>{item.blurb}</small>
            </span>
          </button>
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
