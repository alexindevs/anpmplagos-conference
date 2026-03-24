"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { login, AuthApiError } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

type ViewMode = "login" | "claim" | "register";

export default function AdminPage() {
  const setUser = useAuthStore((s) => s.setUser);
  const [mode, setMode] = useState<ViewMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Claim State
  const [adminCode, setAdminCode] = useState("");
  const [claimToken, setClaimToken] = useState<string | null>(null);

  // Register State
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regAvatar, setRegAvatar] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      setUser(res.user);
      setSuccess("Login successful! Redirecting...");
      window.location.href = "/admin/dashboard";
      return;
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.status === 401 ? "Invalid email or password." : (err.message || "Login failed"));
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiFetch<{ token: string }>("/api/admin/claim", {
        method: "POST",
        body: JSON.stringify({ code: adminCode }),
      });
      setClaimToken(res.token);
      setMode("register");
      setSuccess("Code verified! Please create your admin account.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Invalid admin code");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimToken) {
      setError("Session expired. Please verify code again.");
      setMode("claim");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", regEmail);
      formData.append("password", regPassword);
      formData.append("name", regName);
      formData.append("adminType", "superadmin");
      if (regAvatar) {
        formData.append("avatar", regAvatar);
      }

      // Note: apiFetch helper handles JSON content-type by default, 
      // but for FormData we need to let the browser set it.
      // We'll use raw fetch here or adjust apiFetch. 
      // Let's use raw fetch for multipart to be safe and simple here.
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/admin/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${claimToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Registration failed");
      }

      setSuccess("Admin account created! Please log in.");
      setMode("login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-[#181112]">
            {mode === "login" && "Admin Login"}
            {mode === "claim" && "Setup Admin Access"}
            {mode === "register" && "Create Admin Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "login" && "Sign in to manage the conference."}
            {mode === "claim" && "Enter your secure code to verify identity."}
            {mode === "register" && "Set up your credentials."}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
            {success}
          </div>
        )}

        {mode === "login" && (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="login-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="sr-only">
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("claim");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs font-medium text-gray-500 hover:text-primary"
              >
                First time setup?
              </button>
            </div>
          </form>
        )}

        {mode === "claim" && (
          <form className="mt-8 space-y-6" onSubmit={handleClaim}>
            <div>
              <label htmlFor="admin-code" className="sr-only">
                Admin Code
              </label>
              <input
                id="admin-code"
                name="code"
                type="password"
                required
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Enter Admin Code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-70"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs font-medium text-gray-500 hover:text-primary"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {mode === "register" && (
          <form className="mt-8 space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Picture (Optional)</label>
              <div className="mt-1 flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary/50"
                >
                  {regAvatar ? (
                    <Image
                      src={URL.createObjectURL(regAvatar)}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setRegAvatar(e.target.files[0]);
                  }}
                />
                <span className="text-xs text-gray-500">Click to upload</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
              >
                {isLoading ? "Creating Account..." : "Create Admin Account"}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs font-medium text-gray-500 hover:text-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
