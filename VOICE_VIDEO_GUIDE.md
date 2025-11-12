# 🎙️ Voice & Video Chat Guide

## ภาพรวม

ระบบ Voice & Video Chat ใช้ **PeerJS** (WebRTC) เพื่อให้ผู้เล่นสามารถสื่อสารกันด้วยเสียงและวิดีโอแบบ real-time พร้อมระบบ **Spatial Audio** ที่เสียงจะเปลี่ยนตามระยะห่างในเกม

---

## ✨ Features

### 🎤 Voice Chat
- **เปิด/ปิดเสียง**: คลิกปุ่มโทรศัพท์สีเขียว
- **Mute/Unmute**: คลิกปุ่มไมค์เพื่อเปิด/ปิดไมค์
- **Auto-connect**: เชื่อมต่ออัตโนมัติเมื่อเข้าห้อง

### 📹 Video Chat
- **เปิด/ปิดวิดีโอ**: คลิกปุ่มกล้อง
- **Video Grid**: แสดงวิดีโอของทุกคนที่เปิดกล้อง
- **Mirror view**: วิดีโอของตัวเองจะ mirror เหมือนกระจก

### 🔊 Spatial Audio (3D Audio)
- **เสียงเบาตามระยะไกล**: ยิ่งอยู่ไกล เสียงยิ่งเบา
- **ระยะสูงสุด**: 15 หน่วยในเกม (ปรับได้)
- **เปิด/ปิด Spatial Audio**: คลิกปุ่มลำโพง
- **อัตโนมัติ**: อัปเดตระยะทุก 100ms

---

## 🎮 การใช้งาน

### 1. เข้าห้อง Multiplayer
```
1. เปิด Lobby
2. สร้างห้องหรือเข้าห้องที่มีอยู่
3. ระบบ Voice/Video จะ initialize อัตโนมัติ
```

### 2. เปิดเสียง/วิดีโอ
```
📞 ปุ่มโทรศัพท์: เปิด/ปิด Voice Chat
🎤 ปุ่มไมค์: Mute/Unmute
📹 ปุ่มกล้อง: เปิด/ปิดกล้อง
🔊 ปุ่มลำโพง: เปิด/ปิด Spatial Audio
```

### 3. ดูจำนวนผู้เชื่อมต่อ
แสดงจำนวนคนที่กำลังคุยอยู่ทางด้านขวาของปุ่มควบคุม

---

## 🛠️ Technical Details

### Architecture

```
┌─────────────────────────────────────────┐
│         PeerJS (WebRTC)                 │
│  - P2P connection between players       │
│  - Audio/Video streaming                │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      voiceVideoStore (Zustand)          │
│  - Manage peer connections              │
│  - Handle local/remote streams          │
│  - Spatial audio calculations           │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│        React Components                 │
│  - VoiceVideoControls                   │
│  - VideoGrid                            │
│  - VoiceVideoSync                       │
│  - SpatialAudioManager                  │
└─────────────────────────────────────────┘
```

### Files Structure

```
src/
├── infrastructure/
│   └── webrtc/
│       └── PeerClient.ts              # PeerJS client wrapper
│
├── presentation/
│   ├── stores/
│   │   └── voiceVideoStore.ts         # Voice/Video state management
│   │
│   └── components/game/
│       ├── VoiceVideoControls.tsx     # Control buttons UI
│       ├── VideoGrid.tsx              # Video display grid
│       ├── VoiceVideoSync.tsx         # Auto-connect logic
│       └── SpatialAudioManager.tsx    # Distance-based volume
```

---

## 🔧 Configuration

### Spatial Audio Settings

```typescript
// In voiceVideoStore.ts
maxAudioDistance: 15, // Max distance to hear (units)

// Volume calculation
volume = 1 - (distance / maxAudioDistance)
volume = Math.pow(volume, 2) // Apply curve
```

### PeerJS Server

Currently using **public PeerJS server** (free):
- Host: `0.peerjs.com`
- Port: `443`
- Secure: `true`

**⚠️ สำหรับ Production:**
แนะนำให้ host PeerServer เอง:
```bash
npm install peer
peerjs --port 9000
```

จากนั้นแก้ใน `PeerClient.ts`:
```typescript
this.peer = new Peer(userId, {
  host: "your-server.com",
  port: 9000,
  path: "/myapp",
  secure: true,
});
```

---

## 🎯 How It Works

### 1. Initialization
```
เข้าห้อง → VoiceVideoSync → initialize(myPlayerId) → PeerJS ready
```

### 2. Auto-connect
```
Player joins → Detect new player → callPeer(peerId, username)
```

### 3. Spatial Audio
```
SpatialAudioManager (every 100ms):
  1. Get player positions from multiplayerStore
  2. Calculate distance: √(dx² + dz²)
  3. Calculate volume: 1 - (distance / maxDistance)
  4. Apply to audio track
```

### 4. Video Display
```
VideoGrid:
  - Local video (mirror)
  - Remote videos with username + distance
```

---

## 🐛 Troubleshooting

### ไม่มีเสียง
1. ✅ ตรวจสอบว่าได้กด allow microphone
2. ✅ ตรวจสอบว่าปุ่มโทรศัพท์เป็นสีเขียว
3. ✅ ตรวจสอบว่าไม่ได้กด mute (ปุ่มไมค์)
4. ✅ ตรวจสอบระยะห่าง (ถ้าไกลเกิน 15 units จะไม่ได้ยิน)

### ไม่เห็นวิดีโอ
1. ✅ ตรวจสอบว่าได้กด allow camera
2. ✅ ตรวจสอบว่าปุ่มกล้องเป็นสีน้ำเงิน
3. ✅ ตรวจสอบว่าฝั่งตรงข้ามเปิดกล้อง

### PeerJS connection failed
1. ✅ ตรวจสอบ internet connection
2. ✅ ลอง refresh page
3. ✅ ตรวจสอบว่า PeerJS server ทำงานปกติ
4. ✅ เช็ค browser console สำหรับ error

---

## 📊 Performance Tips

### Optimize Bandwidth
```typescript
// Reduce video quality for better performance
video: { 
  width: 320,   // ลดจาก 640
  height: 240,  // ลดจาก 480
  frameRate: 15 // ลดจาก 30
}
```

### Limit Connections
```typescript
// Set max players per room
maxClients: 10 // ไม่ควรเกิน 10 คนต่อห้อง
```

---

## 🚀 Future Improvements

- [ ] Screen sharing
- [ ] Push-to-talk (PTT)
- [ ] Voice activation detection (VAD)
- [ ] Echo cancellation tuning
- [ ] Bandwidth quality selector
- [ ] Recording capability

---

## 📝 Credits

- **PeerJS**: https://peerjs.com/
- **WebRTC**: https://webrtc.org/

---

**Enjoy voice and video chatting in-game! 🎉**
