/**
 * Extract the 11-char YouTube video ID from any valid YouTube URL.
 * Supports: youtu.be, youtube.com/watch, youtube.com/embed,
 *           youtube.com/shorts, youtube.com/v/
 * Returns null if the URL is not a recognisable YouTube URL.
 */
export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  const patterns = [
    // youtu.be/<id>
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    // youtube.com/watch?v=<id>
    /youtube\.com\/watch(?:\?v=|[^/]*[?&]v=)([A-Za-z0-9_-]{11})/,
    // youtube.com/embed/<id>
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    // youtube.com/shorts/<id>
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    // youtube.com/v/<id>
    /youtube\.com\/v\/([A-Za-z0-9_-]{11})/,
    // bare 11-char video ID
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}