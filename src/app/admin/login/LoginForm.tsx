"use client";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientAuth } from "@/lib/firebase/client";

const GENERIC = "Email or password is incorrect, or this account doesn't have admin access.";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const auth = await clientAuth();
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken(true);
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      // The browser doesn't keep the Firebase login; the httpOnly cookie is the session.
      await signOut(auth);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? GENERIC);
        return;
      }
      setPassword("");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(code === "auth/too-many-requests" ? "Too many attempts. Please wait a few minutes and try again." : GENERIC);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input id="email" type="email" autoComplete="username" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? (
        <p role="alert" className="rounded-lg bg-blush/40 px-3 py-2.5 text-sm text-ink">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary w-full" disabled={busy || !email || !password}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
