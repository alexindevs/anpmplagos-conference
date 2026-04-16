export const SHOP_TAB_IDS = [
  "bundles",
  "booths",
  "adverts",
  "branding",
  "masterclasses",
  "presentations",
] as const;

export type ShopTabId = (typeof SHOP_TAB_IDS)[number];

export function parseShopTab(tab: string | null): ShopTabId {
  if (tab && (SHOP_TAB_IDS as readonly string[]).includes(tab)) {
    return tab as ShopTabId;
  }
  return "bundles";
}
