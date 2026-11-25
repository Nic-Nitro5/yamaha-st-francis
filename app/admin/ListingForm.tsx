"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { CATEGORIES, type Listing } from "../lib/listings";
import { buttonClass } from "../components/ui";
import { saveListing, uploadImage, type ListingInput, type PhotoInput } from "./actions";
import { blocksToText } from "./_lib/format";
import Thumb from "./Thumb";

type Photo = {
  id: string;
  /** Shown in the grid: the stored path, or a local object URL for a new upload. */
  preview: string;
  state: "ready" | "uploading" | "error";
  error?: string;
  input?: PhotoInput;
};

const MAX_EDGE = 2000; // px, longest side after resizing

/** Resize in the browser and re-encode as WebP (JPEG where the browser can't), so uploads stay small. */
async function prepare(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string, q: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
  const webp = await encode("image/webp", 0.82);
  if (webp?.type === "image/webp") return webp;
  const jpeg = await encode("image/jpeg", 0.85);
  if (!jpeg) throw new Error("encode failed");
  return jpeg;
}

const field = "min-h-12 w-full border border-ink/20 bg-white px-3 text-base text-ink outline-none focus:border-navy";
const label = "flex flex-col gap-2 text-sm font-medium text-ink";

export default function ListingForm({ listing }: { listing?: Listing }) {
  const [photos, setPhotos] = useState<Photo[]>(() =>
    (listing?.images ?? []).map((src) => ({ id: src, preview: src, state: "ready", input: { kind: "existing", src } })),
  );
  const [error, setError] = useState<string>();
  const [saving, startSave] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrls = useRef<string[]>([]);

  useEffect(() => () => objectUrls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const update = (id: string, patch: Partial<Photo>) =>
    setPhotos((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  async function addFiles(files: FileList | File[]) {
    const queued = [...files].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    const entries = queued.map((file) => {
      const preview = URL.createObjectURL(file);
      objectUrls.current.push(preview);
      return { file, photo: { id: crypto.randomUUID(), preview, state: "uploading" as const } };
    });
    setPhotos((ps) => [...ps, ...entries.map((e) => e.photo)]);

    // A few at a time keeps phones on slow connections responsive.
    const queue = [...entries];
    await Promise.all(
      Array.from({ length: 3 }, async () => {
        for (let e = queue.shift(); e; e = queue.shift()) {
          try {
            const blob = await prepare(e.file);
            const form = new FormData();
            form.append("file", blob, blob.type === "image/webp" ? "photo.webp" : "photo.jpg");
            const res = await uploadImage(form);
            if ("error" in res) update(e.photo.id, { state: "error", error: res.error });
            else update(e.photo.id, { state: "ready", input: { kind: "upload", token: res.token } });
          } catch {
            update(e.photo.id, { state: "error", error: "Couldn't read this photo. Try a JPEG." });
          }
        }
      }),
    );
  }

  const move = (i: number, by: number) =>
    setPhotos((ps) => {
      const next = [...ps];
      const [p] = next.splice(i, 1);
      next.splice(Math.max(0, Math.min(next.length, i + by)), 0, p);
      return next;
    });
  const remove = (id: string) => setPhotos((ps) => ps.filter((p) => p.id !== id));

  const uploading = photos.some((p) => p.state === "uploading");
  const failed = photos.some((p) => p.state === "error");

  function submit(form: FormData) {
    setError(undefined);
    if (uploading) return setError("Wait for the photos to finish uploading.");
    if (failed) return setError("Remove the photos that failed to upload first.");
    const input: ListingInput = {
      slug: listing?.slug,
      title: String(form.get("title") ?? ""),
      category: String(form.get("category")) as ListingInput["category"],
      status: String(form.get("status")) as ListingInput["status"],
      year: String(form.get("year") ?? ""),
      price: String(form.get("price") ?? ""),
      wasPrice: String(form.get("wasPrice") ?? ""),
      description: String(form.get("description") ?? ""),
      photos: photos.map((p) => p.input!),
    };
    startSave(async () => {
      const res = await saveListing(input);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={submit} className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-5">
        <label className={label}>
          Title
          <input name="title" required defaultValue={listing?.title} placeholder="2020 Seacat 510 FC" className={field} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Type
            <select name="category" defaultValue={listing?.category ?? "boats"} className={field}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.singular}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Status
            <select name="status" defaultValue={listing?.status ?? "available"} className={field}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className={label}>
            Year
            <input name="year" inputMode="numeric" defaultValue={listing?.year ?? ""} className={field} />
          </label>
          <label className={label}>
            Price (R)
            <input name="price" inputMode="numeric" defaultValue={listing?.price ?? ""} placeholder="On request" className={field} />
          </label>
          <label className={label}>
            Was (R)
            <input name="wasPrice" inputMode="numeric" defaultValue={listing?.wasPrice ?? ""} className={field} />
          </label>
        </div>
        <p className="-mt-2 text-xs text-muted">
          Leave the price empty for &ldquo;Price on request&rdquo;. A &ldquo;was&rdquo; price shows the listing as reduced.
        </p>
        <label className={label}>
          Description
          <textarea
            name="description"
            rows={14}
            defaultValue={listing ? blocksToText(listing.description) : ""}
            className={`${field} py-3 leading-relaxed`}
          />
          <span className="text-xs font-normal text-muted">
            Leave a blank line between paragraphs. Start a line with &ldquo;-&rdquo; to make a bullet point.
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-ink">Photos</p>
          <p className="text-xs text-muted">The first photo is the cover.</p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`border border-dashed p-3 transition-colors ${dragOver ? "border-navy bg-navy/5" : "border-ink/25"}`}
        >
          {photos.length > 0 && (
            <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((p, i) => (
                <li key={p.id} className="relative">
                  <Thumb src={p.preview} className="aspect-[4/3] w-full" />
                  {i === 0 && <span className="eyebrow absolute left-1.5 top-1.5 bg-brand px-1.5 py-0.5 text-[9px] text-white">Cover</span>}
                  {p.state === "uploading" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-navy/60 text-xs text-white">Uploading…</span>
                  )}
                  {p.state === "error" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-brand/80 p-2 text-center text-xs text-white">
                      {p.error}
                    </span>
                  )}
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="flex">
                      <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier" className="min-h-9 px-2 disabled:opacity-30">
                        ←
                      </button>
                      <button type="button" disabled={i === photos.length - 1} onClick={() => move(i, 1)} aria-label="Move later" className="min-h-9 px-2 disabled:opacity-30">
                        →
                      </button>
                    </span>
                    <button type="button" onClick={() => remove(p.id)} className="min-h-9 px-2 text-muted hover:text-brand">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex min-h-24 w-full items-center justify-center text-sm text-muted hover:text-ink"
          >
            Drop photos here or click to choose
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        {listing && (
          <p className="text-xs text-muted">Photos you remove are deleted from the site when you save.</p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-end lg:col-span-2">
        {error && (
          <p role="alert" className="text-sm text-brand sm:mr-auto">
            {error}
          </p>
        )}
        <Link href="/admin" className="flex min-h-11 items-center justify-center px-4 text-sm text-muted hover:text-ink">
          Cancel
        </Link>
        <button type="submit" disabled={saving || uploading} className={`${buttonClass("navyToBrand")} disabled:opacity-60`}>
          {saving ? "Saving…" : uploading ? "Uploading photos…" : listing ? "Save changes" : "Publish listing"}
        </button>
      </div>
    </form>
  );
}
