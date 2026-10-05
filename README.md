# pls.nfunc.xyz

> Nostr relay pulse — live stats and event feed for one relay.

**Live**: <https://pls.nfunc.xyz>

## Stack

- [Vite](https://vitejs.dev/) + React 18 + TypeScript
- Tailwind CSS
- [Nostrify](https://nostrify.dev/) + TanStack Query

## Nostr

- **Login**: NIP-07 (browser extension) + NIP-55 (Amber callback URI)
- Streams from `wss://relay.nfunc.xyz` and counts what it sees by kind.
- Reads the relay's NIP-11 document for its name, software and limits.

Two cards read a small `relay-stats.json` (event count and database size)
from the relay's host and say N/A where the host does not serve it. The
NIP-05 card checks the relay's pubkey against the names published at
`nfunc.xyz`, and says so when the relay names no pubkey.

## Develop

```bash
npm install
npm run dev
```

## Build + deploy

```bash
./deploy.sh
```

Builds, rsyncs `dist/` to the deploy host and checks the live site serves the
new build.

## The three forks

pls is published three times from three repos: the coral one, the emerald one
and this monochrome one, the nfunc.xyz member. The coloured forks also show a
git (GRASP) relay; nfunc has none, so this fork shows its one relay.

---

_Sister repos: <https://github.com/macos-node/pls.upleb.uk> · <https://github.com/adjmx/pls.fizx.uk>_
