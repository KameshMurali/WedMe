import "server-only";

type HeaderReader = Pick<Headers, "get">;
type HeaderSource = HeaderReader | Request;

function getHeaders(source: HeaderSource) {
  return source instanceof Request ? source.headers : source;
}

export function getClientIp(source: HeaderSource) {
  const headers = getHeaders(source);

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-vercel-forwarded-for") ??
    "unknown"
  );
}

export function getRequestUserAgent(source: HeaderSource) {
  return getHeaders(source).get("user-agent") ?? "unknown";
}
