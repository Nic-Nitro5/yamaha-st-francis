"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { buttonClass } from "../../components/ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-ink">
        Password
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="min-h-12 border border-ink/20 bg-white px-3 text-base font-normal outline-none focus:border-navy"
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-brand">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${buttonClass("navyToBrand")} disabled:opacity-60`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
