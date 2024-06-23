import { FC, useEffect, useState } from 'react';

interface Tweet {
  id: string;
  text: string;
  author: {
    name: string;
    username: string;
    profile_image_url: string;
  };
}

interface TwitterFeedProps {
  query: string;
}

const TwitterFeed: FC<TwitterFeedProps> = ({ query }) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch(`/api/twitter?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const formattedTweets = data.data.map((tweet: any) => ({
          id: tweet.id,
          text: tweet.text,
          author: data.includes.users.find((user: any) => user.id === tweet.author_id),
        }));
        setTweets(formattedTweets);
      } catch (e) {
        console.error('Failed to fetch tweets:', e);
        setError('Failed to load tweets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, [query]);

  if (loading) return <div>Loading tweets...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 className="text-xl mb-4">Twitter Feed</h2>
      {tweets.map((tweet) => (
        <div key={tweet.id} className="mb-4 p-4 border border-gray-200 rounded">
          <div className="flex items-center mb-2">
            <img src={tweet.author.profile_image_url} alt={tweet.author.name} className="w-10 h-10 rounded-full mr-2" />
            <div>
              <div className="font-bold">{tweet.author.name}</div>
              <div className="text-gray-500">@{tweet.author.username}</div>
            </div>
          </div>
          <p>{tweet.text}</p>
        </div>
      ))}
    </div>
  );
};

export default TwitterFeed;
