// Imports, types and state
import { useEffect, useState } from "react";    
import type { SubmitEvent } from 'react' ;
import type { Post } from '../../shared/reddit' ;
import { fetchHotPosts, fetchPostsByIds, normaliseSubreddit } from '../lib/reddit' ;
import  { loadFavouriteIds, saveFavouriteIds } from '../lib/storage' ;
import  { PostRow } from './PostRow' ;

type Listing = 
| { status: 'idle'}
| { status: 'loading'; subreddit: string}
| { status: 'error'; message: string}
| { status: 'ready'; subreddit: string; posts: Post[]};

export const App = () => {
    const [input, setInput] = useState('');
    const [listing, setListing] = useState<Listing>({ status: 'idle' });
    const [favIds, setFavIds] = useState<string[]>(loadFavouriteIds);
    const [favPosts, setFavPosts] = useState<Post[]>([]);
    const [favError, setFavError] = useState<string | null>(null);


    // Loading favourites’ details
    useEffect(() => {

        let cancelled = false;
        fetchPostsByIds(favIds)
        .then((posts) => {
            if (cancelled) {
                return;

            }

            setFavPosts(posts);
            setFavError(null);
        })
        .catch((err: unknown) => {
            if(cancelled){
                return;
            }

            setFavError(err instanceof Error ? err.message : 'Could not load favourites');
        });

        return () => {
            cancelled = true;
        };

    }, [favIds]);

    // Searching 
    const search = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const subreddit = normaliseSubreddit(input);
        if(!subreddit){
            setListing({
                status: 'error',
                message: 'Enter a valid subreddit name, e.g. reactjs',
            });
            return;
        }

        setListing({ status: 'loading', subreddit });
        fetchHotPosts(subreddit)
        .then((posts) => setListing({ status: 'ready', subreddit, posts }))
        .catch((err: unknown) =>
            setListing({
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Something went wrong',
            })
        );
    };

    // Adding and removing favourites

    const toggleFavourite = (id: string) => {
        const next = favIds.includes(id)
        ? favIds.filter((x) => x !== id)
        : [...favIds, id];
        setFavIds(next);
        saveFavouriteIds(next);
    };

    const byId = new Map(favPosts.map((recentPost) => [recentPost.id, recentPost]));

      return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="mx-auto grid max-w-6xl gap-8 p-4 md:grid-cols-2">
        <section aria-labelledby="browse">
          <h1 id="browse" className="mb-3 text-2xl font-bold">
            Browse a subreddit
          </h1>
          <form onSubmit={search} className="mb-4 flex gap-2">
            <label className="sr-only" htmlFor="subreddit">
              Subreddit name
            </label>
            <input
              id="subreddit"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. reactjs"
              autoComplete="off"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-[#d93900] px-4 py-2 text-white hover:bg-[#c23300] dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              Show hot posts
            </button>
          </form>

          {listing.status === 'idle' && (
            <p className="text-gray-500 dark:text-gray-400">
              Type a subreddit to see its top 10 hot posts.
            </p>
          )}
          {listing.status === 'loading' && (
            <p role="status">Loading r/{listing.subreddit}…</p>
          )}
          {listing.status === 'error' && (
            <p role="alert" className="text-red-600 dark:text-red-400">
              {listing.message}
            </p>
          )}
          {listing.status === 'ready' && (
            <>
              <h2 className="mb-2 text-lg font-semibold">
                Hot in r/{listing.subreddit}
              </h2>
              {listing.posts.length === 0 ? (
                <p>No posts found.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {listing.posts.map((post) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      isFavourite={favIds.includes(post.id)}
                      onToggle={toggleFavourite}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
                <section aria-labelledby="favs">
          <h2 id="favs" className="mb-3 text-2xl font-bold">
            Your favourites ({favIds.length})
          </h2>
          {favError && (
            <p role="alert" className="mb-2 text-red-600 dark:text-red-400">
              {favError}
            </p>
          )}
          {favIds.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No favourites yet. Press ☆ Favourite on a post to add it.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {favIds.map((id) => {
                const post = byId.get(id);
                return post ? (
                  <PostRow
                    key={id}
                    post={post}
                    isFavourite
                    onToggle={toggleFavourite}
                  />
                ) : (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 p-3 text-gray-500 dark:border-gray-600 dark:text-gray-400"
                  >
                    <span>Loading or unavailable post ({id})</span>
                    <button
                      type="button"
                      onClick={() => toggleFavourite(id)}
                      className="cursor-pointer rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100"
                    >
                      X Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};
