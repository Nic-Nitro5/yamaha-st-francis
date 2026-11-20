"use client";

import { useState } from "react";
import { ArrowUpRight } from "./icons";
import { buttonClass } from "./ui";
import { CONTACTS, mailtoHref } from "../lib/site";
import { delay } from "../lib/motion";

const INTERESTS = [
  "New boats",
  "Pre-owned boats",
  "Yamaha outboards",
  "WaveRunners",
  "Servicing & repairs",
  "Custom rigging & electronics",
  "Storage & docking",
  "Something else",
];

const FIELD =
  "w-full border-0 border-b border-white/40 bg-transparent px-0 pb-3 pt-1 text-base text-white transition-colors duration-300 placeholder:text-white/60 hover:border-white/70 focus:border-white focus:outline-none focus:ring-0";

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="eyebrow mb-2 block text-white/80">{label}</span>
      {children}
    </label>
  );
}

/**
 * No backend yet: submitting opens the visitor's email app with the enquiry
 * prefilled. Swap for a server action once a mail provider is chosen.
 */
export default function ContactForm() {
  const [interest, setInterest] = useState(INTERESTS[0]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (k: string) => String(form.get(k) ?? "").trim();
    const body = [
      `Name: ${value("name")}`,
      `Phone: ${value("phone") || "-"}`,
      `Email: ${value("email")}`,
      `Interested in: ${interest}`,
      "",
      value("message"),
    ].join("\n");
    window.location.href = mailtoHref(CONTACTS.sales.email, {
      cc: CONTACTS.finance.email,
      subject: `Website enquiry: ${interest}`,
      body,
    });
  }

  return (
    <form onSubmit={onSubmit} data-reveal style={delay(150)} className="grid gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-9">
      <Field label="Your name">
        <input name="name" required placeholder="Full name" className={FIELD} autoComplete="name" />
      </Field>
      <Field label="Phone number">
        <input name="phone" type="tel" placeholder="+27" className={FIELD} autoComplete="tel" />
      </Field>
      <Field label="Email address" wide>
        <input name="email" type="email" required placeholder="you@example.com" className={FIELD} autoComplete="email" />
      </Field>

      <fieldset className="sm:col-span-2">
        <legend className="eyebrow mb-4 text-white/80">I&apos;m interested in</legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={interest === x}
              onClick={() => setInterest(x)}
              className={`min-h-10 border px-3.5 py-2 text-[13px] transition-all duration-300 active:scale-95 ${
                interest === x
                  ? "border-white bg-white text-brand"
                  : "border-white/40 text-white hover:-translate-y-0.5 hover:border-white"
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </fieldset>

      <Field label="Message" wide>
        <textarea name="message" rows={3} placeholder="Tell us what you're looking for" className={`${FIELD} resize-none`} />
      </Field>

      <div className="sm:col-span-2">
        <button type="submit" className={`${buttonClass("navy")} w-full sm:w-auto`}>
          Send enquiry <ArrowUpRight />
        </button>
      </div>
    </form>
  );
}
