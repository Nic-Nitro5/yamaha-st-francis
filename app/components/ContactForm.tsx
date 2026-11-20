"use client";

import { useState } from "react";
import { ArrowUpRight } from "./Arrow";

const interests = [
  "New boats",
  "Pre-owned boats",
  "Yamaha outboards",
  "WaveRunners",
  "Servicing & repairs",
  "Custom rigging & electronics",
  "Storage & docking",
  "Something else",
];

const field =
  "w-full border-0 border-b border-white/40 bg-transparent px-0 pb-3 pt-1 text-base text-white transition-colors duration-300 placeholder:text-white/60 hover:border-white/70 focus:border-white focus:outline-none focus:ring-0";

// No backend yet: the form opens the visitor's email app with the
// enquiry prefilled. Swap for a server action once a mail provider is chosen.
export default function ContactForm() {
  const [interest, setInterest] = useState(interests[0]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const subject = `Website enquiry: ${d.get("interest")}`;
    const body = [
      `Name: ${d.get("name")}`,
      `Phone: ${d.get("phone")}`,
      `Email: ${d.get("email")}`,
      `Interested in: ${d.get("interest")}`,
      "",
      `${d.get("message") ?? ""}`,
    ].join("\n");
    window.location.href = `mailto:richard@stfrancisyamaha.co.za?cc=laura@stfrancisyamaha.co.za&subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form
      onSubmit={onSubmit}
      data-reveal
      style={{ "--d": "150ms" } as React.CSSProperties}
      className="grid gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-9"
    >
      <label className="block">
        <span className="eyebrow mb-2 block text-white/80">Your name</span>
        <input name="name" required placeholder="Full name" className={field} autoComplete="name" />
      </label>
      <label className="block">
        <span className="eyebrow mb-2 block text-white/80">Phone number</span>
        <input name="phone" type="tel" placeholder="+27" className={field} autoComplete="tel" />
      </label>
      <label className="block sm:col-span-2">
        <span className="eyebrow mb-2 block text-white/80">Email address</span>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={field}
          autoComplete="email"
        />
      </label>

      <fieldset className="sm:col-span-2">
        <legend className="eyebrow mb-4 text-white/80">I&apos;m interested in</legend>
        <input type="hidden" name="interest" value={interest} />
        <div className="flex flex-wrap gap-2">
          {interests.map((x) => (
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

      <label className="block sm:col-span-2">
        <span className="eyebrow mb-2 block text-white/80">Message</span>
        <textarea
          name="message"
          rows={3}
          placeholder="Tell us what you're looking for"
          className={`${field} resize-none`}
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="btn-sweep group flex w-full items-center justify-center gap-2 bg-navy px-7 py-4 text-sm font-medium text-white hover:text-navy sm:inline-flex sm:w-auto"
        >
          Send enquiry <ArrowUpRight />
        </button>
      </div>
    </form>
  );
}
