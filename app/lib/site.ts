/**
 * Business details used across the site. Change contact info, hours or the address
 * here and every page picks it up.
 */

export const SITE = {
  name: "St Francis Bay Yamaha",
  url: "https://www.stfrancisbayyamaha.com",
  description:
    "Yamaha marine specialists in St Francis Bay, South Africa. Boat sales, Yamaha outboards, WaveRunners, certified servicing, custom rigging and storage.",
  facebook: "https://www.facebook.com/stfrancisyamaha",
} as const;

export type Contact = {
  name: string;
  role: string;
  /** Display format, e.g. "+27 82 990 7225". */
  phone: string;
  email: string;
};

export const CONTACTS = {
  sales: {
    name: "Richard Fulford",
    role: "Dealer Principal",
    phone: "+27 82 990 7225",
    email: "richard@stfrancisyamaha.co.za",
  },
  finance: {
    name: "Laura Robson",
    role: "Customer Relations & Finance",
    phone: "+27 84 383 7098",
    email: "laura@stfrancisyamaha.co.za",
  },
} satisfies Record<string, Contact>;

export const ADDRESS = {
  lines: ["Unit 1 Tarragona Road", "Sea Vista, St Francis Bay", "6312, South Africa"],
  short: "Unit 1 Tarragona Road, Sea Vista",
  mapUrl: "https://www.google.com/maps/dir/?api=1&destination=-34.17465336189,24.821991",
  coordinates: "34°10′ S / 24°49′ E",
} as const;

export const HOURS: { days: string; short: string; hours: string; shortHours: string | null }[] = [
  { days: "Mon – Thu", short: "Mon–Thu", hours: "08:00 – 17:00", shortHours: "8–5" },
  { days: "Friday", short: "Fri", hours: "08:00 – 16:00", shortHours: "8–4" },
  { days: "Saturday", short: "Sat", hours: "08:30 – 12:00", shortHours: "8:30–12" },
  { days: "Sunday", short: "Sun", hours: "Closed", shortHours: null },
];

/** "Mon–Thu 8–5, Fri 8–4, Sat 8:30–12" */
export const hoursSummary = HOURS.filter((h) => h.shortHours)
  .map((h) => `${h.short} ${h.shortHours}`)
  .join(", ");

const digits = (phone: string) => phone.replace(/\D/g, "");

export const telHref = (phone: string) => `tel:+${digits(phone)}`;

export const whatsappHref = (phone: string, message?: string) =>
  `https://wa.me/${digits(phone)}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export function mailtoHref(to: string, opts: { cc?: string; subject?: string; body?: string } = {}) {
  const params = Object.entries(opts)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  return `mailto:${to}${params ? `?${params}` : ""}`;
}
