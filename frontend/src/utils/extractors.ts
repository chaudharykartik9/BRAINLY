export const extractYoutubeId = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
};

export const extractTweetId = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/);
  return match ? match[3] : null;
};

export const extractTwitterHandle = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status/);
  return match ? match[1] : null;
};

/** Returns a URL's bare hostname (no "www."), or null if it can't be parsed. */
export const getUrlDomain = (url?: string): string | null => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

/** Returns a URL's file extension in uppercase (e.g. "PDF"), or null if it has none. */
export const getFileExtension = (url?: string): string | null => {
  if (!url) return null;
  try {
    const match = new URL(url).pathname.match(/\.([a-zA-Z0-9]{1,6})$/);
    return match ? match[1].toUpperCase() : null;
  } catch {
    return null;
  }
};