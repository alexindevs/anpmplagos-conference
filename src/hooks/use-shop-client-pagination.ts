"use client";

import { useEffect, useMemo, useState } from "react";

/** Catalog list endpoints are not yet paginated server-side; slice in memory until the API adds `page` / `pageSize`. */
export const SHOP_CATALOG_PAGE_SIZE = 8;

export function useClientPagination<T>(items: T[], pageSize = SHOP_CATALOG_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const setPageSafe = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  return { page, setPage: setPageSafe, totalPages, pageItems };
}
