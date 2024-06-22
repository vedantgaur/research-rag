import { SearchQuery, Source } from "@/types";
import { IconArrowRight, IconBolt, IconSearch } from "@tabler/icons-react";
import endent from "endent";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import axios from 'axios';
import cheerio from 'cheerio';

interface SearchProps {
  onSearch: (searchResult: SearchQuery) => void;
  onAnswerUpdate: (answer: string) => void;
  onDone: (done: boolean) => void;
}

export const Search: FC<SearchProps> = ({ onSearch, onAnswerUpdate, onDone }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  const fetchSources = async (query: string): Promise<Source[]> => {
    try {
      console.log('Fetching arXiv sources for query:', query);
      const response = await axios.get(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10`);
      const xml = response.data;
      const $ = cheerio.load(xml, { xmlMode: true });
  
      const sources: Source[] = [];
  
      $('entry').each((index, element) => {
        const title = $(element).find('title').text().trim();
        const summary = $(element).find('summary').text().trim();
        const url = $(element).find('id').text().trim();
  
        sources.push({
          title,
          url,
          text: `${title}\n\n${summary}`
        });
      });
  
      console.log('arXiv response:', sources);
      return sources;
    } catch (error) {
      console.error('Error fetching arXiv sources:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.status, error.response?.data);
      }
      return [];
    }
  };

  const fetchPubMedSources = async (query: string): Promise<Source[]> => {
    try {
      console.log('Fetching PubMed sources for query:', query);
      const searchResponse = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=10&format=json`);
      const ids: string[] = searchResponse.data.esearchresult.idlist;
  
      if (ids.length === 0) {
        return [];
      }
  
      const summaryResponse = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&format=json`);
      const results = summaryResponse.data.result;
  
      const sources: Source[] = ids.map((id: string) => {
        const article = results[id];
        return {
          title: article.title,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          text: `${article.title}\n\n${article.abstract || 'No abstract available'}`
        };
      });
  
      console.log('PubMed response:', sources);
      return sources;
    } catch (error) {
      console.error('Error fetching PubMed sources:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.status, error.response?.data);
      }
      return [];
    }
  };

  const handleSearch = async () => {
    if (!query) {
      alert("Please enter a query");
      return;
    }

    setLoading(true);
    try {
      console.log('Starting search for query:', query);
      
      const searchableQueryPrompt = `Convert the following user query into a concise, keyword-rich search query suitable for searching academic papers on arXiv:
      
      User query: "${query}"
      
      Searchable query:`;

      const searchableQueryResponse = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: searchableQueryPrompt, apiKey })
      });

      if (!searchableQueryResponse.ok) {
        const errorText = await searchableQueryResponse.text();
        throw new Error(`Failed to generate searchable query: ${searchableQueryResponse.status} ${searchableQueryResponse.statusText}\n${errorText}`);
      }

      const responseText = await searchableQueryResponse.text();
      console.log('Raw response:', responseText);

      let searchableQueryData;
      try {
        searchableQueryData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      console.log('Parsed response:', searchableQueryData);

      if (!searchableQueryData || !searchableQueryData.answer) {
        throw new Error(`Unexpected response format: ${JSON.stringify(searchableQueryData)}`);
      }

      const searchableQuery = searchableQueryData.answer.trim().replace(' site:arxiv.org', '');
      console.log("Generated searchable query:", searchableQuery);

      const arxivSources = await fetchSources(searchableQuery);
      console.log('arXiv sources fetched:', arxivSources.length);
      const pubMedSources = await fetchPubMedSources(searchableQuery);
      console.log('PubMed sources fetched:', pubMedSources.length);
      const allSources = [...arxivSources, ...pubMedSources].slice(0, 20);

      console.log('Total sources:', allSources.length);

      if (allSources.length === 0) {
        throw new Error("No sources found. Please try a different query.");
      }

      await handleStream(allSources);
    } catch (error: unknown) {
      console.error('Error in handleSearch:', error);
      setLoading(false);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unknown error occurred while fetching sources");
      }
    }
  };

  const handleStream = async (sources: Source[]) => {
    try {
      const prompt = endent`Provide an extensive (long, multi-paragraph, detailed) summary of the arXiv and PubMed papers related to the query "${query}". Be original, concise, accurate, and helpful, and separate each paper. Cite sources as [1], [2], [3] , ..., etc. after each sentence to back up your answer.

      ${sources.map((source, idx) => `Source [${idx + 1}]:\nTitle: ${source.title}\nSummary: ${source.text}`).join("\n\n")}
      `;

      const response = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt, apiKey })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      setLoading(false);
      onSearch({ query, sourceLinks: sources.map((source) => source.url) });

      const data = response.body;
      if (!data) {
        throw new Error("No data received from server");
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        onAnswerUpdate(chunkValue);
      }

      onDone(true);
    } catch (err) {
      console.error("Error in handleStream:", err);
      setLoading(false);
      onAnswerUpdate(`Error: ${err instanceof Error ? err.message : "Unknown error occurred"}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center pt-64 sm:pt-72 flex-col">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <div className="mt-8 text-2xl">Getting answer...</div>
        </div>
      ) : (
        <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center space-y-6 px-3 pt-32 sm:pt-64">
          <div className="flex items-center">
            <IconBolt size={36} />
            <div className="ml-1 text-center text-4xl">Research RAG</div>
          </div>

          <div className="relative w-full">
            <IconSearch className="text=[#D4D4D8] absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />

            <input
              ref={inputRef}
              className="h-12 w-full rounded-full border border-zinc-600 bg-[#2A2A31] pr-12 pl-11 focus:border-zinc-800 focus:bg-[#18181C] focus:outline-none focus:ring-2 focus:ring-zinc-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg"
              type="text"
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button>
              <IconArrowRight
                onClick={handleSearch}
                className="absolute right-2 top-2.5 h-7 w-7 rounded-full bg-blue-500 p-1 hover:cursor-pointer hover:bg-blue-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
};