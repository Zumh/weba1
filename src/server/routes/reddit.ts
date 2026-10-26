import { Hono } from 'hono';
import { reddit } from '@devvit/web/server';
import type { Post, PostsResponse } from '../../shared/reddit';

export const redditApi = new Hono();

const SUBREDDIT = /^[A-Za-z0-9_]{2,21}/;
const POST_ID = /^[a-z0-9]{1,10}$/;

const stripPrefix = (id: string): string => id.replace(/^t3_/, '');

redditApi.get('/hot', async (currentRreddit) => {
    const name = currentRreddit.req.query('subreddit') ?? '';
    if(!SUBREDDIT.test(name))
    {
        return currentRreddit.json({ status: 'error', message: 'Invalid subreddit name' }, 400);
    }

    try
    {
        const listing = reddit.getHotPosts({
            subredditName: name,
            limit: 10,
            pageSize: 10,
        });

        const found = await listing.get(10);
        const posts: Post[] = found.map((currentPost) => ({
            id: stripPrefix(currentPost.id),
            title: currentPost.title,
            score: currentPost.score,
            subreddit: currentPost.subredditName,
            permalink: currentPost.permalink,
        }));
        return currentRreddit.json<PostsResponse>({ posts });
    } catch (error) {
        console.error('hot error', error);
        return currentRreddit.json({ status: 'error', message: 'Subreddit not found' }, 404);
    }
});

redditApi.get('/info', async (currentRreddit) => {
    const ids = (currentRreddit.req.query('ids') ?? '')
    .split(',')
    .filter((id) => POST_ID.test(id))
    .slice(0, 100);

    const results = await Promise.allSettled(
        ids.map((id) => reddit.getPostById(`t3_${id}`))
    );

    const posts: Post[] = [];
    for(const currentResult of results){
        if(currentResult.status !== 'fulfilled'){
            continue;
        }

        const currentPost = currentResult.value;

        posts.push({
            id: stripPrefix(currentPost.id),
            title: currentPost.title,
            score: currentPost.score,
            subreddit: currentPost.subredditName,
            permalink: currentPost.permalink,
        });

    }
    
    return currentRreddit.json<PostsResponse>({ posts });
});