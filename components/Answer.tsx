import { SearchQuery, Source } from "@/types";
import { IconReload } from "@tabler/icons-react";
import { FC } from "react";

interface AnswerProps {
  searchQuery: SearchQuery;
  answer: string;
  done: boolean;
  onReset: () => void;
}

export const Answer: FC<AnswerProps> = ({ searchQuery, answer, done, onReset }) => {
  const formatAnswer = (text: string) => {
    // Parse the JSON string to get the actual answer text
    const parsedAnswer = JSON.parse(text).answer;
    
    // Split the text into paragraphs
    const paragraphs = parsedAnswer.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if the paragraph is a list
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
        // Replace citation brackets with linked superscripts
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
    <div className="max-w-[1200px] w-full mx-auto space-y-4 py-16 px-4 sm:px-8">
      <div className="overflow-auto text-2xl sm:text-4xl">{searchQuery.query}</div>

      <div className="border-b border-zinc-800 pb-4">
        <div className="text-md text-blue-500">Answer</div>
        <div className="mt-2 overflow-auto answer-content">
          {formatAnswer(answer)}
        </div>
      </div>


      {done && (
    <>
      <div className="border-b border-zinc-800 pb-4">
        <div className="text-md text-blue-500 mb-2">Sources</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {searchQuery.sourcesWithSummaries.map((source: Source, index: number) => (
                <tr key={index} className="border-b border-zinc-800">
                  <td className="py-2 pr-4 align-top">
                    <a
                      className="hover:underline text-blue-500"
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.title}
                    </a>
                  </td>
                  <td className="py-2 text-sm">{source.summary || "No summary available"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

          <button
            className="flex h-10 w-52 items-center justify-center rounded-full bg-blue-500 p-2 hover:cursor-pointer hover:bg-blue-600"
            onClick={onReset}
          >
            <IconReload size={18} />
            <div className="ml-2">Ask New Question</div>
          </button>
        </>
      )}
    </div>
  );
};

// const replaceSourcesWithLinks = (answer: string, sourceLinks: string[]) => {
//   const elements = answer.split(/(\[[0-9]+\])/).map((part, index) => {
//     if (/\[[0-9]+\]/.test(part)) {
//       const link = sourceLinks[parseInt(part.replace(/[\[\]]/g, "")) - 1];

//       return (
//         <a
//           key={index}
//           className="hover:cursor-pointer text-blue-500"
//           href={link}
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           {part}
//         </a>
//       );
//     } else {
//       return part;
//     }
//   });

//   return elements;
// };
