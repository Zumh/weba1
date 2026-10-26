import type { Post, PostsResponse } from '../../shared/reddit';

const SUBREDDIT = /^[A-Za-z0-9_]{2,21}$/;

export const normalisSubreddit = (input: string): string | null => {
    const name = input.trim().replace(/^\/?r\//i, '');
    return SUBREDDIT.test(name) ? name : null;
};

export const commentsUrl = (permalink: string): string => `https://www.reddit.com${permalink}`;

type Mode = 'direct' | 'devvit';
let mode: Mode = 'direct';

export const isDevvitMode = (): boolean => mode === 'devvit';


