# Aircab — Find people around you who are going your way

Offline-first, peer-to-peer airport companion for iOS + Android. No backend, no login, no cloud. React Native (bare, compiles to true native) with **native P2P transports** + shared mesh protocol.

## 1. Research: how BitChat does it (and what we borrow)

BitChat (Jack Dorsey, July 2025) is BLE-mesh chat: every phone is simultaneously GATT central + peripheral, advertising itself and scanning for others. Received packets are **controlled-flooded** to all peers except ingress (split-horizon), with:

- `TTL 7` (clamped to 5 in dense graphs), decremented per hop, signature excludes TTL
- LRU seen-set (~1000 ids, 5-min expiry) + random jitter (10–220 ms) for duplicate suppression
- Deterministic fanout subsetting (~log₂ degree) instead of full broadcast
- Fragmentation (~469 B) / reassembly, signed announces every 4 s (isolated) → 15–30 s (connected), 60 s reachability window
- Noise `XX_25519_ChaChaPoly_SHA256` sessions for private traffic; sealed outbox (100/peer, 24 h) + spray-and-wait couriers + GCS history sync + Nostr fallback when online

Aircab v1 borrows the offline core at airport scale — **TTL 4 flood, LRU dedup, jitter, split-horizon, announce + chat + ack packets, per-peer outbox** — and deliberately omits Nostr/internet (spec: offline-first, no backend).

## 2. Platform limitations (designed around, not against)

| | iOS | Android |
|---|---|---|
| Right tool | **CoreBluetooth GATT** custom service (`ios/AircabMesh.swift`) | **Nearby Connections `P2P_CLUSTER`** (BT+BLE+Wi-Fi, encrypted) + BLE-GATT fallback for iOS interop (`android/AircabMesh.kt`) |
| Why not MPC | MultipeerConnectivity is iOS-only, deprecated (Xcode 27), unstable >7 peers, stops in background | N/A — MPC can't talk to Android at all |
| Background | Throttled; background↔background discovery often fails; best-effort relay via restoration IDs + ~30 s tasks | OEM-throttled; Nearby needs radios on + location perm; foreground is reliable |
| Bandwidth | BLE-grade: text only, ≤500 chars, fragmented | BYTES payloads ≤32 KB; we use the same ~500 B packets |

UX rule: connectivity states are `● Nearby / ● Offline / ↻ Connecting / ✓ Connected` — never Bluetooth jargon. History lives on-device only.

## 3. Architecture

```
Screens (src/screens) → App state (src/App.tsx)
Design system (src/design) ← Core (identity/matching/groups/chat/storage)
P2P: protocol.ts + mesh.ts (shared, tested) → Transport
  → nativeBridge (AircabMesh TurboModule) → iOS CoreBluetooth / Android Nearby
  → MockTransport fallback (simulators, screenshots)
```

- Shared wire protocol (`src/p2p/protocol.ts`): `v/type/id/from/groupId/ttl/at/body{name,city,area,text,ref}`, one service UUID both platforms.
- Matching v1: exact `city + area` buckets, same-way first. No GPS, no addresses — area strings only.
- Groups: max 4, joinable only via Nearby/Your-Way, leave anytime, full = closed, multi-membership.
- Chat: text + timestamps + `queued/sent/delivered/failed`, persisted locally, outbox flushed on reconnect.
- Storage: `KVStore` interface (identity, destination, groups, messages, blocked); RN wires to MMKV/SQLite. `wipeLocalData()` for privacy.
- Privacy: block user, leave group, disconnect, delete local data. Only destination area is ever advertised.

## 4. Run

Prerequisites (one-time, already done on this machine):
```bash
# JDK 17 for Gradle (RN 0.76 supports 17–20; no sudo needed)
# installed to ~/.jdks/jdk-17.0.20.1+1
export JAVA_HOME=$HOME/.jdks/jdk-17.0.20.1+1/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH
# iOS simulator runtime: xcodebuild -downloadPlatform iOS (once)
brew install cocoapods  # iOS deps
```

```bash
npm install
npm run typecheck   # clean
npm test            # 6/6 pass
npm start           # Metro (leave running for Debug builds)

# Android (emulator must be booted, or a device attached)
npm run android

# iOS (Debug on simulator)
npx react-native run-ios --simulator "Aircab-iPhone16"
# or: pod install in ios/, then build the Aircab scheme in Xcode
```

Verified end-to-end on this machine:
- `assembleDebug` → BUILD SUCCESSFUL; APK installed on Pixel emulator,
  Welcome screen renders.
- iOS `BUILD SUCCEEDED` (simulator); app installed + launched, Welcome
  screen renders (screenshot-verified).
- Metro bundles for both platforms (~930 KB each).

Notes:
- `metro.config.js` sets `resolver.useWatchman: false` because the
  watchman daemon is blocked by macOS privacy controls on this machine.
  Delete that block after granting Full Disk Access to watchman/Terminal.
- iOS simulator has no bluetoothd: `AircabMesh.start()` resolves
  immediately there (Offline/Searching UX). Real P2P needs two physical
  devices. Same for a single Android emulator — Nearby needs real radios.
- Debug builds load JS from Metro; keep `npm start` running.

Smallest end-to-end flow: **Setup (destination) → Nearby → People Going Your Way → join/create group → group chat → offline queue + reconnect flush**, all working on simulators via `MockTransport` and on devices via native modules.

## 5. Layout

```
src/App.tsx  screens/  navigation/  design/  core/  p2p/  data/
ios/AircabMesh.swift  android/AircabMesh.kt  __tests__/
```
# AirCab
