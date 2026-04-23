export function extractYoutubeId(url: string) {
  const trimmedUrl = url.trim();
  const shortMatch = trimmedUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  const longMatch = trimmedUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  const embedMatch = trimmedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/);

  return shortMatch?.[1] ?? longMatch?.[1] ?? embedMatch?.[1] ?? null;
}

export function getYoutubeEmbedUrl(youtubeId: string) {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

export function getYoutubeThumbnail(youtubeId: string) {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}
