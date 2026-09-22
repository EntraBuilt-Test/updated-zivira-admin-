import type { ZiviraTreeNode } from "@zivira/types";
import { apiClient, type MasterRecord } from "@/lib/api-client";

/**
 * Menu Creation feature — layers tenant-controlled hide/rename/reorder
 * overrides onto the exact static nav tree (packages/types/src/zivira-tree.ts)
 * without ever mutating that tree itself.
 *
 * Scope (deliberately limited — see the task/PR notes):
 *  - hide an existing real node (and everything under it)
 *  - rename an existing real node's display label
 *  - reorder an existing real node among its siblings
 *  - does NOT support adding a brand-new node/screen that isn't already in
 *    the static tree, and does NOT support role-based restriction (the
 *    admin portal this renders in has no concept of a viewing "role" to
 *    restrict against today).
 *
 * Every function here is a pure, synchronous transform over plain data —
 * verified with a standalone script (mock tree + mock rows) rather than a
 * running Next.js server, per the task's verification approach.
 */

export type MenuOverride = {
  menuPath: string;
  displayLabel?: string;
  isHidden: boolean;
  sortOrder?: number;
};

// The `menuCreation` master's "Menu Path" field stores each option as
// "Readable Title (slash/joined/path)" (see the backend's
// ZIVIRA_MENU_PATH_OPTIONS) so the admin can find the right row in a
// 399-entry dropdown — but the actual matching key is only the
// parenthesized path. Also tolerates a bare path with no "(...)" suffix,
// in case a row was ever created/edited directly against the API.
function extractMenuPath(raw: unknown): string {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  const match = /\(([^()]+)\)\s*$/.exec(value);
  return (match ? match[1] : value).trim();
}

function isRecordActive(record: MasterRecord): boolean {
  const status = record.status;
  // No status field at all (shouldn't happen for this master, but treat
  // conservatively) — only an explicit "Inactive" turns an override off.
  return status !== "Inactive";
}

/**
 * Converts raw `menuCreation` master records (as returned by
 * GET /company/masters/menuCreation) into a lookup map keyed by the exact
 * slash-joined tree path each row targets. Deactivated ("Inactive") rows
 * and rows with no resolvable path are ignored.
 */
export function recordsToMenuOverrides(records: MasterRecord[]): Map<string, MenuOverride> {
  const overrides = new Map<string, MenuOverride>();

  for (const record of records) {
    if (!isRecordActive(record)) continue;

    const menuPath = extractMenuPath(record.menuPath);
    if (!menuPath) continue;

    const override: MenuOverride = { menuPath, isHidden: record.isHidden === "Yes" || record.isHidden === true };

    const displayLabel = typeof record.displayLabel === "string" ? record.displayLabel.trim() : "";
    if (displayLabel) override.displayLabel = displayLabel;

    const sortOrderRaw = record.sortOrder;
    if (sortOrderRaw !== undefined && sortOrderRaw !== null && sortOrderRaw !== "") {
      const sortOrder = Number(sortOrderRaw);
      if (Number.isFinite(sortOrder)) override.sortOrder = sortOrder;
    }

    // Last write for a given path wins if a tenant somehow has more than
    // one active row for the same node — matches how every other master's
    // "one row per real-world thing" convention behaves.
    overrides.set(menuPath, override);
  }

  return overrides;
}

/**
 * Fetches this tenant's active `menuCreation` overrides. Never throws —
 * any network/auth failure resolves to an empty map, which is exactly the
 * "no overrides" case `applyMenuOverrides` already renders as the
 * untouched static tree.
 */
export async function fetchMenuOverrides(): Promise<Map<string, MenuOverride>> {
  try {
    const response = await apiClient.masterRecords("menuCreation");
    return recordsToMenuOverrides(response.data ?? []);
  } catch {
    return new Map();
  }
}

/**
 * Applies tenant overrides to one level of sibling tree nodes (exactly the
 * shape AdminTabGrid renders — a node's direct `children`). This is a pure
 * function: it never mutates `nodes`, and with an empty `overrides` map it
 * returns the very same array reference it was given, so a tenant with no
 * menuCreation rows renders an identical tree to before this feature
 * existed.
 *
 * Ordering rule: a sibling with an explicit `sortOrder` sorts by that
 * number; a sibling with none keeps its original position in the array
 * (its own index acts as its sort key), and ties break by original index.
 * This lets an admin move just one or two items without having to assign
 * an order to every sibling.
 */
export function applyMenuOverrides(
  nodes: ZiviraTreeNode[],
  parentPath: string[],
  overrides: Map<string, MenuOverride>
): ZiviraTreeNode[] {
  if (!overrides.size) return nodes;

  const withMeta = nodes.map((node, index) => {
    const path = [...parentPath, node.slug].join("/");
    return { node, index, path, override: overrides.get(path) };
  });

  const visible = withMeta.filter(({ override }) => !override?.isHidden);

  visible.sort((a, b) => {
    const aKey = a.override?.sortOrder ?? a.index;
    const bKey = b.override?.sortOrder ?? b.index;
    if (aKey !== bKey) return aKey - bKey;
    return a.index - b.index;
  });

  return visible.map(({ node, override }) =>
    override?.displayLabel ? { ...node, title: override.displayLabel } : node
  );
}
