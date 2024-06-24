# RAG: Research Augmented Generation

RAG (Research Augmented Generation) is an AI-powered research paper search and synthesis tool. It uses arXiv and PubMed APIs to fetch relevant academic papers based on user queries, and then uses OpenAI's GPT model to generate concise summaries and insights from these papers.

## Features

- Search for academic papers across arXiv and PubMed databases
- AI-generated summaries and insights from multiple research papers
- Display of paper metadata including citations and publish dates
- Real-time chat interface to discuss the research findings

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- OpenAI API key
- Twitter API key (optional, for Twitter feed functionality)

## Setup

1. Clone the repository:
```
git clone https://github.com/vedantgaur/research-rag.git
cd research-rag
```
2. Install dependencies:
```
npm install
```

3. Create a `.env.local` file in the root directory and add your API keys:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN_KEY= 
TWITTER_ACCESS_TOKEN_SECRET=
```

## Running the Application

1. Start the proxy server:
```
node proxy-server.js
```

2. In a new terminal, start the Next.js development server:
```
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000` to use the application.

## Usage

1. Enter a research query in the search bar and press Enter or click the search button.
2. The application will fetch relevant papers from arXiv and PubMed.
3. An AI-generated summary and synthesis of the papers will be displayed.
4. You can view the source papers, their citations, and publish dates in the table below the summary.
5. Use the chat interface on the right to ask questions or discuss the research findings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
