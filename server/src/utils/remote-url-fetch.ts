import { LookupAddress } from 'node:dns';
import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

export class UrlNotAllowedError extends Error {}
export class ResponseTooLargeError extends Error {}
export class FetchFailedError extends Error {}

export interface PublicFetchOptions {
  maxBytes: number;
  timeoutMs: number;
  maxRedirects: number;
  allowPrivateNetworks: boolean;
}

const NON_PUBLIC_RANGES = new BlockList();
[
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
].forEach(([network, prefix]) => NON_PUBLIC_RANGES.addSubnet(network as string, prefix as number, 'ipv4'));
[
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
].forEach(([network, prefix]) => NON_PUBLIC_RANGES.addSubnet(network as string, prefix as number, 'ipv6'));

const IPV4_MAPPED_PREFIX = '::ffff:';
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function isPublicAddress(address: string): boolean {
  const unmapped = address.toLowerCase().startsWith(IPV4_MAPPED_PREFIX)
    ? address.slice(IPV4_MAPPED_PREFIX.length)
    : address;
  const family = isIP(unmapped);
  if (family === 4) return !NON_PUBLIC_RANGES.check(unmapped, 'ipv4');
  if (family === 6) return !NON_PUBLIC_RANGES.check(unmapped, 'ipv6');
  return false;
}

async function assertAllowedUrl(url: URL, allowPrivateNetworks: boolean): Promise<void> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new UrlNotAllowedError();
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host)
    ? [host]
    : (await lookup(host, { all: true }).catch((): LookupAddress[] => [])).map((entry) => entry.address);
  if (!addresses.length) throw new FetchFailedError();
  if (!allowPrivateNetworks && !addresses.every(isPublicAddress)) throw new UrlNotAllowedError();
}

async function readLimitedText(response: Response, maxBytes: number): Promise<string> {
  const declaredLength = Number(response.headers.get('content-length'));
  if (declaredLength > maxBytes) throw new ResponseTooLargeError();
  if (!response.body) return '';
  const chunks: Uint8Array[] = [];
  let received = 0;
  for await (const chunk of response.body) {
    received += chunk.byteLength;
    if (received > maxBytes) throw new ResponseTooLargeError();
    chunks.push(chunk);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function fetchRemoteText(rawUrl: string, options: PublicFetchOptions): Promise<string> {
  const signal = AbortSignal.timeout(options.timeoutMs);
  let url = new URL(rawUrl);
  for (let redirects = 0; redirects <= options.maxRedirects; redirects++) {
    await assertAllowedUrl(url, options.allowPrivateNetworks);
    const response = await fetch(url, { redirect: 'manual', signal }).catch(() => {
      throw new FetchFailedError();
    });
    const location = response.headers.get('location');
    if (REDIRECT_STATUSES.has(response.status) && location) {
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) throw new FetchFailedError();
    return readLimitedText(response, options.maxBytes).catch((error) => {
      throw error instanceof ResponseTooLargeError ? error : new FetchFailedError();
    });
  }
  throw new FetchFailedError();
}
