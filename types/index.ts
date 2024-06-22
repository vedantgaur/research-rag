export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type Source = {
  title: string;
  url: string;
  text: string;
};

export type SearchQuery = {
  query: string;
  sourceLinks: string[];
};
