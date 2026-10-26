export type Post = {
    id: string;
    title: string;
    score: number;
    subreddit: string;
    // Path such as /r/reactjs/comments/abc123/some_title/ */
    permalink: string;
};

// Posts holds only 5 fileds the UI displays. every other part of the app passes this type around
// both server and client import it.
export type PostsResponse = {
    posts:Post[];
};




