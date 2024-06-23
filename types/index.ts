export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type Source = {
  title: string;
  url: string;
  text: string;
  summary?: string;  
};

export interface SourceWithSummary extends Source {
  summary: string;
}

export type SearchQuery = {
  query: string;
  sourceLinks: string[];
  sourcesWithSummaries: (Source & { summary: string })[];
};
