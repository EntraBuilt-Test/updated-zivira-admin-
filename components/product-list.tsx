"use client";

import type { Product } from "@zivira/types";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "./page-components";

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  async function loadProducts() {
    setError("");
    try {
      const response = await apiClient.products();
      setProducts(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products");
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  return (
    <>
      <div className="toolbar">
        <button className="button button-secondary" onClick={loadProducts} type="button">
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm mt-4 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-subtle sticky top-0 z-10 shadow-sm">
            <tr className="hover:bg-surface-subtle/50 transition-colors group"><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Name</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Code</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Category</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Division</th><th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap border-b border-border-subtle bg-surface-subtle">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {products.map((product) => (
              <tr className="hover:bg-surface-subtle/50 transition-colors group" key={product.id}>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{product.name}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{product.code}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{product.category}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{product.division}</td>
                <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"><StatusBadge status={product.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
