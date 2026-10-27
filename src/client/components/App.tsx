import { useEffect, useState } from "react";    
import type { SubmitEvent } from 'react' ;
import type { Post } from '../../shared/reddit' ;
import type { fetchHotPosts, fetchPostsByIds, normaliseSubreddit } from '../lib/reddit' ;
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

    
}