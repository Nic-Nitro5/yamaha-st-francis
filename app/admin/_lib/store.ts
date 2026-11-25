import "server-only";
import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, rm, rmdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { Listing } from "../../lib/listings";

/**
 * Where listings are stored.
 *
 * - GitHub (production): every save is one commit to data/listings.json plus any added or removed
 *   photos under public/images/stock/. Vercel redeploys on the push, so changes go live in 1–2 min.
 * - Local (development without GITHUB_TOKEN): writes straight to the working copy, so you can try
 *   the dashboard without touching the repo on GitHub.
 */

const DATA_PATH = "data/listings.json";

export type Change = {
  listings: Listing[];
  /** Photos to add, as repo paths ("public/images/stock/...") and upload tokens from uploadImage(). */
  add: { path: string; token: string }[];
  /** Repo paths to delete. */
  remove: string[];
  message: string;
};

export type Snapshot = { listings: Listing[]; head: string };

export class ConflictError extends Error {}

const mode = () => {
  if (process.env.GITHUB_TOKEN) return "github" as const;
  if (process.env.NODE_ENV !== "production") return "local" as const;
  throw new Error("GITHUB_TOKEN is not set, so listings can't be saved.");
};

export const storeMode = () => {
  try {
    return mode();
  } catch {
    return "unconfigured" as const;
  }
};

export const readListings = () => (mode() === "github" ? gh.read() : local.read());
export const uploadImage = (bytes: Buffer, ext: string) =>
  mode() === "github" ? gh.upload(bytes) : local.upload(bytes, ext);

/**
 * Re-reads the latest listings, applies `fn` and commits. If someone else saved in between, the
 * commit is rejected and `fn` runs again on the newer data.
 */
export async function mutate(fn: (listings: Listing[]) => Change) {
  for (let attempt = 0; ; attempt++) {
    const snap = await readListings();
    const change = fn(structuredClone(snap.listings));
    try {
      return mode() === "github" ? await gh.commit(snap.head, change) : await local.commit(change);
    } catch (e) {
      if (e instanceof ConflictError && attempt < 2) continue;
      throw e;
    }
  }
}

/** True while the newest commit on GitHub hasn't been deployed yet. */
export function isDeploying(head: string) {
  const deployed = process.env.VERCEL_GIT_COMMIT_SHA;
  return mode() === "github" && Boolean(deployed) && deployed !== head;
}

const serialize = (listings: Listing[]) => JSON.stringify(listings, null, 2) + "\n";

// ---------------------------------------------------------------- GitHub

const gh = {
  config() {
    const repo =
      process.env.GITHUB_REPO ??
      (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
        ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
        : undefined);
    if (!repo) throw new Error("GITHUB_REPO is not set (expected owner/name).");
    return { repo, branch: process.env.GITHUB_BRANCH ?? "main", token: process.env.GITHUB_TOKEN! };
  },

  async api<T>(path: string, init: RequestInit & { raw?: boolean } = {}): Promise<T> {
    const { repo, token } = gh.config();
    const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: init.raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const err = new Error(`GitHub ${init.method ?? "GET"} ${path} failed (${res.status}): ${detail.slice(0, 300)}`);
      // A ref update that isn't a fast-forward means another save landed first.
      if (res.status === 422 && path.startsWith("/git/refs/")) throw new ConflictError(err.message);
      throw err;
    }
    return (init.raw ? res.text() : res.json()) as Promise<T>;
  },

  async read(): Promise<Snapshot> {
    const { branch } = gh.config();
    const ref = await gh.api<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
    const head = ref.object.sha;
    const text = await gh.api<string>(`/contents/${DATA_PATH}?ref=${head}`, { raw: true });
    return { listings: JSON.parse(text), head };
  },

  async blob(content: string, encoding: "utf-8" | "base64") {
    const res = await gh.api<{ sha: string }>("/git/blobs", {
      method: "POST",
      body: JSON.stringify({ content, encoding }),
    });
    return res.sha;
  },

  /** Photos go up as git blobs straight away; the save commit then just references them. */
  upload: (bytes: Buffer) => gh.blob(bytes.toString("base64"), "base64"),

  async commit(base: string, change: Change) {
    const { branch } = gh.config();
    const parent = await gh.api<{ tree: { sha: string } }>(`/git/commits/${base}`);
    const dataSha = await gh.blob(serialize(change.listings), "utf-8");
    for (const a of change.add) if (!/^[0-9a-f]{40}$/.test(a.token)) throw new Error("Invalid photo upload.");

    // Deleting a path that isn't in the repo fails the whole commit, so only delete files that exist.
    let remove = change.remove;
    if (remove.length) {
      const all = await gh.api<{ tree: { path: string }[] }>(`/git/trees/${parent.tree.sha}?recursive=1`);
      const present = new Set(all.tree.map((t) => t.path));
      remove = remove.filter((p) => present.has(p));
    }

    const tree = await gh.api<{ sha: string }>("/git/trees", {
      method: "POST",
      body: JSON.stringify({
        base_tree: parent.tree.sha,
        tree: [
          { path: DATA_PATH, mode: "100644", type: "blob", sha: dataSha },
          ...change.add.map((a) => ({ path: a.path, mode: "100644", type: "blob", sha: a.token })),
          ...remove.map((path) => ({ path, mode: "100644", type: "blob", sha: null })),
        ],
      }),
    });
    const commit = await gh.api<{ sha: string }>("/git/commits", {
      method: "POST",
      body: JSON.stringify({ message: change.message, tree: tree.sha, parents: [base] }),
    });
    await gh.api(`/git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
    return commit.sha;
  },
};

// ---------------------------------------------------------------- Local

const UPLOAD_DIR = join(/*turbopackIgnore: true*/ tmpdir(), "st-francis-admin-uploads");
/** Working-copy path. Dev only, so tell the bundler not to trace the project through it. */
const inRepo = (path: string) => join(/*turbopackIgnore: true*/ process.cwd(), path);

const local = {
  async read(): Promise<Snapshot> {
    const text = await readFile(inRepo(DATA_PATH), "utf8");
    return { listings: JSON.parse(text), head: "local" };
  },

  async upload(bytes: Buffer, ext: string) {
    const token = `${randomUUID()}.${ext}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(/*turbopackIgnore: true*/ UPLOAD_DIR, token), bytes);
    return token;
  },

  async commit(change: Change) {
    for (const a of change.add) {
      if (!/^[0-9a-f-]{36}\.(webp|jpg)$/.test(a.token)) throw new Error("Invalid photo upload.");
      await mkdir(dirname(inRepo(a.path)), { recursive: true });
      await copyFile(join(/*turbopackIgnore: true*/ UPLOAD_DIR, a.token), inRepo(a.path));
    }
    for (const path of change.remove) {
      const file = inRepo(path);
      await rm(file, { force: true });
      // Git doesn't track empty folders, so mirror that locally.
      const dir = dirname(file);
      if ((await readdir(dir).catch(() => ["?"])).length === 0) await rmdir(dir);
    }
    await writeFile(inRepo(DATA_PATH), serialize(change.listings));
    return "local";
  },
};
