# 🎮 Multiplayer System Guide

คู่มือการใช้งานระบบ Multiplayer ของ Open World Town

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Components](#components)
4. [Features](#features)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Next.js Client                         │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Player.tsx   │  │ Connection   │  │   Chat UI       │  │
│  │  (Local)      │  │   UI         │  │                 │  │
│  └───────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│          │                  │                    │           │
│  ┌───────▼──────────────────▼────────────────────▼───────┐  │
│  │          useMultiplayerStore (Zustand)                │  │
│  │     - Connection State                                │  │
│  │     - Players Map                                     │  │
│  │     - Actions (connect, sendMove, sendChat)          │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │        ColyseusClient (Singleton)                     │  │
│  │     - WebSocket Connection                            │  │
│  │     - Room Management                                 │  │
│  └───────────────────────┬───────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────┘
                             │
                    WebSocket (ws://localhost:2567)
                             │
┌────────────────────────────▼───────────────────────────────┐
│                  Colyseus Game Server                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           GameRoom (game_room)                      │   │
│  │  - Max 50 players                                   │   │
│  │  - 60 FPS update loop                               │   │
│  │  - Message handlers (move, chat)                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           GameState (Schema)                        │   │
│  │  - players: MapSchema<Player>                       │   │
│  │  - serverTime: number                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### 1. Environment Setup

Create `.env.local`:

```env
# Colyseus Server
NEXT_PUBLIC_COLYSEUS_HOST=localhost
NEXT_PUBLIC_COLYSEUS_PORT=2567
NEXT_PUBLIC_COLYSEUS_SECURE=false
```

### 2. Start Services

**Option A: Run both together**
```bash
npm run dev:all
```

**Option B: Run separately**
```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - Colyseus Server
npm run dev:server
```

### 3. Connect to Game

1. Open `http://localhost:3000/play`
2. Click **"เข้าร่วมเกม"** in top-right
3. Enter username
4. Click **"เชื่อมต่อ"**

---

## Components

### Client Components

#### 1. **Player.tsx**
Local player with WASD movement and multiplayer sync

```typescript
// Automatically sends position to server every frame
useFrame(() => {
  // ... movement logic
  if (isConnected) {
    sendMove(position, rotation, isMoving);
  }
});
```

#### 2. **MultiplayerPlayers.tsx**
Renders other players with username labels

```typescript
<MultiplayerPlayers />
// - Filters out own player
// - Shows username as Billboard
// - Different colors (purple/orange)
```

#### 3. **ConnectionUI.tsx**
Connection management UI

Features:
- Username input
- Connect/Disconnect buttons
- Player count display
- Connection status (Connected, Connecting, Offline)

#### 4. **ChatUI.tsx**
Real-time chat system

Features:
- Send/receive messages
- Auto-scroll to latest message
- Message history
- Sender identification

### Server Components

#### 1. **GameRoom.ts**
Main game room logic

```typescript
// Server-side room
export class GameRoom extends Room<GameState> {
  maxClients = 50;
  
  onCreate() { /* ... */ }
  onJoin(client, options) { /* ... */ }
  onLeave(client) { /* ... */ }
  onDispose() { /* ... */ }
}
```

#### 2. **GameState.ts**
Synchronized state schema

```typescript
export class GameState extends Schema {
  @type({ map: Player }) players;
  @type("number") serverTime;
}

export class Player extends Schema {
  @type("string") id;
  @type("string") username;
  @type("number") x, y, z;
  @type("number") rotation;
  @type("boolean") isMoving;
}
```

---

## Features

### ✅ Implemented

#### Real-time Position Sync
- **Update Rate**: 60 FPS
- **Latency**: ~16ms (local)
- **Players**: Up to 50 per room

#### Player Management
- Auto-spawn at random position
- Join/leave notifications
- Username display above head
- Different colors for local/remote players

#### Chat System
- Real-time messaging
- Message history
- Sender identification
- Auto-scroll

#### Connection Management
- Username input
- Connection status display
- Player count
- Error handling

### 🚧 Planned

- [ ] Network interpolation for smooth movement
- [ ] Lag compensation
- [ ] Reconnection handling
- [ ] Lobby/room selection
- [ ] Player authentication (Supabase)
- [ ] Voice chat (PeerJS)
- [ ] Player animations
- [ ] Collision detection

---

## API Reference

### useMultiplayerStore

Zustand store for multiplayer state management

```typescript
const {
  // State
  room,           // Colyseus Room instance
  isConnected,    // boolean
  isConnecting,   // boolean
  error,          // string | null
  players,        // Map<string, PlayerData>
  myPlayerId,     // string | null
  
  // Actions
  connect,        // (username: string) => Promise<void>
  disconnect,     // () => Promise<void>
  sendMove,       // (position, rotation, isMoving) => void
  sendChat,       // (message: string) => void
} = useMultiplayerStore();
```

### ColyseusClient

Singleton client for Colyseus connection

```typescript
import { colyseusClient } from "@/src/infrastructure/multiplayer/ColyseusClient";

// Join or create room
const room = await colyseusClient.joinOrCreateRoom("game_room", {
  username: "Player1"
});

// Get available rooms
const rooms = await colyseusClient.getAvailableRooms("game_room");
```

### Server Messages

#### Client → Server

**Move Update**
```typescript
room.send("move", {
  x: number,
  y: number,
  z: number,
  rotation: number,
  isMoving: boolean
});
```

**Chat Message**
```typescript
room.send("chat", {
  text: string
});
```

#### Server → Client

**Player Joined**
```typescript
room.onMessage("player_joined", (data) => {
  // data: { playerId: string, username: string }
});
```

**Player Left**
```typescript
room.onMessage("player_left", (data) => {
  // data: { playerId: string, username: string }
});
```

**Chat Message**
```typescript
room.onMessage("chat", (data) => {
  // data: { playerId: string, message: string, timestamp: number }
});
```

---

## Troubleshooting

### Common Issues

#### 1. **Cannot connect to server**

**Symptom**: Connection UI shows "Failed to connect"

**Solutions**:
```bash
# Check if server is running
curl http://localhost:2567/health

# Restart server
npm run dev:server

# Check environment variables
cat .env.local
```

#### 2. **Players not syncing**

**Symptom**: Other players not moving or updating

**Solutions**:
- Check browser console for errors
- Verify `sendMove()` is being called (add console.log)
- Check server logs for errors
- Ensure `isConnected` is true

#### 3. **Chat messages not sending**

**Symptom**: Messages not appearing for other players

**Solutions**:
- Verify connection status
- Check server room message handlers
- Inspect network tab for WebSocket frames

#### 4. **High latency/lag**

**Symptom**: Delayed player movement

**Solutions**:
```typescript
// Reduce update frequency (in Player.tsx)
let frameCount = 0;
useFrame(() => {
  frameCount++;
  if (frameCount % 2 === 0 && isConnected) { // Every 2 frames
    sendMove(position, rotation, isMoving);
  }
});
```

#### 5. **Server crashes under load**

**Symptom**: Server disconnects with many players

**Solutions**:
```typescript
// In GameRoom.ts - reduce update frequency
this.updateInterval = setInterval(() => {
  this.updateGameState();
}, 1000 / 30); // 30 FPS instead of 60
```

### Debug Tools

#### 1. **Colyseus Monitor**
```
http://localhost:2567/monitor
```
- View active rooms
- Monitor player count
- Inspect state
- Force disconnect

#### 2. **Colyseus Playground**
```
http://localhost:2567
```
- Test room connections
- Simulate multiple clients
- Debug message handlers

#### 3. **Browser DevTools**
```javascript
// Console logs
console.log(useMultiplayerStore.getState());

// Network tab
// Filter: WS (WebSocket)
// View frames and messages
```

---

## Performance Tips

### Client-Side

1. **Throttle position updates**
```typescript
// Send updates every N frames instead of every frame
if (frameCount % 3 === 0) {
  sendMove(...);
}
```

2. **Use network interpolation**
```typescript
// Smooth out network updates
const smoothPosition = useNetworkInterpolation(targetPosition);
```

3. **Limit render distance**
```typescript
// Only render nearby players
const nearbyPlayers = players.filter(p => 
  distance(p, myPlayer) < RENDER_DISTANCE
);
```

### Server-Side

1. **Reduce tick rate**
```typescript
// 30 FPS instead of 60
setInterval(() => { /* ... */ }, 1000 / 30);
```

2. **Broadcast only changes**
```typescript
// Use state delta patches (automatic with Colyseus Schema)
```

3. **Implement player culling**
```typescript
// Only send updates for nearby players
```

---

## Next Steps

1. **Add Interpolation**: Apply `useNetworkInterpolation` to `MultiplayerPlayers.tsx`
2. **Add Animations**: Create player walk/idle animations
3. **Add Lobby**: Room selection UI before joining
4. **Add Auth**: Integrate Supabase authentication
5. **Add Voice**: Implement PeerJS for voice chat

---

## Resources

- [Colyseus Documentation](https://docs.colyseus.io/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Server README](./my-server/README.md)
