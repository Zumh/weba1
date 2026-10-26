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


