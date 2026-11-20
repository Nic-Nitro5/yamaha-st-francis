import { cacheLife } from "next/cache";

/** Current year, captured in the static shell and refreshed daily so it rolls over on 1 January. */
export async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
