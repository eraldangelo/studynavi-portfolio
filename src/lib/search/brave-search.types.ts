export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  excerpt?: string;
}

export interface BraveSearchResponse {
  results: BraveSearchResult[];
  query: string;
  error?: string;
}

export type CachedSearchEntry = {
  ts: number;
  results: BraveSearchResult[];
};
