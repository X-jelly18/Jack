export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const url = new URL(req.url);

  const backendUrl =
    "http://sela.ayanakojivps.shop" +
    url.pathname +
    url.search;

  // ---- Clean request headers ----
  const headers = new Headers(req.headers);

  // Remove identifying / problematic headers
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding");

  headers.delete("x-forwarded-for");
  headers.delete("x-real-ip");
  headers.delete("via");
  headers.delete("cf-connecting-ip");

  // ---- Send request upstream ----
  const upstream = await fetch(backendUrl, {
    method: req.method,
    headers,
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : req.body,
    redirect: "manual",
  });

  // ---- Build minimal response headers ----
  const responseHeaders = new Headers();

  // Only keep essential header
  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";
  responseHeaders.set("content-type", contentType);

  // Optional: disable caching
  responseHeaders.set("cache-control", "no-store");

  // Optional: keep connection alive
  responseHeaders.set("connection", "keep-alive");

  // ---- Return streamed response ----
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
