// Imports, types and state
import { useEffect, useState } from "react";    
import type { SubmitEvent } from 'react' ;
import type { Post } from '../../shared/reddit' ;
import { fetchHotPosts, fetchPostsByIds, normaliseSubreddit } from '../lib/reddit' ;
import type { loadFavouriteIds, saveFavouriteIds } from '../lib/storage' ;
import type { PostRow } from './PostRow' ;

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
        .catch((err: unkown) => {
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
}