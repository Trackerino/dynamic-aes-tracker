export interface FortniteStorefrontCatalogData {
  refreshIntervalHrs: number
  dailyPurchaseHrs: number
  expiration: string
  storefronts: Storefront[]
}

export interface Storefront {
  name: string
  catalogEntries: CatalogEntry[]
}

export interface CatalogEntry {
  meta?: Record<string, string>
  metaInfo: MetaInfo[]
}

export interface MetaInfo {
  key: string
  value: string
}
