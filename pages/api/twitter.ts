import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  try {
    const tweets = await client.v2.search(query as string, {
      'tweet.fields': ['created_at', 'author_id', 'public_metrics'],
      expansions: ['author_id'],
      'user.fields': ['name', 'username', 'profile_image_url'],
      max_results: 10,
    });

    res.status(200).json(tweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ error: 'Error fetching tweets', details: error.message });
  }
}
