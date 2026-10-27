
import { navigateTo } from "@devvit/web/client";
import type { Post } from '../../shared/reddit';
import { commentsUrl, isDevvitMode } from '../lib/reddit';

type Props = {

    post: Post;
    isFavourite: boolean;
    onToggle: (id: string) => void;
}

export const PostRow = ({ post, isFavourite, onToggle }: Props) => {
    const url = commentsUrl(post.permalink);

    return (
        <li className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <div 
                className="min-w-14 text-center font-semibold text-[#d93900] dark:text-orange-400"
                title="Score"
            >
                {post.score.toLocaleString()}

            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 break-words">
                    {post.title}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    r/{post.subreddit} ·{' '}
                    <a 
                    href={url}
                    target="_blank"
                    rel="noreferrer"
     
                    className="underline hover:text-gray-900 dark:hover:text-white"
                    onClick={(e) => {
                        if (isDevvitMode()){
                            e.preventDefault();
                            navigateTo(url);

                        }
                    }} 
                    >
                    View comments

                    </a>
                </p>
            </div>
            <button
                type="button"
                onClick={() => onToggle(post.id)}
                aria-pressed={isFavourite}
                className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-sm transition-colors ${
                    isFavourite
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray 100 dark:hover:bg-gray-600'
                    : 'bg-[#d93900] text-white hover:bg-[#c23300] dark:bg-orange-600 dark:hover:bg-orange-700'
                }`}

            >
                {isFavourite ? 'X Remove' : 'X Favourite'}

            </button>
        </li>
    );
};