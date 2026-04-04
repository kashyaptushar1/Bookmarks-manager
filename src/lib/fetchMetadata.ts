/**
 * Fetch page title and description from a URL using multiple CORS proxies.
 */
export async function fetchUrlMetadata(url: string): Promise<{ title: string; description: string } | null> {
  const formatted = url.startsWith("http") ? url : `https://${url}`;

  const proxies = [
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  ];

  for (const makeUrl of proxies) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(makeUrl(formatted), { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) continue;

      // Only read first 50KB to avoid downloading huge pages
      const reader = res.body?.getReader();
      if (!reader) continue;

      let html = "";
      const decoder = new TextDecoder();
      while (html.length < 50000) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
      }
      reader.cancel();

      const result = parseMetadata(html);
      if (result) return result;
    } catch {
      continue;
    }
  }

  return null;
}

function parseMetadata(html: string): { title: string; description: string } | null {
  // Parse title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitleMatch =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);

  // Parse description
  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const ogDescMatch =
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);

  const title = (ogTitleMatch?.[1] || titleMatch?.[1] || "").trim();
  const description = (ogDescMatch?.[1] || descMatch?.[1] || "").trim();

  if (!title && !description) return null;
  return { title, description };
}
