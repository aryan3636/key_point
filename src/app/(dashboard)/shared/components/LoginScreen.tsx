"use client";

import { FormEvent, useState } from "react";
import { useAppState } from "@/app/context/app-state-context";

export function LoginScreen() {
  const { setUser } = useAppState();
  const [email, setEmail] = useState("demo@keypoint.app");
  const [password, setPassword] = useState("demo123");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUser({
      name: "Project Director",
      email: email.trim() || "demo@keypoint.app",
      role: "Operations Manager",
    });
  };

  return (
    <div className="login-shell">
      <div className="login-layout">
        <section className="login-visual">
          <div className="login-visual-image" />
          <div className="login-visual-copy">
            <h2>The all in one inventory app for your millwork business.</h2>
            <p>
              Take control of your stock, save time and keep accurate records
              across workshop and site teams.
            </p>
          </div>
        </section>

        <section className="login-form-column">
          <div className="login-language">English</div>
          <div className="login-panel">
            <div className="login-logo-lockup">
              <div className="login-logo-badge">Key Point</div>
            </div>
            <h1>Log in</h1>
            <form className="login-form" onSubmit={submit}>
              <label className="login-input-group">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="e.g. alex@example.com"
                />
              </label>
              <label className="login-input-group">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                />
              </label>
              <div className="login-form-meta">
                <button className="text-button" type="button">
                  Forgot password?
                </button>
              </div>
              <button className="primary-button login-submit" type="submit">
                Log In
              </button>
            </form>
            <div className="login-note">
              Don&apos;t have an account?{" "}
              <button className="text-button inline-link" type="button">
                Create
              </button>
            </div>
            <div className="login-version">Version: dev - 0.1.0</div>
          </div>
        </section>
      </div>
    </div>
  );
}
