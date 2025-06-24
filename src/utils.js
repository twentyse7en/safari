export function getYoutubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function getYoutubeThumbnailUrl(videoId, quality = 'mqdefault') {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export const LAST_WATCHED_KEY = 'travelVideoMap_lastWatched_react';