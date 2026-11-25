# Deploying to Vercel

The site is a standard Next.js app on Vercel. The only setup beyond the defaults is the stock
dashboard at `/admin`. It saves listings by committing to this GitHub repo, so it needs a password
and a GitHub token.

## 1. Import the project

1. In Vercel, choose **Add New → Project** and import this GitHub repo.
2. Leave the build settings as detected: framework **Next.js**, build command `next build`, output
   directory default, install command `npm install`.
3. Under **Settings → Git**, check that the **Production Branch** is `main`.
4. Leave **Settings → Environment Variables → Automatically expose System Environment Variables**
   switched on (it's on by default). The dashboard uses these to find the repo and to tell when a
   deploy is still in progress.

Don't deploy yet. Add the environment variables first (step 3).

## 2. Create a GitHub token for the dashboard

1. Sign in to GitHub as the account that owns the repo.
2. Go to **Settings → Developer settings → Personal access tokens → Fine-grained tokens →
   Generate new token**.
3. Fill it in:
   - **Repository access:** *Only select repositories* → this repo.
   - **Permissions → Repository permissions → Contents:** *Read and write*. Leave everything else
     at *No access*. Metadata is read-only and gets added automatically.
   - **Expiration:** your choice, up to a year. When the token expires, dashboard saves stop
     working (see Troubleshooting), so put a reminder in your calendar.
4. Copy the token. GitHub only shows it once.

> Use a token from the same GitHub account that's connected to Vercel. On Vercel's Hobby plan,
> deploys can be blocked for commits made by someone who isn't on the Vercel team. Dashboard
> commits are authored by the token's owner.

## 3. Add environment variables

In Vercel, go to **Project → Settings → Environment Variables** and add the following. If the
settings sidebar is hidden, click the panel icon at the top-left next to the project name, or add
`/environment-variables` to the end of the project's settings URL. Tick
**Production only** for each one (the reason is explained below the table).

| Name             | Value                                                         | Required |
| ---------------- | ------------------------------------------------------------- | -------- |
| `ADMIN_PASSWORD` | A long password for the dashboard (16+ characters).           | Yes      |
| `GITHUB_TOKEN`   | The token from step 2.                                        | Yes      |
| `GITHUB_REPO`    | `owner/name`. Only needed if the repo can't be detected.      | No       |
| `GITHUB_BRANCH`  | Branch the dashboard commits to. Defaults to `main`.          | No       |

**Why Production only:** the dashboard always commits to `main`. If preview deployments had these
variables, the dashboard on a preview URL would also write to the live site's data. Leaving them
off previews means `/admin` on a preview can't sign in and can't save.

## 4. Deploy

Click **Deploy**, or push to `main`. Then add your domain under **Settings → Domains** if it isn't
set up yet.

## 5. Check it works

1. Open `https://<your-domain>/admin` and sign in with `ADMIN_PASSWORD`.
2. Add a throwaway listing with one or two photos and click **Publish listing**.
3. On GitHub, check that a commit called `content: add <title> (+N photo(s))` appeared on `main`.
4. In Vercel, check that a new deployment started from that commit. It should be live in about
   1–2 minutes, after which the listing shows on `/boat-sales`.
5. Delete the test listing from the dashboard. Check that the `content: remove …` commit deletes
   both the listing and its photo folder.

## How changes reach the site

```
Dashboard save → one commit to main (listings.json + photos) → Vercel build → live in ~1–2 min
```

- **Undo a change:** revert its `content: …` commit on GitHub. The site redeploys without it.
- **Editing in code:** pull before you work on `data/listings.json` or `public/images/stock/`.
  The dashboard commits to `main` directly, so your local copy falls behind whenever staff save.
- **Don't run** `scripts/import-listings.mjs` once the dashboard is in use. It overwrites
  `data/listings.json`, including everything edited in the dashboard.

## Rotating secrets

- **Change the password:** update `ADMIN_PASSWORD` in Vercel and redeploy. Everyone who was signed
  in is signed out.
- **Replace the token:** generate a new one (step 2), update `GITHUB_TOKEN`, redeploy, then delete
  the old token on GitHub.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Dashboard says "GITHUB_TOKEN isn't set" | The variable is missing from Production, or you haven't redeployed since adding it. |
| "Saving failed. Nothing was changed." | The token has expired, been revoked, or lacks *Contents: read and write* on this repo. Check the function logs in Vercel for the GitHub error. |
| Login always says the password is wrong | `ADMIN_PASSWORD` isn't set for Production, or you haven't redeployed since changing it. |
| Commit appears on GitHub but nothing deploys | The Git integration is disconnected, an *Ignored Build Step* is set, or (on Hobby) the commit author isn't on the Vercel team. See step 2. |
| New photos show "Deploying…" in the dashboard | Expected until the redeploy finishes. The photos are on GitHub but not yet on the live site. |
| Photo upload fails on an iPhone | iOS normally converts HEIC to JPEG automatically. If it doesn't, export the photo as JPEG and try again. |

## Local development

Create `.env.local` in the project root (it's gitignored) with one `NAME=value` per line:

```
ADMIN_PASSWORD=choose-a-local-password
```

Then run `npm run dev` and open `http://localhost:3000/admin`. Without `GITHUB_TOKEN`, the
dashboard writes to your working copy instead of GitHub. Review the changes with `git diff` and
discard them with `git restore` if they were only a test.
