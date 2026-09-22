"use client";

import type { ZiviraTreeNode } from "@zivira/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { applyMenuOverrides, fetchMenuOverrides, type MenuOverride } from "@/lib/menu-overrides";

function Card({ node, parentPath }: { node: ZiviraTreeNode; parentPath: string[] }) {
  const path = [...parentPath, node.slug];
  return (
    <Link 
      className="bg-surface-card hover:shadow-md transition-shadow rounded-xl p-4 border border-border-subtle flex flex-col justify-between space-y-3 relative overflow-hidden group" 
      href={`/admin/workspace/${path.join("/")}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-primary transition-colors">{node.title}</h3>
          <p className="font-body-sm text-body-sm text-text-muted mt-1">{node.children?.length ? `${node.children.length} sub tabs` : "Ready module"}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-surface-subtle text-text-secondary flex items-center justify-center group-hover:bg-brand-primary-subtle group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[18px]">folder_open</span>
        </div>
      </div>
    </Link>
  );
}

export function AdminTabGrid({ node, path }: { node: ZiviraTreeNode; path: string[] }) {
  // Menu Creation overrides (hide/rename/reorder) — see lib/menu-overrides.ts.
  // Starts `null` (not yet fetched) and falls back to an empty map on any
  // failure; both cases render the exact original `node.children`, so this
  // is a strictly additive layer over the existing static tree.
  const [overrides, setOverrides] = useState<Map<string, MenuOverride> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMenuOverrides().then((map) => {
      if (!cancelled) setOverrides(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!node.children || node.children.length === 0) {
    return null;
  }

  const children = overrides && overrides.size ? applyMenuOverrides(node.children, path, overrides) : node.children;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {children.map((child) => (
        <Card key={`${child.slug}-${child.title}`} node={child} parentPath={path} />
      ))}
    </div>
  );
}
