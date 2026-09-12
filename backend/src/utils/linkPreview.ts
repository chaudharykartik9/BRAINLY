import { lookup } from 'node:dns/promises';
import * as cheerio from 'cheerio';

const PRIVATE_IP_PATTERNS = [
  /^127\./, // loopback
  /^10\./, // private
  /^192\.168\./, // private
  /^169\.254\./, // link-local
  /^172\.(1[6-9]|2\d|3[01])\./, // private
  /^0\./, // "this" network
  /^::1$/, // IPv6 loopback
  /^fe80:/i, // IPv6 link-local
  /^fc00:/i, // IPv6 unique local
  /^fd00:/i, // IPv6 unique local
];

const isPrivateAddress = (ip: string) => PRIVATE_IP_PATTERNS.some((p) => p.test(ip));

const FETCH_TIMEOUT_MS = 3000;
const MAX_RESPONSE_BYTES = 500_000;

export interface LinkPreviewData {
  title?: string;
  description?: string;
  thumbnail?: string;
  author?: string;
}

/**
 * Best-effort OpenGraph scraper for a user-supplied URL. Returns null on any
 * failure (network error, timeout, non-HTML response, private/internal
 * address) — callers should never let this block saving the content itself.
 *
 * SSRF guard: refuses anything that isn't http(s) or that resolves to a
 * private/loopback/link-local address, so a saved link can't be used to probe
 * this server's own internal network.
 */
export const fetchLinkPreview = async (rawUrl: string): Promise<LinkPreviewData | null> => {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.hostname === 'localhost') return null;

  try {
    const { address } = await lookup(url.hostname);
    if (isPrivateAddress(address)) return null;
  } catch {
    return null; // DNS resolution failed — nothing to fetch
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrainlyLinkPreview/1.0)' },
    });

    const contentType = res.headers.get('content-type') ?? '';
    if (!res.ok || !contentType.includes('text/html') || !res.body) return null;

    const html = await readCapped(res.body, MAX_RESPONSE_BYTES);
    const $ = cheerio.load(html);

    const meta = (name: string): string | undefined =>
      $(`meta[property="${name}"]`).attr('content') || $(`meta[name="${name}"]`).attr('content') || undefined;

    const title = meta('og:title') || $('title').first().text().trim() || undefined;
    const description = meta('og:description') || meta('description');
    const thumbnail = meta('og:image');
    const author = meta('og:site_name') || url.hostname.replace(/^www\./, '');

    if (!title && !description && !thumbnail) return null;

    return { title, description, thumbnail, author };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

/** Reads a ReadableStream into a string, stopping once maxBytes is reached. */
async function readCapped(stream: ReadableStream<Uint8Array>, maxBytes: number): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let bytesRead = 0;

  try {
    while (bytesRead < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      result += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  return result;
}
