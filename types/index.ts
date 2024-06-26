export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo",
  GPT4 = "gpt-4"
}

export type Source = {
  title: string;
  url: string;
  text: string;
  summary?: string;
  citations?: number;
  publishDate?: string;
};


export interface SourceWithSummary extends Source {
  summary: string;
}

export type SearchQuery = {
  query: string;
  sourceLinks: string[];
  sourcesWithSummaries: (Source & { summary: string })[];
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};


