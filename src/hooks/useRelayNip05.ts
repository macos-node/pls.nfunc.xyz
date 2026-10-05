import { useQuery } from '@tanstack/react-query';
import { useRelayInfo } from './useRelayInfo';

export interface RelayNip05Result {
  verifiedNames: string[];   // e.g. ["xplbzx@fizx.uk"]
  pubkey: string;
  domain: string;
  contact?: string;
}

// `nip05Domain` is where the names are published when that is not the relay's
// own host (a relay at relay.example whose identities live at example).
export function useRelayNip05(relayWsUrl: string, nip05Domain?: string) {
  const { data: info, isLoading: infoLoading } = useRelayInfo(relayWsUrl);
  const domain = nip05Domain ?? relayWsUrl.replace(/^wss?:\/\//, '').replace(/\/.*$/, '');

  const query = useQuery<RelayNip05Result>({
    queryKey: ['relay-nip05', domain, info?.pubkey],
    enabled: !!info?.pubkey,
    queryFn: async () => {
      const pubkey = info!.pubkey!;
      const res = await fetch(`https://${domain}/.well-known/nostr.json`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error('failed');
      const data: { names: Record<string, string> } = await res.json();
      const verifiedNames = Object.entries(data.names)
        .filter(([, pk]) => pk === pubkey)
        .map(([name]) => `${name}@${domain}`);
      return { verifiedNames, pubkey, domain, contact: info?.contact };
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  // In TanStack Query v5, isLoading = isPending && isFetching.
  // A disabled query (enabled:false, no data) has isPending=true but isFetching=false,
  // so isLoading=false — callers would see no data without a loading signal.
  // Expose a combined flag so the UI can show a spinner until both NIP-11 and
  // NIP-05 have resolved.
  // A relay whose NIP-11 names no pubkey has nothing to verify: the query
  // never runs, so it must not read as loading forever.
  const noPubkey = !infoLoading && !info?.pubkey;
  return { ...query, noPubkey, isLoading: !noPubkey && (infoLoading || query.isPending) };
}
