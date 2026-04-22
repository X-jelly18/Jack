export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const url = new URL(req.url);

  const backendUrl =
    "http://zooo.ayanakojixxx.shop" +
    url.pathname +
    url.search;

  // Clone headers safely
  const headers = new Headers(req.headers);

  // Remove hop-by-hop / problematic headers
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding");

  const upstream = await fetch(backendUrl, {
    method: req.method,
    headers,
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : req.body,
    redirect: "manual",
  });

  // Keep all upstream headers
  const responseHeaders = new Headers(upstream.headers);

  // Remove ONLY x-accel-buffering if present
  responseHeaders.delete("x-accel-buffering");

  // Keep your other headers
  responseHeaders.set("cache-control", "no-store");
  responseHeaders.set("connection", "keep-alive");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
