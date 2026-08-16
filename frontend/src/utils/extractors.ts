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