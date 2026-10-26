// Input cleanup and helpers
import type { Post, PostsResponse } from '../../shared/reddit';

const SUBREDDIT = /^[A-Za-z0-9_]{2,21}$/;

export const normalisSubreddit = (input: string): string | null => {
    const name = input.trim().replace(/^\/?r\//i, '');
    return SUBREDDIT.test(name) ? name : null;
};

export const commentsUrl = (permalink: string): string => `https://www.reddit.com${permalink}`;

type Mode = 'direct' | 'devvit';
let mode: Mode = 'direct';

// mode remembers wheter the direct call to Reddit works. 
// it starts as 'direct' and flips to 'devvit' if the broswer blocks the request.
export const isDevvitMode = (): boolean => mode === 'devvit';

// check if data is object or null
const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;


/**
 * Parsing Reddit’s JSON safely
This function check each level is an object,
then pulls the five fields we need. Anything malformed is skipped
instead of crashing the app. 
*/
const parseListing = (json: unknown): Post[] => {
    if(
        !isRecord(json) ||
        !isRecord(json.data) ||
        !Array.isArray(json.data.children)

    ) {
        throw new Error('Unexpected response from Reddit');
    }
    const posts: Post[] = [];

    for (const child of json.data.children) {
        if (!isRecord(child) || !isRecord(child.data)) 
        {
            continue;
        }

        const childData = chiild.data;
        if(
            typeof childData.id === 'string' &&
            typeof childData.title === 'string' &&
            typeof childData.score === 'number' &&
            typeof childData.subreddit === 'string' &&
            typeof childData.permalink === 'string' 

        ) {
            posts.push({

                id: childData.id,
                title: childData.title,
                score: childData.score,
                subreddit: childData.subreddit,
                permalink: childData.permalink
            });
        }
    }
    return posts;
};


// Parsing the Devvit proxy response

const parsePostsResponse = (json: unknown): Post[] => {
    if(!isRecord(json) || !Array.isArray(json.posts)) {
        throw new Error('Unexpected response from server');
    }

    const wrapped: PostResponse = { posts: [] };

    for (const currentPost of json.posts) {
        if (
            isRecord(currentPost) && 
            typeof currentPost.id === 'string' &&
            typeof currentPost.title === 'string' &&
            typeof currentPost.score === 'number' &&
            typeof currentPost.subreddit === 'string' &&
            typeof currentPost.permalink === 'string' 
        ) {
            wrapped.posts.push({
                id: currentPost.id,
                title: currentPost.title,
                score: currentPost.score,
                subreddit: currentPost.subreddit,
                permalink: currentPost.permalink,
            });


        }

    }

    return wrapped.posts;
};

// Fetching with good errors 

const getJson = async (url: string): Promise<unknown> => {
    const res = await fetch(url);
    if(res.status == 404)
    {
        throw new Error('Subreddit not found');
    }
    if(res.status == 403)
    {
        throw new Error('That subreddit is private or banned');
    }
    if(res.status == 429)
    {
        throw new Error('Reddit is rate limiting - try again shortly');
    }
    if(!res.ok)
    {
        throw new Error(`Request failed (HTTP ${res.status})`);
    }

    const json: unknown = await res.json();
    return json;
}