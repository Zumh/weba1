const KEY = 'favouritePostsIds';

// Fallback if the browser/webview blocks Web Storage.
let memory: string[] = [];

// type check
const isStringArray = (v: unknown): v is string[] => 
    Array.isArray(v) && v.every((x) => typeof x === 'string');


// Only post IDs("1abc23) are stored - never any post data.

export const loadFavouriteIds = (): string[] => {
    try {
        const raw = window.localStorage.getItem(KEY);
        if(raw === null){
            return memory;
        }

        const parsed: uknown = JSON.parse(raw);
        return isStringArray(parsed) ? parsed : [];

    } catch {
        return memory;
    }
};

export const saveFavouriteIds = (ids: string[]): void => {
    memory = ids;
    try {
        window.localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
        // Storage unavailable: keep the in-memory copy for this session
    }
};

// Reddit 