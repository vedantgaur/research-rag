import { SearchQuery, Source } from "@/types";
import { IconReload } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

interface AnswerProps {
  searchQuery: SearchQuery;
  answer: string;
  done: boolean;
  onReset: () => void;
}

export const Answer: FC<AnswerProps> = ({ searchQuery, answer, done, onReset }) => {
  const [formattedAnswer, setFormattedAnswer] = useState<JSX.Element[]>([]);

  useEffect(() => {
    setFormattedAnswer(formatAnswer(answer));
  }, [answer]);

  const formatAnswer = (text: string): JSX.Element[] => {
    console.log("Formatting answer:", text);
    if (!text) {
      return [<p key="empty">No answer available.</p>];
    }

    let parsedAnswer: string;
    try {
      const jsonAnswer = JSON.parse(text);
      parsedAnswer = jsonAnswer.answer || text;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      parsedAnswer = text;
    }

    const paragraphs = parsedAnswer.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (paragraph.includes('- ')) {
        const listItems = paragraph.split('- ');
        return (
          <ul key={index} className="list-disc pl-5 mb-4">
            {listItems.map((item, itemIndex) => 
              item.trim() && <li key={itemIndex}>{replaceSourcesWithLinks(item.trim(), searchQuery.sourceLinks)}</li>
            )}
          </ul>
        );
      } else {
        return <p key={index} className="mb-4">{replaceSourcesWithLinks(paragraph, searchQuery.sourceLinks)}</p>;
      }
    });
  };

  const replaceSourcesWithLinks = (text: string, sourceLinks: string[]) => {
    const elements = text.split(/(\[[0-9]+\])/).map((part, index) => {
      if (/\[[0-9]+\]/.test(part)) {
        const sourceIndex = parseInt(part.replace(/[\[\]]/g, "")) - 1;
        const link = sourceLinks[sourceIndex];
        return (
          <a
            key={index}
            className="hover:underline text-blue-500"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <sup>{sourceIndex + 1}</sup>
          </a>
        );
      } else {
        return part;
      }
    });

    return elements;
  };

  return (
    <div className="flex-grow max-w-[900px]">
      <div className="overflow-auto text-2xl sm:text-4xl mb-4">{searchQuery.query}</div>

      <div className="border-b border-zinc-800 pb-4">
        <div className="text-md text-blue-500">Answer</div>
        <div className="mt-2 overflow-auto answer-content">
          {formattedAnswer}
        </div>
      </div>

      {done && (
        <>
          <div className="border-b border-zinc-800 pb-4 mt-4">
            <div className="text-md text-blue-500 mb-2">Sources</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-800">
                    <th className="py-2 px-4 text-left">Title</th>
                    <th className="py-2 px-4 text-left">Summary</th>
                    <th className="py-2 px-4 text-left">Citations</th>
                    <th className="py-2 px-4 text-left">Publish Date</th>
                  </tr>
                </thead>
                <tbody>
                  {searchQuery.sourcesWithSummaries.map((source: Source, index: number) => (
                    <tr key={index} className="border-b border-zinc-800">
                      <td className="py-2 px-4 align-top">
                        <a
                          className="hover:underline text-blue-500"
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.title}
                        </a>
                      </td>
                      <td className="py-2 px-4 text-sm">{source.summary || "No summary available"}</td>
                      <td className="py-2 px-4 text-sm">{source.citations !== undefined ? source.citations : "N/A"}</td>
                      <td className="py-2 px-4 text-sm">{source.publishDate || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            className="flex h-10 w-52 items-center justify-center rounded-full bg-blue-500 p-2 hover:cursor-pointer hover:bg-blue-600 mt-4"
            onClick={onReset}
          >
            <IconReload size={18} />
            <div className="ml-2">New Search</div>
          </button>
        </>
      )}
    </div>
  );
};
