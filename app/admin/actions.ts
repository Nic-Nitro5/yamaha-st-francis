"use server";

import { redirect } from "next/navigation";
import { CATEGORIES, type Category, type Listing } from "../lib/listings";
import { checkPassword, endSession, requireAdmin, startSession } from "./_lib/auth";
import { parseAmount, slugify, textToBlocks } from "./_lib/format";
import { mutate, uploadImage as storeUpload } from "./_lib/store";

// ---------------------------------------------------------------- Session

export async function login(_prev: { error?: string } | undefined, form: FormData) {
  if (!checkPassword(String(form.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return { error: "That password isn't right." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- Photos

const MAX_PHOTO_BYTES = 3.5 * 1024 * 1024;

/** The browser resizes and converts each photo before sending it, so one request stays small. */
export async function uploadImage(form: FormData): Promise<{ token: string } | { error: string }> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File)) return { error: "No photo received." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "Photo is too large." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const isWebp = bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP";
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!isWebp && !isJpeg) return { error: "Only JPEG or WebP photos can be uploaded." };

  try {
    const token = await storeUpload(bytes, isWebp ? "webp" : "jpg");
    return { token: `${token}:${isWebp ? "webp" : "jpg"}` };
  } catch (e) {
    console.error(e);
    return { error: "Couldn't upload the photo. Try again." };
  }
}

// ---------------------------------------------------------------- Listings

export type PhotoInput = { kind: "existing"; src: string } | { kind: "upload"; token: string };

export type ListingInput = {
  /** Set when editing; new listings get a slug from the title. */
  slug?: string;
  title: string;
  category: Category;
  status: Listing["status"];
  year: string;
  price: string;
  wasPrice: string;
  description: string;
  photos: PhotoInput[];
};

const STOCK = "/images/stock/";
const repoPath = (src: string) => `public${src}`;

/** Photos no longer used by any listing, as repo paths. Only files we manage under /images/stock/. */
function orphaned(candidates: string[], remaining: Listing[]) {
  const used = new Set(remaining.flatMap((l) => l.images));
  return [...new Set(candidates)].filter((src) => src.startsWith(STOCK) && !used.has(src)).map(repoPath);
}

function validate(input: ListingInput) {
  const title = input.title.trim().replace(/\s+/g, " ");
  if (!title) return "Add a title.";
  if (title.length > 120) return "Keep the title under 120 characters.";
  if (!CATEGORIES.some((c) => c.id === input.category)) return "Pick a type.";
  if (input.status !== "available" && input.status !== "sold") return "Pick a status.";
  const year = parseAmount(input.year);
  if (year !== null && (year < 1950 || year > new Date().getFullYear() + 2)) return "That year doesn't look right.";
  if (!input.photos.length) return "Add at least one photo.";
  if (input.photos.length > 40) return "Up to 40 photos per listing.";
  return null;
}

export async function saveListing(input: ListingInput): Promise<{ error: string } | undefined> {
  await requireAdmin();
  const problem = validate(input);
  if (problem) return { error: problem };

  let slug = input.slug;
  try {
    await mutate((listings) => {
      const existing = input.slug ? listings.find((l) => l.slug === input.slug) : undefined;
      if (input.slug && !existing) throw new UserError("This listing was deleted by someone else.");

      if (!existing) {
        const base = slugify(input.title);
        const taken = new Set(listings.map((l) => l.slug));
        slug = base;
        for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
      }

      // Keep existing photos (only ones this listing really has), add new uploads in their place.
      const stamp = Date.now().toString(36);
      const add: { path: string; token: string }[] = [];
      const images = input.photos.map((p, i) => {
        if (p.kind === "existing") {
          if (!existing?.images.includes(p.src)) throw new UserError("A photo went missing. Reload and try again.");
          return p.src;
        }
        const [token, ext] = p.token.split(":");
        if (ext !== "webp" && ext !== "jpg") throw new UserError("Invalid photo upload.");
        const src = `${STOCK}${slug}/${stamp}-${i + 1}.${ext}`;
        add.push({ path: repoPath(src), token });
        return src;
      });

      const listing: Listing = {
        slug: slug!,
        title: input.title.trim().replace(/\s+/g, " "),
        category: input.category,
        status: input.status,
        year: parseAmount(input.year),
        price: parseAmount(input.price),
        wasPrice: parseAmount(input.wasPrice),
        // New stock goes to the top of the "Featured" sort.
        order: existing?.order ?? Math.min(0, ...listings.map((l) => l.order)) - 1,
        sourceUrl: existing?.sourceUrl ?? "",
        description: textToBlocks(input.description),
        images,
      };

      const next = existing ? listings.map((l) => (l.slug === slug ? listing : l)) : [listing, ...listings];
      const removed = existing ? existing.images.filter((src) => !images.includes(src)) : [];
      const photoNote = [add.length && `+${add.length} photo(s)`, removed.length && `-${removed.length} photo(s)`]
        .filter(Boolean)
        .join(", ");

      return {
        listings: next,
        add,
        remove: orphaned(removed, next),
        message: `content: ${existing ? "update" : "add"} ${listing.title}${photoNote ? ` (${photoNote})` : ""}`,
      };
    });
  } catch (e) {
    if (e instanceof UserError) return { error: e.message };
    console.error(e);
    return { error: "Saving failed. Nothing was changed. Try again in a minute." };
  }
  redirect(`/admin?saved=${encodeURIComponent(slug!)}`);
}

export async function deleteListing(slug: string): Promise<{ error: string } | undefined> {
  await requireAdmin();
  let title = "";
  try {
    await mutate((listings) => {
      const target = listings.find((l) => l.slug === slug);
      if (!target) throw new UserError("That listing is already gone.");
      title = target.title;
      const next = listings.filter((l) => l.slug !== slug);
      const remove = orphaned(target.images, next);
      return {
        listings: next,
        add: [],
        remove,
        message: `content: remove ${target.title} (-${remove.length} photo(s))`,
      };
    });
  } catch (e) {
    if (e instanceof UserError) return { error: e.message };
    console.error(e);
    return { error: "Deleting failed. Try again in a minute." };
  }
  redirect(`/admin?deleted=${encodeURIComponent(title)}`);
}

class UserError extends Error {}
