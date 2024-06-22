const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());

app.get('/arxiv', async (req, res) => {
  const query = req.query.q;
  try {
    console.log(`Fetching arXiv sources for query: ${query}`);
    const response = await axios.get(`https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all`);
    const html = response.data;
    const $ = cheerio.load(html);

    const sources = [];

    $('.arxiv-result').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const summary = $(element).find('.abstract').text().trim();
      const url = `https://arxiv.org${$(element).find('.list-title a').attr('href')}`;

      sources.push({
        title,
        url,
        text: `${title}\n\n${summary}`
      });
    });

    console.log(`Found ${sources.length} arXiv sources`);
    res.json(sources.slice(0, 5)); 
  } catch (error) {
    console.error('Error fetching arXiv sources:', error);
    res.status(500).send('Error fetching arXiv sources');
  }
});

app.get('/pubmed', async (req, res) => {
  const query = req.query.q;
  try {
    console.log(`Fetching PubMed sources for query: ${query}`);
    const response = await axios.get(`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`);
    const html = response.data;
    const $ = cheerio.load(html);

    const sources = [];

    $('.docsum-content').each((index, element) => {
      const title = $(element).find('.docsum-title').text().trim();
      const summary = $(element).find('.full-view-snippet').text().trim();
      const url = `https://pubmed.ncbi.nlm.nih.gov${$(element).find('.docsum-title a').attr('href')}`;

      sources.push({
        title,
        url,
        text: `${title}\n\n${summary}`
      });
    });

    console.log(`Found ${sources.length} PubMed sources`);
    res.json(sources.slice(0, 5));
  } catch (error) {
    console.error('Error fetching PubMed sources:', error);
    res.status(500).send('Error fetching PubMed sources');
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});